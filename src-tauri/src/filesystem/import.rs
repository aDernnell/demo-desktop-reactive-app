use log::{error, info, warn};
use std::fs::File;
use std::io::Read;
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::{collections::HashMap, thread, time::Duration};
use tauri::{App, AppHandle, Emitter, Manager, Runtime, State};
use thiserror::Error;
use walkdir::WalkDir;
use yaml_rust2::YamlLoader;

#[derive(Error, Debug)]
pub enum ImportError {
    #[error("Failed to read file - {0}")]
    ReadFileError(#[from] std::io::Error),

    #[error("Failed to emit event to frontend - {0}")]
    EmitEventError(#[from] tauri::Error),

    #[error("Too many files - {0}")]
    TooManyFiles(#[from] std::num::TryFromIntError),

    #[error("Failed to parse YAML - {0}")]
    YamlParseError(String),
}

type Result<T> = std::result::Result<T, ImportError>;

#[derive(Clone, serde::Serialize, specta::Type)]
pub struct Framework {
    pub path: String,
    pub name: String,
    pub homepage_url: String,
    pub description: String,
    pub entity_type: String,
}

#[derive(Clone, serde::Serialize, specta::Type)]
pub struct ImportFilesChunk<'a> {
    pub command_id: &'a str,
    pub total_file_count: u32,
    pub process_file_count: u32,
    pub frameworks: HashMap<String, Framework>,
}

#[derive(Clone, serde::Serialize, specta::Type)]
pub struct ImportFilesEnd<'a> {
    pub command_id: &'a str,
    pub total_file_count: u32,
    pub process_file_count: u32,
    pub success_file_count: u32,
    pub failure_file_count: u32,
}

#[derive(Default)]
pub struct ImportConfig {
    pub slowdown_delay_ms: Arc<Mutex<u64>>,
    pub batch_chunk_count: Arc<Mutex<u32>>,
    pub async_import: Arc<Mutex<bool>>,
}

pub fn init_state_management<R: Runtime>(app: &App<R>) {
    app.manage(ImportConfig {
        slowdown_delay_ms: Arc::new(Mutex::new(0)),
        batch_chunk_count: Arc::new(Mutex::new(10)),
        async_import: Arc::new(Mutex::new(false)),
    });
}

pub fn import_yaml(path: &Path) -> Result<(String, Framework)> {
    let mut content = String::new();
    {
        let mut file = File::open(path)?;
        file.read_to_string(&mut content)?;
    }
    let docs = YamlLoader::load_from_str(&content)
        .map_err(|e| ImportError::YamlParseError(e.to_string()))?;
    let doc = &docs[0];

    Ok((
        doc["id"].as_str().unwrap_or_default().to_string(),
        Framework {
            path: path.to_string_lossy().to_string(),
            name: doc["name"].as_str().unwrap_or_default().to_string(),
            homepage_url: doc["homepageUrl"].as_str().unwrap_or_default().to_string(),
            description: doc["description"].as_str().unwrap_or_default().to_string(),
            entity_type: doc["entityType"].as_str().unwrap_or_default().to_string(),
        },
    ))
}

fn count_yaml_files<P: AsRef<Path>>(dir_path: P) -> usize {
    WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .map_or(false, |ext| ext == "yaml" || ext == "yml" )
        })
        .count()
}

