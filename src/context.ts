import { FunctionComponent, createContext, createElement } from "react";
import { Store } from "./types";

const context = createContext<Store<any, any>>((false as unknown) as Store<
  any,
  any
>);

const Provider = context.Provider;

const StoreProvider: FunctionComponent<{ store: Store<any, any> }> = ({
  store,
  children
}) => createElement(Provider, { value: store, children });

export { StoreProvider, context };
