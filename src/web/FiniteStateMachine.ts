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
  State extends AllStates<FSM>
    ? Event extends AllEvents<FSM>
      ? TransitionMatch<FSM, State, Event>["to"] extends never
        ? ReachableStatesFrom<FSM, Extract<State, AllStates<FSM>>> extends never
          ? AnyReachableState<FSM> | undefined // both state/event are too vague
          : ReachableStatesFrom<FSM, Extract<State, AllStates<FSM>>> | undefined
        : TransitionMatch<FSM, State, Event>["to"]
      : AnyReachableState<FSM> | undefined
    : AnyReachableState<FSM> | undefined;

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
