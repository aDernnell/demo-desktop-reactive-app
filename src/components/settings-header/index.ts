import { call, cond, derived, html, node, when } from '@adernnell/simplereactivedom';
import { open } from '@tauri-apps/plugin-dialog';
import { ClearIcon, DeleteIcon, ReloadIcon } from '../icons';
import {
    selectedPathStore,
    importSlowdownDelayStore,
    importChunkSizeStore,
    asyncImportStore,
    watchingFSChangesStore,
} from '../../states';
import { ToastMessage, toastService } from '../toaster';
import { invokeSetImportAsync, invokeSetImportChunkSize, invokeSetImportSlowdownDelay } from '../../bindings';
import { clearDatabase } from '../../core/db';
import { importPath } from '../../core/import';
import { stopWatchingChanges, watchChanges } from '../../core/sync';
import './settings-header.css';

export const SettingsHeader = () => {
    const selectPath = async () => {
        const selected = await open({ multiple: false, directory: true });
        if (typeof selected === 'string') {
            selectedPathStore.set(selected);
        }
    };

    const deletePath = () => {
        selectedPathStore.set('');
    };

    const clear = async () => {
        await stopWatchingChanges(selectedPathStore.get());
        await clearDatabase();
    };

    const reload = async () => {
        await clear();
        await importPath(selectedPathStore.get());
        await watchChanges(selectedPathStore.get());
    };

    const toggleAsync = (e: Event) => {
        const checked = (e.target as HTMLInputElement).checked;
        asyncImportStore.set(checked);
        toastService.showPromise(invokeSetImportAsync(checked), {
            loading: 'Updating...',
            success: `Import async is now ${checked}`,
            error: (e: unknown): ToastMessage => {
                console.error('Error updating import async:', e);
                return { title: 'Error', description: `${e}` };
            },
        });
    };

    const setSlowdownDelay = (e: Event) => {
        const value = parseFloat((e.target as HTMLInputElement).value);
        importSlowdownDelayStore.set(value);
    };

    const submitSlowdownDelay = () => {
        const value = importSlowdownDelayStore.get();
        toastService.showPromise(invokeSetImportSlowdownDelay(value * 1000), {
            loading: 'Updating...',
            success: `Delay is now ${value * 1000}ms`,
            error: (e: unknown): ToastMessage => {
                console.error('Error updating import slowdown delay:', e);
                return { title: 'Error', description: `${e}` };
            },
        });
    };

    const setImportChunkSize = (e: Event) => {
        const value = Math.max(1, Math.min(100, parseInt((e.target as HTMLInputElement).value, 10)));
        importChunkSizeStore.set(value);
    };

    const submitImportChunkSize = () => {
        const value = importChunkSizeStore.get();
        toastService.showPromise(invokeSetImportChunkSize(value), {
            loading: 'Updating...',
            success: `Chunk size is now ${value}`,
            error: (e: unknown): ToastMessage => {
                console.error('Error updating import chunk size:', e);
                return { title: 'Error', description: `${e}` };
            },
        });
    };

    const pathIsSelected = derived(selectedPathStore, ($path) => $path !== '');
    const syncStateClass = derived([selectedPathStore, watchingFSChangesStore], ([$path, $watching]) =>
        $path ? ($watching ? 'in-sync' : 'not-in-sync') : 'no-path'
    );
    const syncStateTitle = derived([selectedPathStore, watchingFSChangesStore], ([$path, $watching]) => {
        if ($path === '') {
            return 'Not in sync (no path selected)';
        } else if ($watching) {
            return 'In sync';
        } else {
            return 'Not in sync';
        }
    });

    const el = node(html`
        <section class="cmp-settings-header">
            <div class="path-row">
                <label>
                    <span class="label">Selected Path:</span>
                </label>
                ${cond()
                    .if(
                        pathIsSelected,
                        () => html`
                            <div class="selected">
                                <p title="${selectedPathStore}" onclick=${call(selectPath)}>${selectedPathStore}</p>
                                <div class="actions">
                                    <button type="button" class="secondary outlined" onclick=${call(deletePath)}>
                                        ${DeleteIcon({ width: 16, height: 16 })}
                                    </button>
                                    <button type="button" class="secondary outlined" onclick=${call(reload)}>
                                        ${ReloadIcon({ width: 16, height: 16 })}
                                    </button>
                                </div>
                            </div>
                        `
                    )
                    .else(
                        () => html`
                            <div class="selector">
                                <button type="button" class="secondary" onclick=${call(selectPath)}>
                                    Choose path...
                                </button>
                            </div>
                        `
                    )}
                <button type="button" class="secondary outlined" onclick=${call(clear)}>
                    ${ClearIcon({ width: 16, height: 16 })}
                </button>
                <span class="sync-indicator ${syncStateClass}" title="${syncStateTitle}"></span>
            </div>
            <div class="slowdown-row">
                <label>
                    <span class="label">Import slowdown:</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value="${importSlowdownDelayStore}"
                        oninput=${call(setSlowdownDelay)}
                        onchange=${call(submitSlowdownDelay)}
                    />
                    <span>${importSlowdownDelayStore}s</span>
                </label>
            </div>
            <div class="chunk-row">
                <label>
                    <span class="label">Import chunk size:</span>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value="${importChunkSizeStore}"
                        oninput=${call(setImportChunkSize)}
                        onblur=${call(submitImportChunkSize)}
                        onkeydown=${call((e: Event) => {
                            const evt = e as KeyboardEvent;
                            if (evt.key === 'Enter') {
                                (evt.target as HTMLElement).blur();
                            }
                        })}
                    />
                </label>
            </div>
            <div class="async-row">
                <label>
                    <span class="label">Import async:</span>
                    <input
                        type="checkbox"
                        name="async"
                        checked=${when(asyncImportStore)}
                        onchange=${call(toggleAsync)}
                    />
                </label>
            </div>
        </section>
    `) as HTMLElement;

    return el;
};
