use std::fs;
use std::path::Path;

use crate::font_model::ScannedFont;

const FONT_EXTENSIONS: &[&str] = &["ttf", "otf", "ttc", "woff", "woff2"];
const PARSEABLE_FONT_EXTENSIONS: &[&str] = &["ttf", "otf", "ttc"];

#[derive(Debug, Default, PartialEq, Eq)]
struct FontNameMetadata {
    family: Option<String>,
    style: Option<String>,
    full_name: Option<String>,
    version: Option<String>,
    vendor: Option<String>,
    copyright: Option<String>,
    is_variable: bool,
}

#[tauri::command]
pub async fn scan_font_directory(path: String) -> Result<Vec<ScannedFont>, String> {
    tauri::async_runtime::spawn_blocking(move || scan_font_directory_sync(path))
        .await
        .map_err(|error| format!("Font scan task failed: {}", error))?
}

fn scan_font_directory_sync(path: String) -> Result<Vec<ScannedFont>, String> {
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
        let fallback_name = path
            .file_stem()
            .and_then(|value| value.to_str())
            .unwrap_or("Unknown Font")
            .to_string();
        let font_metadata = read_font_name_metadata(&path, &extension);
        let has_internal_name = font_metadata.full_name.is_some() || font_metadata.family.is_some();
        let name = font_metadata
            .full_name
            .clone()
            .or_else(|| font_metadata.family.clone())
            .unwrap_or_else(|| fallback_name.clone());
        let family = font_metadata
            .family
            .clone()
            .unwrap_or_else(|| fallback_name.clone());
        let style = font_metadata
            .style
            .clone()
            .unwrap_or_else(|| "Regular".to_string());
        let path_string = path.to_string_lossy().to_string();
        let file_name = path
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or("")
            .to_string();

        fonts.push(ScannedFont {
            id: path_string.clone(),
            name,
            name_source: if has_internal_name { "metadata" } else { "file_name" }.to_string(),
            family,
            style,
            source: "custom".to_string(),
            path: path_string,
            file_name,
            format: extension,
            file_size: format_file_size(metadata.len()),
            is_variable: font_metadata.is_variable,
            version: font_metadata.version.unwrap_or_default(),
            vendor: font_metadata.vendor.unwrap_or_default(),
            copyright: font_metadata.copyright.unwrap_or_default(),
        });
    }

    Ok(())
}

fn read_font_name_metadata(path: &Path, extension: &str) -> FontNameMetadata {
    if !PARSEABLE_FONT_EXTENSIONS.contains(&extension) {
        return FontNameMetadata::default();
    }

    let Ok(data) = fs::read(path) else {
        return FontNameMetadata::default();
    };

    parse_font_name_metadata(&data).unwrap_or_default()
}

fn parse_font_name_metadata(data: &[u8]) -> Option<FontNameMetadata> {
    let face = ttf_parser::Face::parse(data, 0).ok()?;
    let mut metadata = FontNameMetadata {
        is_variable: face.is_variable(),
        ..FontNameMetadata::default()
    };

    metadata.family = best_name(&face, ttf_parser::name_id::TYPOGRAPHIC_FAMILY)
        .or_else(|| best_name(&face, ttf_parser::name_id::FAMILY));
    metadata.style = best_name(&face, ttf_parser::name_id::TYPOGRAPHIC_SUBFAMILY)
        .or_else(|| best_name(&face, ttf_parser::name_id::SUBFAMILY));
    metadata.full_name = best_name(&face, ttf_parser::name_id::FULL_NAME)
        .or_else(|| best_name(&face, ttf_parser::name_id::COMPATIBLE_FULL));
    metadata.version = best_name(&face, ttf_parser::name_id::VERSION);
    metadata.vendor = best_name(&face, ttf_parser::name_id::MANUFACTURER);
    metadata.copyright = best_name(&face, ttf_parser::name_id::COPYRIGHT_NOTICE);

    Some(metadata)
}

fn best_name(face: &ttf_parser::Face<'_>, name_id: u16) -> Option<String> {
    face.names()
        .into_iter()
        .filter(|name| name.name_id == name_id && name.is_unicode())
        .filter_map(|name| {
            let value = normalize_metadata_name(name.to_string()?)?;
            Some((metadata_name_score(&name, &value), value))
        })
        .max_by_key(|(score, _)| *score)
        .map(|(_, value)| value)
}

fn normalize_metadata_name(name: String) -> Option<String> {
    let value = name
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .trim()
        .to_string();

    if is_suspicious_metadata_name(&value) {
        None
    } else {
        Some(value)
    }
}

