import { call, derived, html, node, prop, Readable } from '@adernnell/simplereactivedom';
import { EntityType } from '../../core/entity';
import { ResetFiltersIcon } from '../icons';

export interface FiltersProps {
    nameSearchStore: Readable<string>;
    typeFilterStore: Readable<EntityType | undefined>;
    onNameSearchChange?: (newName: string) => void;
    onTypeFilterChange?: (newType: EntityType | undefined) => void;
}

export const Filters = (props: FiltersProps) => {
    const { nameSearchStore, typeFilterStore, onNameSearchChange, onTypeFilterChange } = props;

    // FIXME remove attr when using prop directive !

    const input = node(html`
        <input
            type="text"
            name="nameSearch"
            placeholder="Search by name"
            value=${prop(nameSearchStore)}
            oninput=${call((e: Event) => onNameSearchChange?.((e.target as HTMLInputElement).value))}
        />
    `);

    const filtersNode = node(html`
        <div class="filters">
            ${input}
            <select
                name="typeFilter"
                value=${prop(derived(typeFilterStore, v => v ?? ''))}
                onchange=${call((e: Event) => {
                    const value = (e.target as HTMLSelectElement).value;
                    onTypeFilterChange?.(value === '' ? undefined : (value as EntityType));
                })}
            >
                <option value="">All types</option>
                ${Object.values(EntityType).map(
                    (type) => html`
                        <option value="${type}">${type}</option>
                    `
                )}
            </select>
            <button class="secondary outlined"
                onclick=${call(() => {
                    onNameSearchChange?.('');
                    onTypeFilterChange?.(undefined);
                })}
            >
                ${ResetFiltersIcon({ width: 16, height: 16 })}
            </button>
        </div>
    `);

    return filtersNode;
};
