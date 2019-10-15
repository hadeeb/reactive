import { Reaction } from "./reaction";
import { BasicArray, BasicObject } from "./createStore";

export type Trackers = {
  _currentWatcher: Reaction | null;
  _depList: WeakMap<BasicArray | BasicObject, Map<PropertyKey, Set<Reaction>>>;
  _reactions: WeakMap<Reaction, Set<BasicObject | BasicArray>>;
  _toProxy: WeakMap<BasicArray | BasicObject, BasicArray | BasicObject>;
};
function createTrackers(): Trackers {
  return {
    _currentWatcher: null,
    _depList: new WeakMap<
      BasicArray | BasicObject,
      Map<PropertyKey, Set<Reaction>>
    >(),
    _reactions: new WeakMap<Reaction, Set<BasicObject | BasicArray>>(),
    _toProxy: new WeakMap<BasicArray | BasicObject, BasicArray | BasicObject>()
  };
}

export { createTrackers };