fn metadata_name_score(name: &ttf_parser::name::Name<'_>, value: &str) -> i32 {
    language_score(name.language_id)
        + platform_score(name.platform_id)
        + character_quality_score(value)
}

fn language_score(language_id: u16) -> i32 {
    match language_id {
        0x0804 | 0x0404 | 0x0c04 | 0x1004 | 0x1404 => 100, // zh-CN/TW/HK/SG/MO
        0x0411 => 95,                                    // ja-JP
        0x0412 => 90,                                    // ko-KR
        0x0409 | 0x0809 => 85,                           // en-US/en-GB
        0 => 50,
        _ => 40,
    }
}

fn platform_score(platform_id: ttf_parser::PlatformId) -> i32 {
    match platform_id {
        ttf_parser::PlatformId::Windows => 30,
        ttf_parser::PlatformId::Unicode => 20,
        _ => 0,
    }
}

fn character_quality_score(value: &str) -> i32 {
    let mut score = 0;
    if value.chars().any(is_cjk) {
        score += 25;
    }
    if value.chars().any(|ch| ch.is_ascii_alphabetic()) {
        score += 10;
    }
    score - (value.chars().filter(|ch| *ch == '?').count() as i32 * 20)
}

fn is_suspicious_metadata_name(value: &str) -> bool {
    if value.is_empty() || value.contains('\u{fffd}') {
        return true;
    }

    if value
        .chars()
        .any(|ch| ch.is_control() && !ch.is_whitespace())
    {
        return true;
    }

    let non_space_count = value.chars().filter(|ch| !ch.is_whitespace()).count();
    let question_count = value.chars().filter(|ch| *ch == '?').count();
    question_count >= 2 && question_count * 3 >= non_space_count
}

fn is_cjk(ch: char) -> bool {
    matches!(
        ch as u32,
        0x3400..=0x4dbf
            | 0x4e00..=0x9fff
            | 0xf900..=0xfaff
            | 0x3040..=0x30ff
            | 0xac00..=0xd7af
    )
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

    use super::{normalize_metadata_name, scan_font_directory_sync};

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

        let fonts = scan_font_directory_sync(dir.path().to_string_lossy().to_string())
            .expect("scan should succeed");

        let names = fonts.iter().map(|font| font.name.as_str()).collect::<Vec<_>>();
        assert_eq!(names, vec!["Alpha Sans", "Beta Serif"]);
        assert_eq!(fonts[0].format, "ttf");
        assert_eq!(fonts[0].name_source, "file_name");
        assert_eq!(fonts[0].file_name, "Alpha Sans.ttf");
        assert_eq!(fonts[0].file_size, "2.0 KB");
        assert_eq!(fonts[0].style, "Regular");
        assert!(!fonts[0].is_variable);
        assert!(fonts[0].path.ends_with("Alpha Sans.ttf"));
        assert_eq!(fonts[1].format, "otf");
    }

    #[test]
    fn falls_back_to_file_name_when_internal_metadata_is_unreadable() {
        let dir = TestDir::new("fallback");
        dir.write_file("Unreadable Internal Name.ttf", &[0; 128]);

        let fonts = scan_font_directory_sync(dir.path().to_string_lossy().to_string())
            .expect("scan should succeed");

        assert_eq!(fonts[0].name, "Unreadable Internal Name");
        assert_eq!(fonts[0].name_source, "file_name");
        assert_eq!(fonts[0].family, "Unreadable Internal Name");
        assert_eq!(fonts[0].style, "Regular");
        assert_eq!(fonts[0].version, "");
        assert_eq!(fonts[0].vendor, "");
        assert_eq!(fonts[0].copyright, "");
    }

    #[test]
    fn rejects_missing_directory() {
        let dir = TestDir::new("missing");
        let missing = dir.path().join("missing");

        let error = scan_font_directory_sync(missing.to_string_lossy().to_string())
            .expect_err("missing directory should fail");

        assert!(error.contains("Directory does not exist"));
    }

    #[test]
    fn rejects_question_mark_placeholder_names() {
        assert_eq!(normalize_metadata_name("???? W01".to_string()), None);
        assert_eq!(normalize_metadata_name("?????????? Regular".to_string()), None);
    }

    #[test]
    fn keeps_readable_metadata_names() {
        assert_eq!(
            normalize_metadata_name("  TsangerFeiBai   W01  ".to_string()),
            Some("TsangerFeiBai W01".to_string())
        );
        assert_eq!(
            normalize_metadata_name("筑紫A丸ゴシック".to_string()),
            Some("筑紫A丸ゴシック".to_string())
        );
    }
}
