import { FunctionComponent, createContext, createElement } from "react";
import { BasicObject, Store } from "./createStore";

const context = createContext<Store<BasicObject>>((false as unknown) as Store<
  BasicObject
>);

const Provider = context.Provider;

const StoreProvider: FunctionComponent<{ store: Store<BasicObject> }> = ({
  store,
  children
}) => createElement(Provider, { value: store, children });

export { StoreProvider, context };
