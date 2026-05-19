use std::fs;
use std::path::Path;

use crate::font_model::ScannedFont;

const FONT_EXTENSIONS: &[&str] = &["ttf", "otf", "ttc", "woff", "woff2"];

#[tauri::command]
pub fn scan_font_directory(path: String) -> Result<Vec<ScannedFont>, String> {
    let root = Path::new(&path);
    if !root.exists() {
        return Err(format!("Directory does not exist: {}", root.display()));
    }
    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", root.display()));
    }

    let mut fonts = Vec::new();
    scan_dir(root, &mut fonts)?;
    fonts.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(fonts)
}

fn scan_dir(dir: &Path, fonts: &mut Vec<ScannedFont>) -> Result<(), String> {
    let entries = fs::read_dir(dir)
        .map_err(|error| format!("Failed to read {}: {}", dir.display(), error))?;

    for entry in entries {
        let entry = entry.map_err(|error| error.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            scan_dir(&path, fonts)?;
            continue;
        }

        let Some(extension) = path.extension().and_then(|value| value.to_str()) else {
            continue;
        };
        let extension = extension.to_lowercase();
        if !FONT_EXTENSIONS.contains(&extension.as_str()) {
            continue;
        }

        let metadata = fs::metadata(&path)
            .map_err(|error| format!("Failed to read {}: {}", path.display(), error))?;
        let name = path
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("Unknown Font")
            .to_string();
        let path_string = path.to_string_lossy().to_string();

        fonts.push(ScannedFont {
            id: path_string.clone(),
            name: name.clone(),
            family: name,
            style: "Regular".to_string(),
            source: "custom".to_string(),
            path: path_string,
            format: extension,
            file_size: format_file_size(metadata.len()),
        });
    }

    Ok(())
}

fn format_file_size(bytes: u64) -> String {
    const KB: f64 = 1024.0;
    const MB: f64 = KB * 1024.0;

    let size = bytes as f64;
    if size >= MB {
        format!("{:.1} MB", size / MB)
    } else {
        format!("{:.1} KB", size / KB)
    }
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::{Path, PathBuf};
    use std::time::{SystemTime, UNIX_EPOCH};

    use super::scan_font_directory;

    struct TestDir {
        path: PathBuf,
    }

    impl TestDir {
        fn new(name: &str) -> Self {
            let stamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system clock should be after unix epoch")
                .as_nanos();
            let path = std::env::temp_dir().join(format!(
                "font-manager-{}-{}-{}",
                name,
                std::process::id(),
                stamp
            ));
            fs::create_dir_all(&path).expect("test directory should be created");
            Self { path }
        }

        fn path(&self) -> &Path {
            &self.path
        }

        fn write_file(&self, relative: &str, bytes: &[u8]) {
            let path = self.path.join(relative);
            if let Some(parent) = path.parent() {
                fs::create_dir_all(parent).expect("parent directory should be created");
            }
            fs::write(path, bytes).expect("test file should be written");
        }
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn scans_font_files_recursively_and_ignores_non_fonts() {
        let dir = TestDir::new("recursive");
        dir.write_file("Alpha Sans.ttf", &[0; 2048]);
        dir.write_file("nested/Beta Serif.OTF", &[0; 512]);
        dir.write_file("notes.txt", b"not a font");

        let fonts = scan_font_directory(dir.path().to_string_lossy().to_string())
            .expect("scan should succeed");

        let names = fonts.iter().map(|font| font.name.as_str()).collect::<Vec<_>>();
        assert_eq!(names, vec!["Alpha Sans", "Beta Serif"]);
        assert_eq!(fonts[0].format, "ttf");
        assert_eq!(fonts[0].file_size, "2.0 KB");
        assert!(fonts[0].path.ends_with("Alpha Sans.ttf"));
        assert_eq!(fonts[1].format, "otf");
    }

    #[test]
    fn rejects_missing_directory() {
        let dir = TestDir::new("missing");
        let missing = dir.path().join("missing");

        let error = scan_font_directory(missing.to_string_lossy().to_string())
            .expect_err("missing directory should fail");

        assert!(error.contains("Directory does not exist"));
    }
}
