import { Opaque, JsonObject, JsonArray } from "type-fest";

export type MiddleWare = (
  store: Store<any, any>,
  event: any,
  ...args: any
) => void;

export type Reaction = {
  cb: () => void;
};

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _dispose: () => void;
};

export type Trackers = {
  _isEditing: boolean;
  _currentWatcher: Reaction | null;
  _depList: WeakMap<JsonObject | JsonArray, Map<PropertyKey, Set<Reaction>>>;
  _reactions: WeakMap<Reaction, Set<JsonObject | JsonArray>>;
  _toProxy: WeakMap<JsonObject | JsonArray, JsonObject | JsonArray>;
};

export type Store<T, EVENTS = PropertyKey> = Opaque<{
  state: T;
  _trackers: Trackers;
  emit: (event: EVENTS, ...args: any[]) => void;
  addEvents: <Q extends PropertyKey>(events: Events<T, Q>) => void;
  hook: MiddleWare;
}>;

type Event<T, Args extends any[] = any[]> = (store: T, ...args: Args) => void;

export type Events<T, KEYS extends PropertyKey> = Record<KEYS, Event<T>>;

export type VoidFunction = () => void;

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
