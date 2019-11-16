import { ReadonlyDeep } from "type-fest";

import { ObservableObject, StoreHook } from "./internaltypes";

export { ObservableObject };

export type Store<
  T extends ObservableObject,
  EVENTS extends PropertyKey = PropertyKey
> = {
  getState: () => ReadonlyDeep<T>;
  dispatch: Dispatch<EVENTS>;
  $: StoreHook<EVENTS>;
};

export type Dispatch<EVENTS extends PropertyKey = PropertyKey> = (
  action: EVENTS,
  payload?: any
) => void;

export type EventListener<
  T extends ObservableObject,
  EVENTS extends PropertyKey = PropertyKey,
  Args = any
> = (store: { state: T; dispatch: Dispatch<EVENTS> }, payload: Args) => void;

export type EventListeners<
  T extends ObservableObject,
  KEYS extends PropertyKey
> = Record<KEYS, EventListener<T, KEYS>>;
