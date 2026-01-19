import { call, derived, disposable, html, loop, node, writable } from '@adernnell/simplereactivedom';
import { EntityType, FileEntity } from '../../core/entity';
import { liveQuery, Subscription } from 'dexie';
import { Filters } from './filters';
import { doQueryWithFilters } from './query';
import { infoDialogEntityIdStore } from '../../states';
import './file-list.css';

export interface FileListProps {
    infoDialog: HTMLDialogElement;
}

export const FileList = (props: FileListProps) => {
    const rows = writable<FileEntity[]>([]);
    const nameSearchStore = writable('');
    const typeFilterStore = writable<EntityType | undefined>(undefined);

    const searchStore = derived([nameSearchStore, typeFilterStore], ([name, type]) => {
        return { name, type };
    });

    let observableSub: Subscription | undefined;
    const searchUnsub = searchStore.subscribe((search) => {
        const queryObservable = liveQuery(() => {
            return doQueryWithFilters(search.name, search.type);
        });

        observableSub?.unsubscribe();
        observableSub = queryObservable.subscribe((newRows) => {
            rows.set(newRows);
        });
    });

    const fileListNode = node(html`
        <section class="cmp-file-list">
            ${Filters({
                nameSearchStore,
                typeFilterStore,
                onNameSearchChange: (newName) => nameSearchStore.set(newName),
                onTypeFilterChange: (newType) => typeFilterStore.set(newType),
            })}
            <div role="table" class="table">
                <div role="rowgroup" class="thead">
                    <div role="row" class="tr">
                        <div role="cell" class="th">Name</div>
                        <div role="cell" class="th">Homepage</div>
                        <div role="cell" class="th">Description</div>
                        <div role="cell" class="th">Type</div>
                        <div role="cell" class="th">File</div>
                    </div>
                </div>
                <div role="rowgroup" class="tbody">
                    ${loop().each(
                        rows,
                        (rowItem) => html`
                            <div role="row" class="tr">
                                <div role="cell" class="td">${rowItem.name}</div>
                                <div role="cell" class="td">
                                    <a href="${rowItem.homepageUrl}" target="_blank">${rowItem.homepageUrl}</a>
                                </div>
                                <div role="cell" class="td">${rowItem.description}</div>
                                <div role="cell" class="td">${rowItem.type}</div>
                                <div role="cell" class="td">
                                    <button
                                        type="button"
                                        class="info-button"
                                        onclick=${call(() => {
                                            infoDialogEntityIdStore.set(rowItem.uid);
                                            props.infoDialog.showModal();
                                        })}
                                    >
                                        ℹ️
                                    </button>
                                </div>
                            </div>
                        `
                    )}
                </div>
            </div>
        </section>
    `) as Element;

    return disposable(fileListNode, () => {
        observableSub?.unsubscribe();
        searchUnsub();
    });
};
