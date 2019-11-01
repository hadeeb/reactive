import {
  RefForwardingComponent,
  memo,
  forwardRef,
  useReducer,
  useRef,
  useEffect,
  useContext,
  MemoExoticComponent,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes
} from "react";
import invariant from "tiny-invariant";
import { ReadonlyDeep, JsonObject } from "type-fest";

import { context } from "./context";
import { createReaction } from "./reaction";
import { ReactionObject, Store, VoidFunction, Emit } from "./types";

const reducer = () => ({});
function useForceUpdate() {
  return useReducer(reducer, true)[1] as VoidFunction;
}

function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<T>>
> {
  const observedComponent = memo(
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

  observedComponent.displayName = `Observed(${component.displayName ||
    component.name ||
    "Component"})`;
  return observedComponent;
}

function useStore<
  StoreType extends JsonObject,
  EVENTS extends PropertyKey = PropertyKey
>(): ReadonlyDeep<{
  store: StoreType;
  emit: Emit<EVENTS>;
}> {
  const store: Store<StoreType, EVENTS> = useContext(context);

  invariant(
    store,
    "No Store Provider found\n" + "Did you forget to add StoreProvider?"
  );

  return {
    store: store.state as ReadonlyDeep<StoreType>,
    emit: store.emit
  };
}

export { observe, useStore };
