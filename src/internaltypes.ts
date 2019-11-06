import { JsonObject, JsonArray, ReadonlyDeep } from "type-fest";
import { Store, Action } from "./types";

export type VoidFunction = () => void;

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _dispose: () => void;
};

export type ObservableObject = JsonObject | JsonArray;

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
