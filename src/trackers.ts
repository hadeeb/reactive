import { Trackers } from "./types";

function createTrackers(): Trackers {
  return {
    _isEditing: false,
    _currentWatcher: null,
    _depList: new WeakMap(),
    _reactions: new WeakMap(),
    _toProxy: new WeakMap()
  };
}

export { createTrackers };
