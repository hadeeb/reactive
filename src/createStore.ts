import { observeObject } from "./observe";
import { trackers } from "./trackers";
import { EventListeners, Store, Dispatch } from "./types";
import { StoreHook, ObservableObject } from "./internaltypes";

const createStore = function<
  T extends ObservableObject,
  EVENTS extends PropertyKey
>(events: EventListeners<T, EVENTS>, initialState: T): Store<T, EVENTS> {
  const state = observeObject(initialState);

  const dispatch: Dispatch<EVENTS> = function(action, payload) {
    const prevTracker = trackers._currentWatcher;
    trackers._currentWatcher = null;
    trackers._isEditing = true;
    store.$(store, action, payload);
    trackers._isEditing = false;
    trackers._currentWatcher = prevTracker;
  };

  const defaultHook: StoreHook<EVENTS> = (_store, event, payload) => {
    if (events[event]) {
      events[event]({ state, dispatch }, payload);
    }
  };

  const store = {
    getState: () => state,
    dispatch: dispatch,
    $: defaultHook
  } as Store<T, EVENTS>;
  return store;
};

export { createStore };
