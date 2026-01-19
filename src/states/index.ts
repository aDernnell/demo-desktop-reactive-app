import { writable } from "@adernnell/simplereactivedom";
import { localStorageStore } from "../utils/local-storage-store";


export const selectedPathStore = localStorageStore<string>('selectedPath', '');
export const importSlowdownDelayStore = localStorageStore<number>('importSlowdownDelay', 0);
export const importChunkSizeStore = localStorageStore<number>('importChunkSize', 10);
export const asyncImportStore = localStorageStore<boolean>('asyncImport', false);

export const infoDialogEntityIdStore = writable<string | undefined>(undefined);
export const watchingFSChangesStore = writable<boolean>(false);