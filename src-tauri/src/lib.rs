mod font_model;
mod font_scan;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![font_scan::scan_font_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
