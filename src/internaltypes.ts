import { ReadonlyDeep, Primitive } from "type-fest";
import { Store } from "./types";

interface StoreObject extends Record<PropertyKey, StoreValue> {}

interface StoreArray extends Array<StoreValue> {}

type StoreValue = Primitive | Function | StoreArray | StoreObject;

export type VoidFunction = () => void;

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _dispose: () => void;
};

export type ObservableObject = StoreObject | StoreArray;

type PropertyKeyToReactionMap = Map<PropertyKey, Set<Reaction>>;
type ObjectSet = Set<ObservableObject>;

export type Reaction = {
  _callback: VoidFunction;
};

export type Trackers = {
  _isEditing: boolean;
  _currentWatcher: Reaction | null;
  _depList: WeakMap<ObservableObject, PropertyKeyToReactionMap>;
  _reactions: WeakMap<Reaction, ObjectSet>;
  _toProxy: WeakMap<ObservableObject, ObservableObject>;
};

export type StoreHook<EVENTS extends PropertyKey> = (
  store: ReadonlyDeep<Store<any, EVENTS>>,
  action: EVENTS,
  payload?: any
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
