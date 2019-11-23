import { Primitive, ReadonlyDeep } from "type-fest";

import { Store } from "./types";
import { OneofThree } from "./util";

interface StoreObject extends Record<PropertyKey, StoreValue> {}

interface StoreArray extends Array<StoreValue> {}

type StoreValue = Primitive | Function | StoreArray | StoreObject;

export type VoidFunction = () => void;

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _status: OneofThree;
  _cleanup: () => void;
};

export type ObservableObject = StoreObject | StoreArray;

type PropertyKeyToReactionMap = Map<PropertyKey, Set<Reaction>>;
type ObjectSet = Set<ObservableObject>;

export type Reaction = {
  _callback: VoidFunction;
};

export type Trackers = {
  _isEditing: boolean;
  _currentWatcher: Reaction | false;
  _depList: WeakMap<ObservableObject, PropertyKeyToReactionMap>;
  _reactions: WeakMap<Reaction, ObjectSet>;
  _toProxy: WeakMap<ObservableObject, ObservableObject>;
  _toObject: WeakMap<ObservableObject, ObservableObject>;
};

export type StoreHook<EVENTS extends PropertyKey> = (
  store: ReadonlyDeep<Store<any, EVENTS>>,
  action: EVENTS,
  payload: any
) => void;

export type Options = {
  /**
   * Batch updates.
   *
   * It should execute the callback.
   * @example
   * options.batch = ReactDOM.unstable_batchedUpdates
   */
  batch?: (callback: VoidFunction) => void;
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
