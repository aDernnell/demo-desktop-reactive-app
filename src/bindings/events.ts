import { listen, UnlistenFn, type Event } from "@tauri-apps/api/event";
import { FsChangesChunk, ImportFilesChunk, ImportFilesEnd } from "./types";

export const listenToImportFilesChunk = (callback: (event: Event<ImportFilesChunk>) => void): Promise<UnlistenFn> => {
    return listen("import://chunk", callback);
};

export const listenToImportFilesEnd = (callback: (event: Event<ImportFilesEnd>) => void): Promise<UnlistenFn> => {
    return listen("import://end", callback);
};

export const listenToFsChangesChunk = (callback: (event: Event<FsChangesChunk>) => void): Promise<UnlistenFn> => {
    return listen("watcher://fs-change", callback);
};
