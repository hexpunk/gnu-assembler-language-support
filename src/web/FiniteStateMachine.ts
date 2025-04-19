export interface Transition<State extends string, Event extends string> {
  readonly from: State;
  readonly to: State;
  readonly event: Event;
}

export interface FiniteStateMachine<
  State extends string,
  Event extends string,
> {
  readonly initialState: State;
  readonly transitions: ReadonlyArray<Transition<State, Event>>;
}

type State<FSM> = FSM extends FiniteStateMachine<infer S, string> ? S : never;

type Event<FSM> = FSM extends FiniteStateMachine<string, infer E> ? E : never;

type ReachableState<FSM extends FiniteStateMachine<string, string>> =
  FSM["transitions"][number]["to"];

type ReachableStateFrom<
  FSM extends FiniteStateMachine<string, string>,
  S extends State<FSM>,
> = Extract<FSM["transitions"][number], { from: S }>["to"];

type MatchingTransition<
  FSM extends FiniteStateMachine<string, string>,
  S extends State<FSM>,
  E extends Event<FSM>,
> = Extract<FSM["transitions"][number], { from: S; event: E }>;

// Check if a type is a literal string type
type IsStringLiteral<T> = string extends T ? false : true;

export type NextState<FSM extends FiniteStateMachine<string, string>, S, E> =
  S extends State<FSM> // if S is a state in FSM
    ? E extends Event<FSM> // if E is an event in FSM
      ? MatchingTransition<FSM, S, E> extends never // if no matching transition
        ? undefined
        : MatchingTransition<FSM, S, E>["to"]
      : IsStringLiteral<E> extends true // if E is a string literal
        ? undefined
        : ReachableStateFrom<FSM, S> | undefined
    : IsStringLiteral<S> extends true // if S is a string literal
      ? undefined
      : ReachableState<FSM> | undefined;
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
