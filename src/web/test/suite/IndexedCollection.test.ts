import { strict as assert } from "assert";
import { defineIndexedCollection } from "../../IndexedCollection";

type User = {
  id: number;
  name?: string | null;
  email?: string;
};

// Type-level tests
const userCollection = defineIndexedCollection<User>()(["id", "email"]);

// Valid usage
userCollection.add({ id: 1, name: "Alice", email: "alice@example.com" });
userCollection.add({ id: 2, name: "Bob" }); // email is optional

// Invalid usage (should cause TypeScript errors)
// @ts-expect-error: Missing required 'id' property
userCollection.add({ name: "Charlie" });

// @ts-expect-error: 'age' is not a valid key
userCollection.getBy("age", 30);

// @ts-expect-error: string is not a valid type for key 'id'
userCollection.getBy("id", "hello");

// @ts-expect-error: 'phone' is not a valid key for indexing
defineIndexedCollection<User>()(["id", "phone"]);

// Unit tests
describe("MultiAttributeStore", () => {
  const store = defineIndexedCollection<User>()(["id", "name"]);

  beforeEach(() => {
    store.clear();
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

    it("should not add duplicate items", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      store.add(item);
      assert.equal(store.size(), 1);
    });

    it("should handle undefined values gracefully", () => {
      const item = { id: 1, name: undefined };
      store.add(item);
      assert.deepEqual(store.getBy("id", 1), [item]);
      assert.deepEqual(store.getBy("name", undefined), [item]);
    });

    it("should handle null values gracefully", () => {
      const item = { id: 1, name: null };
      store.add(item);
      assert.deepEqual(store.getBy("id", 1), [item]);
      assert.deepEqual(store.getBy("name", null), [item]);
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

    it("should do nothing if the key-value pair does not exist", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      store.removeBy("name", "Bob");
      assert.equal(store.size(), 1);
    });
  });

  describe("#getBy", () => {
    it("should retrieve items by a specific key and value", () => {
      const item = { id: 1, name: "Alice" };
      store.add(item);
      assert.deepEqual(store.getBy("id", 1), [item]);
    });

    it("should return an empty array on an empty collection", () => {
      assert.deepEqual(store.getBy("id", 1), []);
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

    it("should return an empty array on an empty collection", () => {
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

    it("should return an empty array on an empty collection", () => {
      assert.deepEqual(
        store.filter(() => true),
        [],
      );
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
