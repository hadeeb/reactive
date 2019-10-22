import { Trackers } from "./types";

const trackers: Trackers = {
  _isEditing: false,
  _currentWatcher: null,
  _depList: new WeakMap(),
  _reactions: new WeakMap(),
  _toProxy: new WeakMap()
};

export { trackers };
