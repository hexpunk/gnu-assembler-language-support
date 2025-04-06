/**
 * A generic class for managing a collection of items with support for indexing
 * by multiple attributes. This class allows efficient retrieval, addition, and
 * removal of items based on indexed attributes.
 *
 * @template T - The type of the items in the collection. Must extend `Record<string, unknown>`.
 * @template K - The keys of `T` that are used for indexing. Defaults to all keys of `T`.
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   age: number;
 * }
 *
 * const store = new IndexedCollection<User>(['id', 'name']);
 *
 * store.add({ id: 1, name: 'Alice', age: 30 });
 * store.add({ id: 2, name: 'Bob', age: 25 });
 *
 * console.log(store.getBy('name', 'Alice')); // [{ id: 1, name: 'Alice', age: 30 }]
 * console.log(store.size()); // 2
 *
 * store.removeBy('id', 1);
 * console.log(store.size()); // 1
 * ```
 */
export default class IndexedCollection<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> {
  private items = new Set<T>();
  private indexes = new Map<K, Map<T[K], Set<T>>>();

  /**
   * Constructs an instance of the `IndexedCollection` class.
   * Initializes the collection with the specified keys and creates an empty map
   * for each key to store indexed data.
   *
   * @param indexedKeys - An array of keys used to initialize the indexes.
   * Each key will have an associated map for storing data.
   */
  constructor(private indexedKeys: K[]) {
    for (const key of indexedKeys) {
      this.indexes.set(key, new Map());
    }
  }

  /**
   * Adds an item to the collection and updates all indexed keys.
   *
   * @param item - The item to be added to the collection. It is expected to have
   *               properties corresponding to the indexed keys.
   *
   * This method performs the following steps:
   * 1. Adds the item to the main collection.
   * 2. Iterates over all indexed keys and updates the corresponding index maps.
   *    - If the value for a key does not exist in the index map, a new entry is created.
   *    - The item is then added to the set of items associated with the value in the index map.
   */
  add(item: T) {
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
   *
   * If the item exists in the collection, it is deleted. Additionally, for each indexed key,
   * the method updates the corresponding index map by removing the item from its bucket.
   * If a bucket becomes empty after the removal, the bucket is deleted from the index map.
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
   * @param key - The key used to locate the index map.
   * @param value - The value used to locate the bucket of items to be removed.
   *
   * This method first retrieves the index map associated with the given key.
   * If no index map exists, the method exits early. It then retrieves the bucket
   * of items associated with the specified value. If no bucket is found, the method
   * exits early. Finally, it iterates through the bucket and removes each item
   * from the collection.
   */
  removeBy(key: K, value: T[K]) {
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
   * @template K - The type of the key used for indexing.
   * @template T - The type of the items in the collection.
   * @param key - The key to look up in the indexed collection.
   * @param value - The value associated with the specified key to filter the items.
   * @returns An array of items that match the specified key-value pair. If no match is found, returns an empty array.
   */
  getBy(key: K, value: T[K]): T[] {
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
   * @template K - The type of the index key.
   * @template T - The type of the object being indexed.
   * @param key - The index key for which to retrieve the associated keys.
   * @returns An array of keys from the index map if it exists, or an empty array if the index map is not found.
   */
  getIndexKeys(key: K): T[K][] {
    const indexMap = this.indexes.get(key);

    return indexMap ? Array.from(indexMap.keys()) : [];
  }

  /**
   * Filters the items in the collection based on a provided predicate function.
   *
   * @param predicate - A function that takes an item of type `T` and returns a boolean
   * indicating whether the item should be included in the resulting array.
   * @returns An array of items of type `T` that satisfy the predicate function.
   */
  filter(predicate: (item: T) => boolean): T[] {
    return Array.from(this.items).filter(predicate);
  }

  /**
   * Clears all items and indexes from the collection.
   * This method removes all elements from both the `items` and `indexes` maps,
   * effectively resetting the collection to an empty state.
   */
  clear() {
    this.items.clear();
    this.indexes.clear();
  }

  /**
   * Retrieves the number of items in the collection.
   *
   * @returns The total count of items in the collection.
   */
  size() {
    return this.items.size;
  }
}
