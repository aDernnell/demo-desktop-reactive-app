import { call, derived, disposable, html, node, Writable, writable } from '@adernnell/simplereactivedom';
import { CloseIcon } from '../icons';
import { revealItemInDir } from '@tauri-apps/plugin-opener';
import { liveQuery, Subscription } from 'dexie';
import { infoDialogEntityIdStore } from '../../states';
import { FileEntity } from '../../core/entity';
import { db } from '../../core/db';
import './info-dialog.css';

export const InfoDialog = () => {
    const entity: Writable<FileEntity | undefined> = writable(undefined);
    const uuid = derived(entity, (ent) => ent?.uid || '');
    const filePath = derived(entity, (ent) => ent?.path || '');
    const entityName = derived(entity, (ent) => ent?.name || '');

    let observableSub: Subscription | undefined;
    const entityIdUnsub = infoDialogEntityIdStore.subscribe((entityId) => {
        const queryObservable = entityId ? liveQuery(() => db.entities.get(entityId)) : undefined;
        observableSub?.unsubscribe();
        observableSub = queryObservable?.subscribe((entityData) => {
            entity.set(entityData);
        });
    });

    const close = () => {
        dialogNode.close();
    };

    const revealFile = async () => {
        const path = entity.get()?.path;
        if (path) {
            await revealItemInDir(path);
        }
    };

    const dialogNode = node(html`
        <dialog class="cmp-info-dialog">
            <article>
                <header>
                    <h2>File info</h2>
                    <button type="button" aria-label="Close" rel="prev" class="close-button" onclick=${call(close)}>
                        ${CloseIcon()}
                    </button>
                </header>
                <main>
                    <div class="name">${entityName}</div>
                    <div class="uuid"><span class="label">UUID:</span><span class="value">${uuid}</span></div>
                    <div class="path">
                        <span class="label">Path:</span>
                        <a class="value" onclick=${call(revealFile)} title="${filePath}">${filePath}</a>
                    </div>
                </main>
                <footer>
                    <button type="button" class="ok-button primary" onclick=${call(close)}>Ok</button>
                </footer>
            </article>
        </dialog>
    `) as HTMLDialogElement;

    return disposable(dialogNode, () => {
        observableSub?.unsubscribe();
        entityIdUnsub();
    });
};
