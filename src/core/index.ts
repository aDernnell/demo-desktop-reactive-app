import { selectedPathStore } from '../states';
import { clearDatabase } from './db';
import { importPath, initImportSettings } from './import';
import { startWatchChangesListener, watchChanges } from './sync';

export const init = async () => {
    await clearDatabase();
    await initImportSettings();
    await startWatchChangesListener();
    await importPath(selectedPathStore.get());
    await watchChanges(selectedPathStore.get());
};
