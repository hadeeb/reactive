import React from "react";

import { Store } from "./types";

const context = React.createContext((false as unknown) as Store<any, any>);

if (process.env.NODE_ENV !== "production") {
  context.displayName = `ReactiveStore`;
}

type ProviderProps = { store: Store<any, any>; children: React.ReactNode };

function StoreProvider(props: ProviderProps) {
  return React.createElement(context.Provider, {
    value: props.store,
    children: props.children
  });
}

export { StoreProvider, context };
