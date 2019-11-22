import {
  Component,
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  memo,
  MemoExoticComponent,
  PropsWithoutRef,
  ReactNode,
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
import { $IterateTracker } from "./observe";
import { createReaction } from "./reaction";
import { Dispatch, Store } from "./types";
import { ONE as CREATED_AND_SHOULD_UPDATE, TWO as MOUNTED } from "./util";

const NoProviderError =
  "No Store Provider found\nDid you forget to add StoreProvider?";

const reducer = () => ({});
const useForceUpdate = function() {
  return useReducer(reducer, true)[1] as VoidFunction;
};

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT = {};

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
  options = options || EMPTY_OBJECT;
  const observedComponent: RefForwardingComponent<
    T,
    Props
  > = function ObservedComponent(props, ref) {
    const forceUpdate = useForceUpdate();
    const reaction = useRef<ReactionObject<any>>();
    if (!reaction.current) {
      reaction.current = createReaction<any>(() => {
        if (reaction.current!._status === MOUNTED) {
          forceUpdate();
        } else {
          // This render didn't reach useEffect
          // Cleanup dependencies to avoid memory leak if this render is discarded
          reaction.current!._cleanup();
          // Mark it needs update if it reaches useEffect
          reaction.current!._status = CREATED_AND_SHOULD_UPDATE;
        }
      });
    }

    useEffect(() => {
      if (reaction.current!._status === CREATED_AND_SHOULD_UPDATE) {
        // An update was scheduled before useEffect
        forceUpdate();
      }
      // Mark the current reaction as valid
      reaction.current!._status = MOUNTED;
      return reaction.current!._cleanup;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, EMPTY_ARRAY);

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

  invariant(store, NoProviderError);

  return [store.getState(), store.dispatch];
};

interface Observed extends Component {
  [$IterateTracker]: ReactionObject<ReactNode>;
}

function decorate<T extends typeof Component>(component: T): T {
  const target = component.prototype as Observed;
  const baseRender = target.render;

  target.render = function() {
    var that = this;
    invariant(that.context, NoProviderError);
    that[$IterateTracker] = createReaction<ReactNode>(
      target.forceUpdate.bind(that)
    );
    const boundRender = baseRender.bind(that);
    function trackedRender() {
      return that[$IterateTracker]._track(boundRender);
    }
    target.render = trackedRender;
    return trackedRender();
  };
  const baseUnmount = target.componentWillUnmount;
  target.componentWillUnmount = function() {
    baseUnmount && baseUnmount();
    this[$IterateTracker]._cleanup();
  };
  invariant(
    !component.contextType,
    "Don't use contextType with 'decorate'\n'decorate' uses contextType to inject store to 'this.context'"
  );
  component.contextType = context;
  return component;
}

export { observe, decorate, useStore };
