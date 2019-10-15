import {
  useContext,
  FunctionComponent,
  memo as memoize,
  useReducer,
  useRef,
  useEffect
} from "react";
import { ReactionObject, createReaction } from "./reaction";
import { BasicObject, createStore, Store } from "./createStore";
import { context, StoreProvider } from "./context";

type VoidFn = () => void;

function observe<Props>(component: FunctionComponent<Props>) {
  const reducer = () => ({});
  const memo = memoize(function(props: Props) {
    const forceUpdate = useReducer(reducer, true)[1] as VoidFn;
    const store = useCtx();

    const reaction = useRef<ReactionObject<any>>();
    if (!reaction.current) {
      reaction.current = createReaction<any>(store._trackers, forceUpdate);
    }

    useEffect(() => reaction.current!._dispose, []);

    return reaction.current._track(() => component(props));
  });

  memo.displayName = `Observed(${component.displayName ||
    component.name ||
    "Component"})`;
  return memo;
}

function useStore<T extends BasicObject>(): T {
  return useCtx<T>()._state;
}

function useCtx<T extends BasicObject>() {
  const store = useContext(context) as Store<T>;
  if (!store) {
    throw new Error("No Store Provider found");
  }
  return store;
}

export { StoreProvider, createStore, useStore, observe };
