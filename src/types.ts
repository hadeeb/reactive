import { Opaque, JsonObject, ReadonlyDeep } from "type-fest";
import { VoidFunction, StoreHook } from "./internaltypes";

export type Action<EVENTS extends PropertyKey = PropertyKey> = {
  type: EVENTS;
  payload?: any;
};

export type Store<
  T extends JsonObject,
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

export type Options = {
  /**
   * Batch updates.
   *
   * It should execute the callback.
   * @example
   * options.batch = ReactDOM.unstable_batchedUpdates
   */
  batch: (callback: VoidFunction) => void;
};

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
