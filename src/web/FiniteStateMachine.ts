interface StateTransition<State extends string, Event extends string> {
  readonly from: State;
  readonly to: State;
  readonly event: Event;
}

export interface FiniteStateMachine<
  State extends string,
  Event extends string,
> {
  readonly initialState: State;
  readonly transitions: ReadonlyArray<StateTransition<State, Event>>;
}

type AllStates<FSM> =
  FSM extends FiniteStateMachine<infer State, string> ? State : never;

type AllEvents<FSM> =
  FSM extends FiniteStateMachine<string, infer Event> ? Event : never;

type IsLiteral<T> = string extends T ? false : true;

type AnyReachableState<FSM extends FiniteStateMachine<string, string>> =
  FSM["transitions"][number]["to"];

type ReachableStatesFrom<
  FSM extends FiniteStateMachine<string, string>,
  State extends AllStates<FSM>,
> = Extract<FSM["transitions"][number], { from: State }>["to"];

type MatchingTransition<
  FSM extends FiniteStateMachine<string, string>,
  State extends AllStates<FSM>,
  Event extends AllEvents<FSM>,
> = Extract<FSM["transitions"][number], { from: State; event: Event }>;

type NextState<FSM extends FiniteStateMachine<string, string>, State, Event> =
  State extends AllStates<FSM>
    ? Event extends AllEvents<FSM>
      ? MatchingTransition<FSM, State, Event> extends never
        ? undefined
        : MatchingTransition<FSM, State, Event>["to"]
      : IsLiteral<Event> extends true
        ? undefined
        : ReachableStatesFrom<FSM, State> | undefined
    : IsLiteral<State> extends true
      ? undefined
      : AnyReachableState<FSM> | undefined;
/**
 * Executes a state transition in a finite state machine (FSM) based on the current state and an event.
 *
 * @template FSM - The type of the finite state machine, which includes its states, events, and transitions.
 * @template State - The type of the current state in the FSM.
 * @template Event - The type of the event triggering the transition.
 *
 * @param fsm - The finite state machine containing the states, events, and transitions.
 * @param state - The current state of the FSM.
 * @param event - The event that triggers the transition.
 * @returns The next state of the FSM after the transition, or `undefined` if no valid transition is found.
 */
export function transition<
  FSM extends FiniteStateMachine<string, string>,
  State extends string,
  Event extends string,
>(fsm: FSM, state: State, event: Event): NextState<FSM, State, Event> {
  const transition = fsm.transitions.find(
    (t) => t.from === state && t.event === event,
  );

  return (transition ? transition.to : undefined) as NextState<
    FSM,
    State,
    Event
  >;
}
