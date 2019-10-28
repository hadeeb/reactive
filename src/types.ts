import { Opaque, JsonObject, JsonArray } from "type-fest";

export type MiddleWare<EVENTS extends PropertyKey> = (
  store: Store<any, EVENTS>,
  event: EVENTS,
  args?: any
) => void;

export type Reaction = {
  _callback: VoidFunction;
};

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _dispose: () => void;
};

export type ObservableObject = JsonObject | JsonArray;

type PropertyKeyToReactionMap = Map<PropertyKey, Set<Reaction>>;
type ObjectSet = Set<ObservableObject>;

export type Trackers = {
  _isEditing: boolean;
  _currentWatcher: Reaction | null;
  _depList: WeakMap<ObservableObject, PropertyKeyToReactionMap>;
  _reactions: WeakMap<Reaction, ObjectSet>;
  _toProxy: WeakMap<ObservableObject, ObservableObject>;
};

export type Store<
  T extends JsonObject,
  EVENTS extends PropertyKey = PropertyKey
> = Opaque<{
  state: T;
  emit: Emit<EVENTS>;
  addEvents: <NewEVENTS extends PropertyKey, NewSTATE extends JsonObject>(
    events: Events<T & NewSTATE, NewEVENTS>,
    newState?: NewSTATE
  ) => Store<T & NewSTATE, EVENTS | NewEVENTS>;
  hook: MiddleWare<any>;
}>;

export type Emit<EVENTS extends PropertyKey = PropertyKey> = (
  event: EVENTS,
  args?: any
) => void;

export type Event<T, Args = any> = (store: T, args?: Args) => void;

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
