import {
  RefForwardingComponent,
  memo as memoize,
  forwardRef,
  useReducer,
  useRef,
  useEffect,
  useContext
} from "react";
import { context } from "./context";

import { createReaction } from "./reaction";
import { ReactionObject, Store, VoidFunction, Emit, Options } from "./types";
import { ReadonlyDeep, JsonObject } from "type-fest";
import { options } from "./enqueue";

const reducer = () => ({});
function useForceUpdate() {
  return useReducer(reducer, true)[1] as VoidFunction;
}

function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>
) {
  const memo = memoize(
    forwardRef<T, Props>(function(props, ref) {
      const forceUpdate = useForceUpdate();
      const reaction = useRef<ReactionObject<any>>();
      if (!reaction.current) {
        reaction.current = createReaction<any>(forceUpdate);
      }

      useEffect(() => reaction.current!._dispose, []);

      return reaction.current._track(() => component(props, ref));
    })
  );

  memo.displayName = `Observed(${component.displayName ||
    component.name ||
    "Component"})`;
  return memo;
}

function useStore<
  StoreType extends JsonObject,
  EVENTS extends PropertyKey = PropertyKey
>(): ReadonlyDeep<{
  store: StoreType;
  emit: Emit<EVENTS>;
}> {
  const store: Store<StoreType, EVENTS> = useContext(context);

  if (!store && process.env.NODE_ENV !== "production") {
    throw new Error("No Store Provider found");
  }

  return {
    store: store.state as ReadonlyDeep<StoreType>,
    emit: store.emit
  };
}

function useComputed<U, State extends JsonObject>(
  fn: (state: State) => U,
  isEqual?: (oldValue: U, newValue: U) => boolean
): U {
  const store: Store<State> = useContext(context);

  if (!store && process.env.NODE_ENV !== "production") {
    throw new Error("No Store Provider found");
  }

  const reaction = useRef<ReactionObject<U>>();
  if (!reaction.current) {
    reaction.current = createReaction<U>(updateIfChanged);
  }
  const lastFn = useRef<(state: State) => U>();
  lastFn.current = fn;

  // Lazy Initialization hack
  // Reuse options object
  const lastResult = useRef<U | Options>(options);
  if (lastResult.current === options) {
    lastResult.current = getComputed();
  }

  function getComputed(): U {
    return reaction.current!._track(() => lastFn.current!(store.state));
  }

  const forceUpdate = useForceUpdate();
  function updateIfChanged() {
    const currentResult = lastResult.current;
    lastResult.current = getComputed();
    if (!(isEqual || Object.is)(currentResult as U, lastResult.current)) {
      forceUpdate();
    }
  }

  useEffect(() => reaction.current!._dispose, []);
  return lastResult.current as U;
}

export { observe, useStore, useComputed };
