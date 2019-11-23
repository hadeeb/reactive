import { createContext, createElement, ReactNode } from "react";

import { Store } from "./types";

const context = createContext((false as unknown) as Store<any, any>);

if (process.env.NODE_ENV !== "production") {
  context.displayName = `ReactiveStore`;
}

type ProviderProps = { store: Store<any, any>; children: ReactNode };

function StoreProvider(props: ProviderProps) {
  return createElement(context.Provider, {
    value: props.store,
    children: props.children
  });
}

export { StoreProvider, context };
