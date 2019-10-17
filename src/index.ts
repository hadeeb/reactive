import {
  useContext,
  memo as memoize,
  useReducer,
  useRef,
  useEffect,
  RefForwardingComponent,
  forwardRef
} from "react";
import { createReaction } from "./reaction";
import { createStore } from "./createStore";
import { context, StoreProvider } from "./context";
import { ReadonlyDeep, JsonObject } from "type-fest";
import { Store, VoidFunction, ReactionObject } from "./types";
import { options } from "./enqueue";

function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>
) {
  const reducer = () => ({});
  const memo = memoize(
    forwardRef<T, Props>(function(props, ref) {
      const forceUpdate = useReducer(reducer, true)[1] as VoidFunction;
      const store = useCtx();

      const reaction = useRef<ReactionObject<any>>();
      if (!reaction.current) {
        reaction.current = createReaction<any>(store._trackers, forceUpdate);
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
  emit: (event: EVENTS, ...args: any[]) => void;
}> {
  const store = useCtx<StoreType, EVENTS>();

  return {
    store: store.state as ReadonlyDeep<StoreType>,
    emit: store.emit
  };
}

function useCtx<
  T extends JsonObject,
  EVENTS extends PropertyKey = PropertyKey
>() {
  const store = useContext(context) as Store<T, EVENTS>;
  if (!store) {
    throw new Error("No Store Provider found");
  }
  return store;
}

export * from "./types";

export { StoreProvider, createStore, useStore, observe, options };
