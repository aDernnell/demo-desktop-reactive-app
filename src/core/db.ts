import { Dexie, type Table } from 'dexie';
import { FileEntity } from './entity';

export class AppIndexedDb extends Dexie {
    entities!: Table<FileEntity>;

    constructor() {
        super('demoAppDatabase');
        this.version(1).stores({
            entities: 'uid, path, name, type',
        });
    }
}

export const db = new AppIndexedDb();

export const clearDatabase = async (): Promise<void> => {
    await db.entities.clear();
};
