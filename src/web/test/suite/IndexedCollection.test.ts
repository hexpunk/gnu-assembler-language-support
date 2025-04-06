import { strict as assert } from "assert";
import IndexedCollection from "../../IndexedCollection";

describe("IndexedCollection", () => {
  let store: IndexedCollection<{ id: number; name: string }>;

  beforeEach(() => {
    store = new IndexedCollection(["id", "name"]);
  });

  describe("#constructor", () => {
    it("should initialize with the given indexed keys", () => {
      assert.deepEqual(store.getIndexKeys("id"), []);
      assert.deepEqual(store.getIndexKeys("name"), []);
    });
  });

  describe("#add", () => {
    it("should add an item and index it by the specified keys", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      assert.deepEqual(store.getBy("id", 1), [item]);
      assert.deepEqual(store.getBy("name", "Alice"), [item]);
    });
  });

  describe("#remove", () => {
    it("should remove an item and update the indexes", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      store.remove(item);
      assert.deepEqual(store.getBy("id", 1), []);
      assert.deepEqual(store.getBy("name", "Alice"), []);
    });
  });

  describe("#removeBy", () => {
    it("should remove items by a specific key and value", () => {
      const item1 = { id: 1, name: "Alice" };
      const item2 = { id: 2, name: "Alice" };
      store.add(item1);
      store.add(item2);
      store.removeBy("name", "Alice");
      assert.deepEqual(store.getBy("name", "Alice"), []);
    });
  });

  describe("#getBy", () => {
    it("should retrieve items by a specific key and value", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      assert.deepEqual(store.getBy("id", 1), [item]);
    });
  });

  describe("#getIndexKeys", () => {
    it("should return all keys in the index for a given attribute", () => {
      const item1 = { id: 1, name: "Alice" };
      const item2 = { id: 2, name: "Bob" };
      store.add(item1);
      store.add(item2);
      assert.deepEqual(store.getIndexKeys("id"), [1, 2]);
      assert.deepEqual(store.getIndexKeys("name"), ["Alice", "Bob"]);
    });

    it("should return an empty array if no items are indexed for the given key", () => {
      assert.deepEqual(store.getIndexKeys("id"), []);
    });
  });

  describe("#filter", () => {
    it("should return items that match the predicate", () => {
      const item1 = { id: 1, name: "Alice" };
      const item2 = { id: 2, name: "Bob" };
      store.add(item1);
      store.add(item2);
      const result = store.filter((item) => item.name === "Alice");
      assert.deepEqual(result, [item1]);
    });

    it("should return an empty array if no items match the predicate", () => {
      const item1 = { id: 1, name: "Alice" };
      store.add(item1);
      const result = store.filter((item) => item.name === "Bob");
      assert.deepEqual(result, []);
    });
  });

  describe("#clear", () => {
    it("should clear all items and indexes", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      store.clear();
      assert.deepEqual(
        store.filter(() => true),
        [],
      );
    });
  });

  describe("#size", () => {
    it("should return the number of items in the store", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      assert.equal(store.size(), 1);
    });
  });
});
