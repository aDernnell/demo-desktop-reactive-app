import { FsChangesChunk, invokeStartWatching, invokeStopWatching, listenToFsChangesChunk } from '../bindings';
import { toastService } from '../components';
import { watchingFSChangesStore } from '../states';
import { db } from './db';
import { chunkPayloadToEntities } from './entity';

export const startWatchChangesListener = async () => {
    listenToFsChangesChunk((event) => {
        console.log('FS changes chunk received:', event.payload);
        const changesChunk: FsChangesChunk = event.payload;
        db.transaction('rw', db.entities, async () => {
            for (const path of changesChunk.deletes) {
                await db.entities.where({ path: path }).delete();
            }

            const items = chunkPayloadToEntities(changesChunk.updates);
            for (const item of items) {
                await db.entities.update(item.uid, { ...item }).then((updateCount) => {
                    if (updateCount == 0) {
                        return db.entities.add(item);
                    } else {
                        return item.uid;
                    }
                });
            }
        }).catch((err) => {
            console.error('Failed to store fs changes chunk:', err);
            toastService.showError({
                title: 'Error',
                description: 'Failed to store fs changes chunk to database.',
            });
        });
    });
};

export const watchChanges = async (path: string): Promise<void> => {
    if (path !== '') {
        const startWatchingPromise = invokeStartWatching(path);
        startWatchingPromise.catch((e) => {
            console.error('Error starting to watch folder:', e);
            toastService.showError({
                title: 'Error',
                description: 'Failed to start watching folder',
            });
        });
        await startWatchingPromise;
        watchingFSChangesStore.set(true);
    }
};

export const stopWatchingChanges = async (path: string) => {
    if (path !== '') {
        const stopWatchingPromise = invokeStopWatching(path);
        stopWatchingPromise.catch((e) => {
            console.error('Error stopping watching folder during clear:', e);
            toastService.showError({
                title: 'Error',
                description: 'Failed to stop watching folder',
            });
        });
        await stopWatchingPromise;
        watchingFSChangesStore.set(false);
    }
};
