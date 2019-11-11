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
  RefAttributes,
  Ref
} from "react";
import invariant from "tiny-invariant";
import { ReadonlyDeep } from "type-fest";

import { context } from "./context";
import { createReaction } from "./reaction";
import { Store, Dispatch } from "./types";
import {
  VoidFunction,
  ReactionObject,
  GetStoreType,
  GetEventTypes
} from "./internaltypes";

const reducer = () => ({});
const useForceUpdate = function() {
  return useReducer(reducer, true)[1] as VoidFunction;
};

const observe = function<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<T>>
> {
  const observedComponent = function(props: Props, ref: Ref<T>) {
    const forceUpdate = useForceUpdate();
    const reaction = useRef<ReactionObject<any>>();
    if (!reaction.current) {
      reaction.current = createReaction<any>(forceUpdate);
    }

    useEffect(() => reaction.current!._dispose, []);

    return reaction.current._track(() => component(props, ref));
  };

  if (process.env.NODE_ENV !== "production") {
    observedComponent.displayName = `Observed(${component.displayName ||
      component.name ||
      "Component"})`;
  }
  return memo(forwardRef(observedComponent));
};

const useStore = function<StoreType extends Store<any>>(): [
  ReadonlyDeep<GetStoreType<StoreType>>,
  Dispatch<GetEventTypes<StoreType>>
] {
  const store = useContext(context);

  invariant(
    store,
    "No Store Provider found\n" + "Did you forget to add StoreProvider?"
  );

  return [store.getState(), store.dispatch];
};

export { observe, useStore };
