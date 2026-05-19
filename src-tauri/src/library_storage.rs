use std::fs;
use std::path::{Path, PathBuf};

use serde_json::Value;
use tauri::{AppHandle, Manager};

const LIBRARY_FILE_NAME: &str = "font-library.json";

#[tauri::command]
pub fn load_font_library(app: AppHandle) -> Result<Option<Value>, String> {
    let path = library_file_path(&app)?;
    read_library_file(&path)
}

#[tauri::command]
pub fn save_font_library(app: AppHandle, library: Value) -> Result<(), String> {
    let path = library_file_path(&app)?;
    write_library_file(&path, &library)
}

fn library_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Failed to resolve app data directory: {}", error))?;
    Ok(dir.join(LIBRARY_FILE_NAME))
}

fn read_library_file(path: &Path) -> Result<Option<Value>, String> {
    if !path.exists() {
        return Ok(None);
    }

    let text = fs::read_to_string(path)
        .map_err(|error| format!("Failed to read {}: {}", path.display(), error))?;
    let value = serde_json::from_str(&text)
        .map_err(|error| format!("Failed to parse {}: {}", path.display(), error))?;
    Ok(Some(value))
}

fn write_library_file(path: &Path, library: &Value) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("Failed to create {}: {}", parent.display(), error))?;
    }

    let text = serde_json::to_string_pretty(library)
        .map_err(|error| format!("Failed to serialize font library: {}", error))?;
    fs::write(path, text)
        .map_err(|error| format!("Failed to write {}: {}", path.display(), error))
}

#[cfg(test)]
mod tests {
    use std::fs;
    use std::path::{Path, PathBuf};
    use std::time::{SystemTime, UNIX_EPOCH};

    use serde_json::json;

    use super::{read_library_file, write_library_file};

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
                "font-manager-storage-{}-{}-{}",
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
    }

    impl Drop for TestDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.path);
        }
    }

    #[test]
    fn missing_library_file_returns_none() {
        let dir = TestDir::new("missing");
        let path = dir.path().join("font-library.json");

        let library = read_library_file(&path).expect("read should succeed");

        assert_eq!(library, None);
    }

    #[test]
    fn writes_and_reads_library_json() {
        let dir = TestDir::new("roundtrip");
        let path = dir.path().join("nested").join("font-library.json");
        let expected = json!({
            "directories": ["E:/Fonts"],
            "lastScannedAt": "2026-05-19T12:00:00.000Z",
            "fonts": [{ "id": "font-1", "name": "Test Font" }]
        });

        write_library_file(&path, &expected).expect("write should succeed");
        let actual = read_library_file(&path).expect("read should succeed");

        assert_eq!(actual, Some(expected));
    }
}
