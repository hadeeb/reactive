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
import { Store, Dispatch } from "./types";
import { VoidFunction, ReactionObject } from "./internaltypes";

const reducer = () => ({});
const useForceUpdate = function() {
  return useReducer(reducer, true)[1] as VoidFunction;
};

const observe = function<Props, T = unknown>(
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
};

const useStore = function<
  StoreType extends JsonObject,
  EVENTS extends PropertyKey = PropertyKey
>(): [ReadonlyDeep<StoreType>, Dispatch<EVENTS>] {
  const store: Store<StoreType, EVENTS> = useContext(context);

  invariant(
    store,
    "No Store Provider found\n" + "Did you forget to add StoreProvider?"
  );

  return [store.getState() as ReadonlyDeep<StoreType>, store.dispatch];
};

export { observe, useStore };
