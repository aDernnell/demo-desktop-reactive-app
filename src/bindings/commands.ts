import { invoke } from '@tauri-apps/api/core';


export const invokeSetImportAsync = (asyncImport: boolean) => {
    return invoke<null>('set_import_async', { asyncImport });
};

export const invokeSetImportChunkSize = (chunkCount: number) => {
    return invoke<null>('set_import_batch_chunk_count', { chunkCount });
};

export const invokeSetImportSlowdownDelay = (delayMs: number) => {
    return invoke<null>('set_import_slowdown_delay', { delayMs });
};

export const invokeTriggerImportFiles = (dirPath: string, commandId: string) => {
    return invoke<null>('trigger_import_files', { dirPath, commandId });
};

export const invokeStartWatching = (path: string) => {
    return invoke<null>('start_watching', { path });
};

export const invokeStopWatching = (path: string) => {
    return invoke<null>('stop_watching', { path });
};


