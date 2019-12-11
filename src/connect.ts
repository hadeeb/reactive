import React from "react";
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
import { ONE as CREATED_AND_SHOULD_UPDATE, TWO as MOUNTED } from "./util";

const NoProviderError =
  "No Store Provider found\nDid you forget to add StoreProvider?";

function reducer() {
  return {};
}
function useForceUpdate() {
  return React.useReducer(reducer, true)[1] as VoidFunction;
}

const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT = {};

function observe<Props>(
  component: React.FunctionComponent<Props>
): React.MemoExoticComponent<React.FunctionComponent<Props>>;
function observe<Props, T = unknown>(
  component: React.RefForwardingComponent<T, Props>,
  options: {
    forwardRef: boolean;
  }
): React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<Props> & React.RefAttributes<T>
  >
>;
function observe<Props, T = unknown>(
  component: React.RefForwardingComponent<T, Props>,
  options?: {
    forwardRef?: boolean;
  }
) {
  options = options || EMPTY_OBJECT;
  const observedComponent: React.RefForwardingComponent<
    T,
    Props
  > = function ObservedComponent(props, ref) {
    const forceUpdate = useForceUpdate();
    const reaction = React.useRef<ReactionObject<any>>();
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

    React.useEffect(() => {
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
  return React.memo(
    options.forwardRef ? React.forwardRef(observedComponent) : observedComponent
  );
}

function useStore<StoreType extends Store<any, any>>(): [
  ReadonlyDeep<GetStoreType<StoreType>>,
  Dispatch<GetEventTypes<StoreType>>
] {
  const store = React.useContext(context);

  invariant(store, NoProviderError);

  return [store.getState(), store.dispatch];
}

interface Observed extends React.Component {
  $: ReactionObject<React.ReactNode>;
}

function decorate<T extends typeof React.Component>(component: T): T {
  const target = component.prototype as Observed;
  const baseRender = target.render;
  const baseUnmount = target.componentWillUnmount;

  target.render = function() {
    var that = this;
    invariant(that.context, NoProviderError);
    that.$ = createReaction<React.ReactNode>(target.forceUpdate.bind(that));
    const boundRender = baseRender.bind(that);
    function trackedRender() {
      return that.$._track(boundRender);
    }
    target.render = trackedRender;
    return trackedRender();
  };

  target.componentWillUnmount = function() {
    baseUnmount && baseUnmount();
    this.$._cleanup();
  };
  invariant(
    !component.contextType,
    "Don't use contextType with 'decorate'\n'decorate' uses contextType to inject store to 'this.context'"
  );
  component.contextType = context;
  return component;
}

export { observe, decorate, useStore };
