import { ObservableObject, StoreHook } from "./internaltypes";
import { observeObject } from "./observe";
import { trackers } from "./trackers";
import { Dispatch, EventListeners, Store } from "./types";

const createStore = function<
  State extends ObservableObject,
  EVENTS extends PropertyKey
>(events: EventListeners<State, EVENTS>, initialState: State) {
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
  } as Store<State, EVENTS>;
  return store;
};

export { createStore };
