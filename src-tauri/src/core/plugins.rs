use super::ext::BuilderExt;
use super::logging;
use tauri::{Builder, Runtime};

pub fn init<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder
        .plugin(tauri_plugin_opener::init())
        .register(logging::init)
}
