import { strict as assert } from "assert";
import { defineCompositeIndex } from "../../CompositeIndex";

type User = {
  id: number;
  name?: string | null;
  email?: string;
};

// Type-level tests
const userIndex = defineCompositeIndex<User>()(["id", "email"]);

// @ts-expect-error: 'doesNotExist' is not a valid key for indexing
defineCompositeIndex<User>()(["id", "doesNotExist"]);

// Valid usage
userIndex.add({ id: 1, name: "Alice", email: "alice@example.com" });
userIndex.add({ id: 2, name: "Bob" }); // email is optional

// Invalid usage (should cause TypeScript errors)
// @ts-expect-error: Missing required 'id' property
userIndex.add({ name: "Charlie" });

// @ts-expect-error: 'age' is not a valid key
userIndex.find({ age: 30 });

// @ts-expect-error: 'name' is not a valid key for indexing
userIndex.find({ name: "test" });

// @ts-expect-error: string is not a valid type for key 'id'
userIndex.find({ id: "hello" });

// @ts-expect-error: 'phone' is not a valid key for indexing
defineCompositeIndex<User>()(["id", "phone"]);

// Unit tests
describe("CompositeIndex", () => {
  it("should add and find items correctly", () => {
    const createIndex = defineCompositeIndex<{ id: number; name: string }>();
    const index = createIndex(["id", "name"]);

    const item1 = { id: 1, name: "Alice" };
    const item2 = { id: 2, name: "Bob" };

    index.add(item1);
    index.add(item2);

    const result1 = index.find({ id: 1, name: "Alice" });
    assert.deepEqual(result1, [item1]);

    const result2 = index.find({ id: 2, name: "Bob" });
    assert.deepEqual(result2, [item2]);
  });

  it("should remove items correctly", () => {
    const createIndex = defineCompositeIndex<{ id: number; name: string }>();
    const index = createIndex(["id", "name"]);

    const item1 = { id: 1, name: "Alice" };
    const item2 = { id: 2, name: "Bob" };

    index.add(item1);
    index.add(item2);

    index.remove(item1);

    const result1 = index.find({ id: 1, name: "Alice" });
    assert.deepEqual(result1, []);

    const result2 = index.find({ id: 2, name: "Bob" });
    assert.deepEqual(result2, [item2]);
  });

  it("should return an empty set for non-matching queries", () => {
    const createIndex = defineCompositeIndex<{ id: number; name: string }>();
    const index = createIndex(["id", "name"]);

    const item1 = { id: 1, name: "Alice" };
    index.add(item1);

    const result = index.find({ id: 2, name: "Bob" });
    assert.deepEqual(result, []);
  });
});
