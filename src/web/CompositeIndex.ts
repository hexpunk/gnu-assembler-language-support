export function defineCompositeIndex<T extends Record<string, unknown>>() {
  return function <const K extends ReadonlyArray<keyof T>>(
    keys: K,
  ): CompositeIndex<T, K> {
    return new CompositeIndex(keys);
  };
}

type CompositeMap<T, K extends ReadonlyArray<keyof T>> = K extends [
  infer First,
  ...infer Rest,
]
  ? First extends keyof T
    ? Rest extends Array<keyof T>
      ? Map<T[First], CompositeMap<T, Rest>>
      : never
    : never
  : Set<T>;

class CompositeIndex<
  T extends Record<string, unknown>,
  K extends ReadonlyArray<keyof T>,
> {
  private items = new Set<T>();
  private index: CompositeMap<T, K>;

  constructor(private keys: K) {
    if (keys.length === 0) {
      this.index = new Set<T>() as CompositeMap<T, K>;
    } else {
      this.index = new Map<any, any>() as CompositeMap<T, K>;
    }
  }

  /**
   * Adds an item to the composite index.
   *
   * @param item - The item to be added to the composite index. The item must have properties
   * corresponding to the keys used to build the index.
   */
  add(item: T) {
    if (!this.items.has(item)) {
      this.items.add(item);

      let current = this.index;
      let i = 0;

      while (i < this.keys.length) {
        const key = this.keys[i];
        const value = item[key];
        const isLast = i === this.keys.length - 1;

        if (isLast) {
          let set = (current as Map<any, Set<T>>).get(value);
          if (!set) {
            set = new Set<T>();
            (current as Map<any, Set<T>>).set(value, set);
          }
          set.add(item);
          return;
        }

        let next = (current as Map<any, any>).get(value);
        if (!next) {
          next = new Map();
          (current as Map<any, any>).set(value, next);
        }

        current = next;
        i++;
      }
    }
  }
}
