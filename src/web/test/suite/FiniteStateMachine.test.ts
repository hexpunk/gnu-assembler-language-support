import { strict as assert } from "assert";
import { transition } from "../../FiniteStateMachine";

const fsm = {
  initialState: "start",
  transitions: [
    { from: "start", to: "middle", event: "go" },
    { from: "middle", to: "end", event: "finish" },
  ],
} as const;

// Type-level tests
const vagueString: string = "string";

// Valid usage
transition(fsm, fsm.initialState, vagueString) satisfies "middle" | undefined;
transition(fsm, vagueString, vagueString) satisfies
  | "middle"
  | "end"
  | undefined;
transition(fsm, fsm.initialState, "invalid") satisfies undefined;
transition(fsm, "invalid", "invalid") satisfies undefined;

// Unit tests
describe("transition", () => {
  it("should transition to the correct state on a valid event", () => {
    const result: "middle" = transition(fsm, fsm.initialState, "go");
    assert.strictEqual(result, "middle");
  });

  it("should return undefined for an invalid event", () => {
    const result: undefined = transition(fsm, fsm.initialState, "invalid");
    assert.strictEqual(result, undefined);
  });

  it("should return undefined for an invalid state", () => {
    const result: undefined = transition(fsm, "invalid", "go");
    assert.strictEqual(result, undefined);
  });

  it("should transition to the correct state on a valid chain of events", () => {
    const firstResult: "middle" = transition(fsm, fsm.initialState, "go");
    const secondResult: "end" = transition(fsm, firstResult, "finish");
    assert.strictEqual(secondResult, "end");
  });
});
