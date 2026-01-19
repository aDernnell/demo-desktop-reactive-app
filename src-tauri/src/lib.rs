use core::ext::BuilderExt;

mod binding;
mod core;
mod filesystem;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            filesystem::import::init_state_management(app);
            Ok(())
        })
        .plugin(tauri_plugin_dialog::init())
        .register(core::plugins::init)
        .register(binding::specta::init)
        .register(filesystem::watcher::init)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
