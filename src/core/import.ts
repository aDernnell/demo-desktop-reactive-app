import {
    invokeSetImportAsync,
    invokeSetImportChunkSize,
    invokeSetImportSlowdownDelay,
    invokeStartWatching,
    invokeTriggerImportFiles,
    listenToImportFilesChunk,
    listenToImportFilesEnd,
} from '../bindings';
import { toastService } from '../components';
import { asyncImportStore, importChunkSizeStore, importSlowdownDelayStore, selectedPathStore } from '../states';
import { db } from './db';
import { chunkPayloadToEntities } from './entity';

/**
 * Push initial import settings to backend
 * @returns
 */
export const initImportSettings = async () => {
    const importSlowdownDelayInitState = importSlowdownDelayStore.get() * 1000;
    const slowdownPromise = invokeSetImportSlowdownDelay(importSlowdownDelayInitState)
        .then(() =>
            console.log(`Initial import slowdown delay state pushed to backend: ${importSlowdownDelayInitState}`)
        )
        .catch((e) => {
            console.error(`Failed to init import slowdown delay state to backend:`, e);
            toastService.showError({
                title: 'Error',
                description: 'Failed to initialize import slowdown delay setting.',
            });
        });

    const importChunkSizeInitState = importChunkSizeStore.get();
    const chunkSizePromise = invokeSetImportChunkSize(importChunkSizeInitState)
        .then(() => console.log(`Initial import chunk size state pushed to backend: ${importChunkSizeInitState}`))
        .catch((e) => {
            console.error(`Failed to init import batch chunk count state to backend:`, e);
            toastService.showError({
                title: 'Error',
                description: 'Failed to initialize import batch chunk count setting.',
            });
        });

    const asyncImportInitState = asyncImportStore.get();
    const asyncPromise = invokeSetImportAsync(asyncImportInitState)
        .then(() => console.log(`Initial import async state pushed to backend: ${asyncImportInitState}`))
        .catch((e) => {
            console.error(`Failed to init import async state to backend:`, e);
            toastService.showError({ title: 'Error', description: 'Failed to initialize import async setting.' });
        });

    await Promise.all([slowdownPromise, chunkSizePromise, asyncPromise]);
};

export const importPath = async (path: string): Promise<void> => {
    if (path !== '') {
        const importPromise = importFolder(path);
        toastService.showPromise(importPromise, {
            loading: 'Importing files...',
            success: 'Files imported successfully!',
            error: (e: unknown) => {
                console.error('Error importing files:', e);
                return { title: 'Error', description: 'Import failed' };
            },
        });
        await importPromise;
    }
};

/**
 * Start the import process for a given folder path
 * @param folderPath
 * @returns a Promise that resolves when the import is complete
 */
export const importFolder = (folderPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const commandId = Date.now().toString();

        const unlistenImportChunk = listenToImportFilesChunk((event) => {
            if (event.payload.command_id === commandId) {
                console.log('Import chunk received:', event.payload);
                db.entities.bulkPut(chunkPayloadToEntities(event.payload.frameworks)).catch((err) => {
                    console.error('Failed to store imported files chunk:', err);
                    toastService.showError({
                        title: 'Error',
                        description: 'Failed to store imported files chunk to database.',
                    });
                });
            }
        });

        const unlistenImportEnd = listenToImportFilesEnd((event) => {
            if (event.payload.command_id === commandId) {
                console.log('Import ended:', event.payload);
                unlisten();
                resolve();
            }
        });

        const unlisten = () => {
            unlistenImportChunk.then((fn) => fn());
            unlistenImportEnd.then((fn) => fn());
        };

        invokeTriggerImportFiles(folderPath, commandId).catch((err) => {
            unlisten();
            reject(err);
        });
    });
};
