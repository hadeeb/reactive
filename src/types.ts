import { Opaque, ReadonlyDeep } from "type-fest";
import { StoreHook, ObservableObject } from "./internaltypes";

export { ObservableObject };

export type Store<
  T extends ObservableObject,
  EVENTS extends PropertyKey = PropertyKey
> = Opaque<{
  getState: () => ReadonlyDeep<T>;
  dispatch: Dispatch<EVENTS>;
  $: StoreHook<EVENTS>;
}>;

export type Dispatch<EVENTS extends PropertyKey = PropertyKey> = (
  action: EVENTS,
  payload?: any
) => void;

export type EventListener<
  T,
  EVENTS extends PropertyKey = PropertyKey,
  Args = any
> = (store: { state: T; dispatch: Dispatch<EVENTS> }, payload?: Args) => void;

export type EventListeners<T, KEYS extends PropertyKey> = Record<
  KEYS,
  EventListener<T, KEYS>
>;

// Helpers
export type GetEventTypes<T extends Store<any, any>> = T extends Store<
  any,
  infer P
>
  ? P
  : unknown;

export type GetStoreType<T extends Store<any, any>> = T extends Store<
  infer P,
  any
>
  ? P
  : unknown;

export type GetEvents<
  T extends EventListeners<any, any>
> = T extends EventListeners<any, infer P> ? P : unknown;
