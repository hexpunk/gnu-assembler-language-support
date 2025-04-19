import { IsLiteral, ReadonlyDeep } from "type-fest";

export interface Transition<State, Event> {
  readonly from: State;
  readonly to: State;
  readonly event: Event;
}

export interface FiniteStateMachine<State, Event> {
  readonly initialState: State;
  readonly transitions: ReadonlyArray<Transition<State, Event>>;
}

type State<FSM> = FSM extends FiniteStateMachine<infer S, unknown> ? S : never;

type Event<FSM> = FSM extends FiniteStateMachine<unknown, infer E> ? E : never;

type ReachableState<FSM extends FiniteStateMachine<unknown, unknown>> =
  FSM["transitions"][number]["to"];

type ReachableStateFrom<
  FSM extends FiniteStateMachine<unknown, unknown>,
  S extends State<FSM>,
> = Extract<FSM["transitions"][number], { from: S }>["to"];

type MatchingTransition<
  FSM extends FiniteStateMachine<unknown, unknown>,
  S extends State<FSM>,
  E extends Event<FSM>,
> = Extract<FSM["transitions"][number], { from: S; event: E }>;

export type NextState<FSM extends FiniteStateMachine<unknown, unknown>, S, E> =
  S extends State<FSM> // if S is a state in FSM
    ? E extends Event<FSM> // if E is an event in FSM
      ? MatchingTransition<FSM, S, E> extends never // if no matching transition
        ? undefined
        : MatchingTransition<FSM, S, E>["to"]
      : IsLiteral<E> extends true // if E is a string literal
        ? undefined
        : ReachableStateFrom<FSM, S> | undefined
    : IsLiteral<S> extends true // if S is a string literal
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
  FSM extends FiniteStateMachine<unknown, unknown>,
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
