import {
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  memo,
  MemoExoticComponent,
  PropsWithoutRef,
  RefAttributes,
  RefForwardingComponent,
  useContext,
  useEffect,
  useReducer,
  useRef
} from "react";
import invariant from "tiny-invariant";
import { ReadonlyDeep } from "type-fest";

import { context } from "./context";
import {
  GetEventTypes,
  GetStoreType,
  ReactionObject,
  VoidFunction
} from "./internaltypes";
import { createReaction } from "./reaction";
import { Dispatch, Store } from "./types";

const reducer = () => ({});
const useForceUpdate = function() {
  return useReducer(reducer, true)[1] as VoidFunction;
};

function observe<Props>(
  component: FunctionComponent<Props>
): MemoExoticComponent<FunctionComponent<Props>>;
function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>,
  options: {
    forwardRef: boolean;
  }
): MemoExoticComponent<
  ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<T>>
>;
function observe<Props, T = unknown>(
  component: RefForwardingComponent<T, Props>,
  options?: {
    forwardRef?: boolean;
  }
) {
  options = options || {};
  const observedComponent: RefForwardingComponent<
    T,
    Props
  > = function ObservedComponent(props, ref) {
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
  return memo(
    options.forwardRef ? forwardRef(observedComponent) : observedComponent
  );
}

const useStore = function<StoreType extends Store<any>>(): [
  ReadonlyDeep<GetStoreType<StoreType>>,
  Dispatch<GetEventTypes<StoreType>>
] {
  const store = useContext(context);

  invariant(
    store,
    "No Store Provider found\nDid you forget to add StoreProvider?"
  );

  return [store.getState(), store.dispatch];
};

export { observe, useStore };
