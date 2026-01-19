use crate::filesystem;
use log::error;
use specta::export;
use tauri::{Builder, Runtime};

pub fn init<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    // Export specta typescript definitions
    #[cfg(debug_assertions)] // <- Only export on non-release builds
    match export::ts("../src/bindings/types.ts.generated") {
        Ok(_) => {}
        Err(e) => error!("specta types export error: {:?}", e),
    }

    // Register tauri commands
    builder
        .invoke_handler(tauri::generate_handler![
            filesystem::import::trigger_import_files,
            filesystem::import::set_import_slowdown_delay,
            filesystem::import::set_import_batch_chunk_count,
            filesystem::import::set_import_async,
            filesystem::watcher::start_watching,
            filesystem::watcher::stop_watching,
        ])
}
