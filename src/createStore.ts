import { JsonObject } from "type-fest";
import { observeObject } from "./observe";
import { trackers } from "./trackers";
import { Events, Store, MiddleWare } from "./types";

function createStore<T extends JsonObject, EVENTS extends PropertyKey>(
  events: Events<T, EVENTS>,
  initialState: T
): Store<T, EVENTS> {
  const state = observeObject(initialState);
  const eventsClone = Object.assign({}, events);

  const emit = function(event: EVENTS, payload: any) {
    const prevTracker = trackers._currentWatcher;
    trackers._currentWatcher = null;
    store.hook(store, event, payload);
    trackers._currentWatcher = prevTracker;
  };

  const defaultHook: MiddleWare<EVENTS> = (_store, event, payload) => {
    if (eventsClone[event]) {
      trackers._isEditing = true;
      eventsClone[event](state, payload);
      trackers._isEditing = false;
    }
  };

  const store = {
    state,
    emit,
    hook: defaultHook,
    addEvents(evts, newState) {
      Object.assign(eventsClone, evts);
      Object.assign(state, newState);
    }
  } as Store<T, EVENTS>;
  return store;
}

export { createStore };
