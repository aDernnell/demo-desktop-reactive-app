use log::{error, info};
use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{
    new_debouncer_opt, Config, DebouncedEvent, DebouncedEventKind, Debouncer,
};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{channel, Sender};
use std::sync::{Arc, Mutex};
use std::thread::{self, JoinHandle};
use std::time::Duration;
use tauri::{AppHandle, Builder, Emitter, Runtime};

use super::import::{import_yaml, Framework, ImportError};

#[derive(thiserror::Error, Debug)]
enum WatcherError {
    #[error("Failed to create watcher: {0}")]
    WatchError(notify::Error),

    #[error("Failed to unwatch: {0}")]
    UnwatchError(notify::Error),
}

impl From<WatcherError> for String {
    fn from(err: WatcherError) -> String {
        err.to_string()
    }
}

type Result<T> = std::result::Result<T, WatcherError>;

#[derive(Default)]
pub struct Watchers {
    watchers: Mutex<HashMap<PathBuf, FileWatcher>>,
}

pub struct FileWatcher(Debouncer<RecommendedWatcher>);

#[derive(Clone, serde::Serialize, specta::Type)]
pub struct FsChangesChunk {
    updates: HashMap<String, Framework>,
    deletes: Vec<String>,
}

/**
 * Batch process a temporal proximity group of filesystem events
 * that were debouced by notify_debouncer_mini and buffered by watcher_thread
 */
fn handle_grouped_debounced_events<R: Runtime>(app: &AppHandle<R>, events: Vec<DebouncedEvent>) {
    let mut updates: HashMap<String, Framework> = HashMap::new();
    let mut deletes: Vec<String> = Vec::new();

    for event in events
        .into_iter()
        .filter(|event| event.kind == DebouncedEventKind::Any)
        .filter(|event| event.path.extension().map_or(false, |ext| ext == "yaml" || ext == "yml" ))
    {
        match import_yaml(&event.path) {
            Ok((unique_id, metadata)) => {
                updates.insert(unique_id, metadata);
            }
            Err(ImportError::ReadFileError(_)) => {
                deletes.push(String::from(event.path.to_string_lossy()));
            }
            Err(e) => {
                error!("{} - {}", e, event.path.display());
            }
        };
    }

    let _ = app.emit("watcher://fs-change", FsChangesChunk { updates, deletes });
}

/**
 * Start a thread that listen to debounced events from filesystem.
 * Received events are pushed in a buffer that will be processed afterwards.
 * The processing is done in another thread, allowing to group events by temporal proximity and process them in batch.
 */
fn start_watcher_thread<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
) -> (
    JoinHandle<()>,
    Sender<std::result::Result<Vec<DebouncedEvent>, notify::Error>>,
) {
    let (watcher_tx, watcher_rx) = channel();

    let watcher_thread = thread::spawn(move || {
        // buffer used to store debounced events
        let event_buffer = Arc::new(Mutex::new(Vec::new()));
        // used to test if buffer processing is scheduled
        let is_process_scheduled = Arc::new(AtomicBool::new(false));

        let (_, schedule_tx) = {
            let path = path.clone();
            let event_buffer: Arc<Mutex<Vec<DebouncedEvent>>> = Arc::clone(&event_buffer);
            let is_process_scheduled: Arc<AtomicBool> = Arc::clone(&is_process_scheduled);

            start_processing_thread(app, path, event_buffer, is_process_scheduled)
        };

        // wait for debounced filesystem event
        while let Ok(event) = watcher_rx.recv() {
            if let Ok(events) = event {
                // If no schedule task for buffer processing, create one by waking up process thread
                if !is_process_scheduled.load(Ordering::Relaxed) {
                    schedule_tx.send(()).unwrap();
                    is_process_scheduled.store(true, Ordering::Relaxed);
                }
                // append events in the buffer to be handled by scheduled task
                let mut event_buffer = event_buffer.lock().unwrap();
                event_buffer.extend(events);
            }
        }
        info!("Watcher thread stopped for {:?}", path);
        drop(schedule_tx); // not needed, but explicit to indicate that schedule_rx is waked up with Err and schedule thread ends
    });

    (watcher_thread, watcher_tx)
}

/**
 * Start a thread that listen on a channel to be waked up (channel expects empty message).
 * On each wakeup, the shared buffer is processed after timeout.
 * If a previous buffer processing is still ongoing while wakeup is received, then timeout beginning is postponed after this processing ends.
 * The guard condition (is_process_scheduled) is updated, allowing the caller thread to send wakeup message only when previous timeout is over.
 */
fn start_processing_thread<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    event_buffer: Arc<Mutex<Vec<DebouncedEvent>>>,
    is_process_scheduled: Arc<AtomicBool>,
) -> (JoinHandle<()>, Sender<()>) {
    let (schedule_tx, schedule_rx) = channel();

    let schedule_thread = thread::spawn(move || {
        // wait for wakeup event
        while let Ok(_event) = schedule_rx.recv() {
            // 1. wait for event to be pushed in buffer by watcher thread
            // 2. move events out of buffer
            // 3. set is_process_scheduled to false, allowing for another processing schedule
            // 4. process events
            thread::sleep(Duration::from_millis(500));
            let mut event_buffer = event_buffer.lock().unwrap();
            let mut events = Vec::with_capacity(event_buffer.len());
            events.append(&mut event_buffer);
            drop(event_buffer); // release mutex before end of scope
            is_process_scheduled.store(false, Ordering::Relaxed);
            handle_grouped_debounced_events(&app, events);
        }
        info!("Schedule thread stopped for {:?}", path);
    });

    (schedule_thread, schedule_tx)
}

fn start_file_watcher<R: Runtime>(app: AppHandle<R>, path: PathBuf) -> Result<FileWatcher> {
    let (_, watcher_tx) = start_watcher_thread(app, path);

    let config = Config::default()
        .with_timeout(Duration::from_millis(500))
        .with_batch_mode(false)
        .with_notify_config(notify::Config::default());

    let debouncer =
        new_debouncer_opt(config, watcher_tx).map_err(|e| WatcherError::WatchError(e))?;

    Ok(FileWatcher(debouncer))
}

#[tauri::command]
pub fn start_watching<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<Watchers>,
    path: String,
) -> std::result::Result<(), String> {
    let mut file_watcher = start_file_watcher(app, PathBuf::from(&path))?;
    let FileWatcher(ref mut debouncer) = file_watcher;
    let _ = debouncer
        .watcher()
        .watch(Path::new(&path), RecursiveMode::Recursive);

    let mut watchers = state.watchers.lock().unwrap();
    watchers.insert(PathBuf::from(&path), file_watcher);

    info!("Started watching path: {:?}", path);
    Ok(())
}

#[tauri::command]
pub fn stop_watching(
    state: tauri::State<Watchers>,
    path: String,
) -> std::result::Result<(), String> {
    let mut watchers = state.watchers.lock().unwrap();

    if let Some(FileWatcher(mut debouncer)) = watchers.remove(&PathBuf::from(&path)) {
        match debouncer.watcher().unwatch(Path::new(&path)) {
            Ok(_) => info!("Stopped watching path: {:?}", path),
            Err(e) => {
                error!("Unable to unwatch path: {:?}", path);
                return Err(String::from(WatcherError::UnwatchError(e)));
            }
        };
        drop(debouncer); // not needed, but explicit to indicate that tx owned by the watcher is droped and thus rx is waked with Err and thread ends
    } else {
        info!("No active watcher for path: {:?}", path);
    }

    Ok(())
}

pub fn init<R: Runtime>(builder: Builder<R>) -> Builder<R> {
    builder.manage(Watchers::default())
}
