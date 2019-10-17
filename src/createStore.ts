import { JsonObject } from "type-fest";
import { observeObject } from "./observe";
import { createTrackers } from "./trackers";
import { Events, Store } from "./types";

function createStore<T extends JsonObject, EVENTS extends PropertyKey>(
  events: Events<T, EVENTS>,
  initialState: T = {} as T
): Store<T, EVENTS> {
  const trackers = createTrackers();
  const state = observeObject(initialState, trackers);

  const emit = function(event: EVENTS, ...args: any) {
    store.hook(store, event, ...args);
  };

  const defaultHook = (
    _store: Store<T, EVENTS>,
    event: EVENTS,
    ...args: any
  ) => {
    trackers._isEditing = true;
    events[event] && events[event](state, ...args);
    trackers._isEditing = false;
  };

  const store = {
    state,
    _trackers: trackers,
    emit,
    hook: defaultHook,
    addEvents(evts) {
      Object.assign(events, evts);
    }
  } as Store<T, EVENTS>;
  return store;
}

export { createStore };
