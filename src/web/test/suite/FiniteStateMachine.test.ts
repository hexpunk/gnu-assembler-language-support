import { strict as assert } from "assert";
import { transition, FiniteStateMachine } from "../../FiniteStateMachine";

describe("transition", () => {
  const fsm: FiniteStateMachine<string, string> = {
    initialState: "start",
    transitions: [
      { from: "start", to: "middle", event: "go" },
      { from: "middle", to: "end", event: "finish" },
    ],
  };

  it("should transition to the correct state on a valid event", () => {
    const result = transition(fsm, fsm.initialState, "go");
    assert.strictEqual(result, "middle");
  });

  it("should return undefined for an invalid event", () => {
    const result = transition(fsm, fsm.initialState, "invalid");
    assert.strictEqual(result, undefined);
  });

  it("should return undefined for an invalid state", () => {
    const result = transition(fsm, "invalid", "go");
    assert.strictEqual(result, undefined);
  });

  it("should transition to the correct state on a valid chain of events", () => {
    const firstResult = transition(fsm, fsm.initialState, "go");
    const secondResult = transition(fsm, firstResult!, "finish");
    assert.strictEqual(secondResult, "end");
  });

  it("should handle cases where state or event is too vague", () => {
    const result = transition(fsm, fsm.initialState, "");
    assert.strictEqual(result, undefined);
  });
});
