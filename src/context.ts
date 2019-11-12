import { createContext, createElement, FunctionComponent } from "react";

import { Store } from "./types";

const context = createContext((false as unknown) as Store<any, any>);

if (process.env.NODE_ENV !== "production") {
  context.displayName = `ReactiveStore`;
}

const StoreProvider: FunctionComponent<{ store: Store<any, any> }> = ({
  store,
  children
}) => createElement(context.Provider, { value: store, children });

export { StoreProvider, context };
