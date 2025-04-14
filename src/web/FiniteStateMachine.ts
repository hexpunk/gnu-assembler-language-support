interface StateTransition<State, Event> {
  readonly from: State;
  readonly to: State;
  readonly event: Event;
}

export interface FiniteStateMachine<State, Event> {
  readonly initialState: State;
  readonly transitions: ReadonlyArray<StateTransition<State, Event>>;
}

type AllStates<FSM> =
  FSM extends FiniteStateMachine<infer State, unknown> ? State : never;

type AllEvents<FSM> =
  FSM extends FiniteStateMachine<unknown, infer Event> ? Event : never;

type IsLiteral<T> = string extends T ? false : number extends T ? false : true;

type IsValidState<FSM, State> = State extends AllStates<FSM> ? true : false;

type IsValidEvent<FSM, Event> = Event extends AllEvents<FSM> ? true : false;

type AnyReachableState<FSM extends FiniteStateMachine<unknown, unknown>> =
  FSM["transitions"][number]["to"];

type ReachableStatesFrom<
  FSM extends FiniteStateMachine<unknown, unknown>,
  State extends AllStates<FSM>,
> = Extract<FSM["transitions"][number], { from: State }>["to"];

type TransitionMatch<
  FSM extends FiniteStateMachine<unknown, unknown>,
  State extends AllStates<FSM>,
  Event extends AllEvents<FSM>,
> = Extract<FSM["transitions"][number], { from: State; event: Event }>;

type NextState<FSM extends FiniteStateMachine<unknown, unknown>, State, Event> =
  // Check if the provided State is a literal (e.g., "start", not string)
  IsLiteral<State> extends true
    ? // If it's a literal, but not a valid FSM state, return undefined
      IsValidState<FSM, State> extends false
      ? undefined
      : // If State is valid, check if Event is also a literal
        IsLiteral<Event> extends true
        ? // If Event is a literal but invalid, return undefined
          IsValidEvent<FSM, Event> extends false
          ? undefined
          : // Both State and Event are valid literals — look up the actual transition target
            TransitionMatch<
              FSM,
              Extract<State, AllStates<FSM>>,
              Extract<Event, AllEvents<FSM>>
            >["to"]
        : // Event is general (e.g., just `string`) — fallback to any reachable state from this valid state
          ReachableStatesFrom<FSM, Extract<State, AllStates<FSM>>> | undefined
    : // State is general (e.g., `string`) — fallback to any reachable state at all
      AnyReachableState<FSM> | undefined;

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
  const FSM extends FiniteStateMachine<unknown, unknown>,
  const State,
  const Event,
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