fn process_import<R: Runtime>(
    app: AppHandle<R>,
    dir_path: &str,
    command_id: &str,
) -> Result<(u32, u32, u32)> {
    let mut frameworks_buffer: HashMap<String, Framework> = HashMap::new();
    let mut batch_file_count = 0u32;
    let mut process_file_count = 0u32;
    let mut import_file_count = 0u32;

    let total_file_count = count_yaml_files(dir_path);
    info!("{} files found in {}", total_file_count, dir_path);
    let total_file_count: u32 = total_file_count.try_into()?;

    // Get slowdown delay initial value
    let mut slowdown_delay_ms = app
        .state::<ImportConfig>()
        .slowdown_delay_ms
        .lock()
        .unwrap()
        .clone();
    let mut batch_chunk_count = app
        .state::<ImportConfig>()
        .batch_chunk_count
        .lock()
        .unwrap()
        .clone();

    for entry in WalkDir::new(dir_path)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .map_or(false, |ext| ext == "yaml" || ext == "yml")
        })
    {
        process_file_count += 1;
        match import_yaml(entry.path()) {
            Ok((unique_id, framework)) => {
                frameworks_buffer.insert(unique_id, framework);
                batch_file_count += 1;
                import_file_count += 1;

                if batch_file_count == batch_chunk_count {
                    app.emit(
                        "import://chunk",
                        ImportFilesChunk {
                            command_id,
                            total_file_count,
                            process_file_count,
                            frameworks: frameworks_buffer.clone(),
                        },
                    )?;

                    frameworks_buffer.clear();
                    batch_file_count = 0;

                    // Get updated values
                    batch_chunk_count = app
                        .state::<ImportConfig>()
                        .batch_chunk_count
                        .lock()
                        .unwrap()
                        .clone();
                    slowdown_delay_ms = app
                        .state::<ImportConfig>()
                        .slowdown_delay_ms
                        .lock()
                        .unwrap()
                        .clone();
                }
            }
            Err(e) => {
                error!("{} - {}", e, entry.path().display());
            }
        }
        // Slowdown for demo purposes
        thread::sleep(Duration::from_millis(slowdown_delay_ms));
    }

    if !frameworks_buffer.is_empty() {
        app.emit(
            "import://chunk",
            ImportFilesChunk {
                command_id,
                total_file_count,
                process_file_count,
                frameworks: frameworks_buffer.clone(),
            },
        )?;
    }

    app.emit(
        "import://end",
        ImportFilesEnd {
            command_id,
            total_file_count,
            process_file_count,
            success_file_count: import_file_count,
            failure_file_count: process_file_count - import_file_count,
        },
    )?;

    Ok((import_file_count, process_file_count, total_file_count))
}

fn run_import_and_log<R: Runtime>(app: AppHandle<R>, dir_path: &str, command_id: &str) {
    info!("Importing files from {}", dir_path);

    match process_import(app, dir_path, command_id) {
        Ok((import_file_count, process_file_count, total_file_count)) => {
            info!(
                "{}/{} files imported from {}",
                import_file_count, process_file_count, dir_path
            );
            if process_file_count < total_file_count {
                warn!(
                    "Initial file count was {}, but only {} files were found during import",
                    total_file_count, process_file_count
                );
            }
        }
        Err(e) => {
            error!("{} - command_id={}", e, command_id);
        }
    };
}

#[tauri::command]
pub fn trigger_import_files<R: Runtime>(
    app: AppHandle<R>,
    dir_path: String,
    command_id: String,
) -> std::result::Result<(), String> {
    let async_import = app
        .state::<ImportConfig>()
        .async_import
        .lock()
        .unwrap()
        .clone();
    if async_import {
        thread::spawn(move || {
            run_import_and_log(app, &dir_path, &command_id);
        });
    } else {
        run_import_and_log(app, &dir_path, &command_id);
    }
    Ok(())
}

#[tauri::command]
pub fn set_import_slowdown_delay(
    state: State<'_, ImportConfig>,
    delay_ms: u64,
) -> std::result::Result<(), String> {
    let mut delay = state.slowdown_delay_ms.lock().map_err(|e| e.to_string())?;
    *delay = delay_ms;
    Ok(())
}

#[tauri::command]
pub fn set_import_batch_chunk_count(
    state: State<'_, ImportConfig>,
    chunk_count: u32,
) -> std::result::Result<(), String> {
    let mut batch = state.batch_chunk_count.lock().map_err(|e| e.to_string())?;
    *batch = chunk_count;
    Ok(())
}

#[tauri::command]
pub fn set_import_async(
    state: State<'_, ImportConfig>,
    async_import: bool,
) -> std::result::Result<(), String> {
    let mut async_flag = state.async_import.lock().map_err(|e| e.to_string())?;
    *async_flag = async_import;
    Ok(())
}
