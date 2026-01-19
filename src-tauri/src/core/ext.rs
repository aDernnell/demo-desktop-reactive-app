use tauri::{Builder, Runtime};

/// A [`tauri::Builder`] extension that provides extra methods for convenience
pub trait BuilderExt<R> {
    /// Register a new function in the [`tauri::Builder`] workflow.
    ///
    /// This function can add plugin, managed state, event_handler etc.
    fn register<F>(self, f: F) -> Builder<R>
    where
        F: Fn(Builder<R>) -> Builder<R> + Send + Sync + 'static,
        R: Runtime;
}

impl<R: Runtime> BuilderExt<R> for Builder<R> {
    fn register<F>(self, f: F) -> Builder<R>
    where
        F: Fn(Builder<R>) -> Builder<R> + Send + Sync + 'static,
    {
        f(self)
    }
}
