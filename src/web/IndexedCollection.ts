/**
 * Creates a function to define an `IndexedCollection` for a given type `T` and a set of keys.
 *
 * This utility function allows you to specify a list of keys that will be used to index
 * the collection, ensuring type safety and flexibility when working with indexed data.
 *
 * @template T - The type of the objects in the collection. Must extend `Record<string, unknown>`.
 * @returns A function that accepts an array of keys and returns an `IndexedCollection` instance.
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const userCollection = defineIndexedCollection<User>()(['id', 'email']);
 * ```
 */
export function defineIndexedCollection<T extends Record<string, unknown>>() {
  return function <const K extends ReadonlyArray<keyof T>>(
    keys: K,
  ): IndexedCollection<T, K[number]> {
    return new IndexedCollection(keys);
  };
}

/**
 * A generic collection class that maintains a set of items and provides efficient
 * indexing and retrieval based on specified keys. The collection supports adding,
 * removing, and querying items while keeping the indexes up-to-date.
 *
 * @template T - The type of the objects in the collection. Must extend `Record<string, unknown>`.
 * @template K - The keys of type `T` that are used for indexing.
 */
export class IndexedCollection<
  T extends Record<string, unknown>,
  K extends keyof T,
> {
  private items = new Set<T>();
  private indexes = new Map<K, Map<T[K], Set<T>>>();

  constructor(private indexedKeys: ReadonlyArray<K>) {
    for (const key of indexedKeys) {
      this.indexes.set(key, new Map());
    }
  }

  /**
   * Adds an item to the collection and updates all indexed keys.
   *
   * @param item - The item to be added to the collection. The item must have properties
   * corresponding to the keys used to build the index.
   */
  add(item: T) {
    // If the item is already in the collection, remove it and re-index it.
    if (this.items.has(item)) {
      for (const keyMap of this.indexes.values()) {
        for (const [value, set] of keyMap.entries()) {
          set.delete(item);

          if (set.size === 0) {
            keyMap.delete(value);
          }
        }
      }
    }

    this.items.add(item);

    for (const key of this.indexedKeys) {
      const indexMap = this.indexes.get(key)!;

      const value = item[key];
      if (!indexMap.has(value)) {
        indexMap.set(value, new Set());
      }

      indexMap.get(value)!.add(item);
    }
  }

  /**
   * Removes an item from the collection and updates all associated indexes.
   *
   * @param item - The item to be removed from the collection.
   */
  remove(item: T) {
    if (!this.items.delete(item)) {
      return;
    }

    for (const key of this.indexedKeys) {
      const indexMap = this.indexes.get(key)!;
      const value = item[key];
      const bucket = indexMap.get(value);

      if (bucket) {
        bucket.delete(item);

        if (bucket.size === 0) {
          indexMap.delete(value);
        }
      }
    }
  }

  /**
   * Removes all items from the collection that match the specified key-value pair.
   *
   * @template Key - A subtype of the key type `K` used to index the collection.
   * @param key - The key used to locate the index map.
   * @param value - The value associated with the key to identify the items to remove.
   */
  removeBy<Key extends K>(key: Key, value: T[Key]) {
    const indexMap = this.indexes.get(key);
    if (!indexMap) {
      return;
    }

    const bucket = indexMap.get(value);
    if (!bucket) {
      return;
    }

    for (const item of bucket) {
      this.remove(item);
    }
  }

  /**
   * Retrieves an array of items from the collection that match the specified key-value pair.
   *
   * @template Key - A subtype of the key type `K` used to index the collection.
   * @param key - The key to search for in the indexed collection.
   * @param value - The value associated with the specified key to match items against.
   * @returns An array of items that match the specified key-value pair. If no match is found, an empty array is returned.
   */
  getBy<Key extends K>(key: Key, value: T[Key]): T[] {
    const indexMap = this.indexes.get(key);
    if (!indexMap) {
      return [];
    }

    const bucket = indexMap.get(value);

    return bucket ? Array.from(bucket) : [];
  }

  /**
   * Retrieves all the keys from the index map associated with the specified index key.
   *
   * @template Key - A subtype of the key type `K` used to index the collection.
   * @param key - The key for which to retrieve the index keys.
   * @returns An array of keys from the index map corresponding to the specified key.
   *          If no index map exists for the given key, an empty array is returned.
   */
  getIndexKeys<Key extends K>(key: Key): Array<T[Key]> {
    const indexMap = this.indexes.get(key);

    return indexMap ? (Array.from(indexMap.keys()) as T[Key][]) : [];
  }

  /**
   * Filters the items in the collection based on a provided predicate function.
   *
   * @param predicate - A function that takes an item of type `T` as input and returns `true`
   * if the item should be included in the result, or `false` otherwise.
   * @returns An array of items of type `T` that satisfy the predicate function.
   */
  filter(predicate: (item: T) => boolean): T[] {
    return Array.from(this.items).filter(predicate);
  }

  /**
   * Clears all items and indexes from the collection.
   */
  clear(): void {
    this.items.clear();

    for (const indexMap of this.indexes.values()) {
      indexMap.clear();
    }
  }

  /**
   * Retrieves the number of items in the collection.
   *
   * @returns The total number of items in the collection.
   */
  size(): number {
    return this.items.size;
  }
}
