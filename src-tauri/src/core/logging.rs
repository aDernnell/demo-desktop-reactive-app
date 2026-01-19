use tauri::{plugin::TauriPlugin, Builder, Runtime};
use tauri_plugin_log::{fern::colors::ColoredLevelConfig, Target, TargetKind};

pub fn build_plugin<R: Runtime>() -> TauriPlugin<R> {
    tauri_plugin_log::Builder::new()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir { file_name: None }),
        ])
        .with_colors(ColoredLevelConfig::default())
        .build()
}

pub fn init<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder.plugin(build_plugin())
}
