import { ReadonlyDeep } from "type-fest";

import { ObservableObject, StoreHook } from "./internaltypes";

export { ObservableObject };

export type Store<
  State extends ObservableObject,
  EVENTS extends PropertyKey = PropertyKey
> = {
  getState: () => ReadonlyDeep<State>;
  dispatch: Dispatch<EVENTS>;
  $: StoreHook<EVENTS>;
};

export type Dispatch<EVENTS extends PropertyKey = PropertyKey> = (
  action: EVENTS,
  payload?: any
) => void;

export type EventListener<
  State extends ObservableObject,
  EVENTS extends PropertyKey = PropertyKey,
  Args = any
> = (
  store: { state: State; dispatch: Dispatch<EVENTS> },
  payload: Args
) => void;

export type EventListeners<
  State extends ObservableObject,
  KEYS extends PropertyKey
> = Record<KEYS, EventListener<State, KEYS>>;
