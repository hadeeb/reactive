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
import { ReactionObject, Store, VoidFunction, Emit } from "./types";
import { JsonObject, ReadonlyDeep } from "type-fest";

function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>
) {
  const reducer = () => ({});
  const memo = memoize(
    forwardRef<T, Props>(function(props, ref) {
      const forceUpdate = useReducer(reducer, true)[1] as VoidFunction;

      const store = useContext(context);
      if (!store && process.env.NODE_ENV !== "production") {
        throw new Error("No Store Provider found");
      }

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

export { observe, useStore };
