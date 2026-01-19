import { writable, asWritable, Writable } from '@adernnell/simplereactivedom';

type LocalStorageStoreOptions<T> = {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
};

const getValueFromStore = <Value>(key: string, options?: LocalStorageStoreOptions<Value>) => {
    let value = null;
    const storedValue = localStorage.getItem(key);
    if (storedValue !== null) {
        value = options?.deserialize ? options.deserialize(storedValue) : JSON.parse(storedValue);
    }
    return value;
};

/**
 * Creates a local storage store, i.e. a store that syncs with browser local storage for persistence across page reloads.
 *
 * @param key - The key to use for the local storage entry.
 * @param initialValue - The initial value to be used for the store if no value is found in localStorage.
 * @param options - Options for serialization and deserialization.
 * @returns A local storage store.
 */
export const localStorageStore = <Value>(
    key: string,
    initialValue: Value,
    options?: LocalStorageStoreOptions<Value>
): Writable<Value> => {
    let value = getValueFromStore(key, options);
    if (value == null) {
        value = initialValue;
    }

    const { subscribe, set, update } = writable<Value>(value);

    subscribe((val) => {
        localStorage.setItem(key, options?.serialize ? options.serialize(val) : JSON.stringify(val));
    });

    return asWritable({
        subscribe,
        set,
        update,
        get: () => getValueFromStore(key, options),
    });
};
