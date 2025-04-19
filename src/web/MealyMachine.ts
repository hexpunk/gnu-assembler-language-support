import {
  FiniteStateMachine,
  Transition as FSMTransition,
  NextState,
} from "./FiniteStateMachine";

export interface Transition<State, Event, Context>
  extends FSMTransition<State, Event> {
  readonly reducer?: (context: Readonly<Context>) => Context;
}

export interface MealyMachine<State, Event, Context>
  extends FiniteStateMachine<State, Event> {
  readonly transitions: ReadonlyArray<Transition<State, Event, Context>>;
}

export type NextStateWithContext<
  MM extends MealyMachine<unknown, unknown, Context>,
  State,
  Event,
  Context,
> =
  NextState<MM, State, Event> extends undefined
    ? undefined
    : { state: NextState<MM, State, Event>; context: Context };

/**
 * Executes a state transition for a given Mealy Machine based on the current state,
 * event, and context. It searches for a matching transition in the machine's
 * transition table and applies the associated reducer (if any) to update the context.
 *
 * @template MM - The type of the Mealy Machine, which includes states, events, and context.
 * @template State - The type of the current state.
 * @template Event - The type of the event triggering the transition.
 * @template Context - The type of the context associated with the machine.
 *
 * @param mm - The Mealy Machine instance containing the transition definitions.
 * @param state - The current state of the machine.
 * @param event - The event triggering the state transition.
 * @param context - The current context of the machine.
 *
 * @returns The next state and updated context if a matching transition is found,
 *          otherwise `undefined`.
 */
export function transition<
  MM extends MealyMachine<unknown, unknown, Context>,
  State extends string,
  Event extends string,
  Context,
>(
  mm: MM,
  state: State,
  event: Event,
  context: Context,
): NextStateWithContext<MM, State, Event, Context> {
  const transition = mm.transitions.find(
    (t) => t.from === state && t.event === event,
  );

  return (
    transition !== undefined
      ? {
          state: transition.to,
          context: transition.reducer ? transition.reducer(context) : context,
        }
      : undefined
  ) as NextStateWithContext<MM, State, Event, Context>;
}
