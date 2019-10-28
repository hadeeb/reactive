import { JsonObject } from "type-fest";
import { observeObject } from "./observe";
import { trackers } from "./trackers";
import { Events, Store, MiddleWare } from "./types";

function createStore<T extends JsonObject, EVENTS extends PropertyKey>(
  events: Events<T, EVENTS>,
  initialState: T = {} as T
): Store<T, EVENTS> {
  const state = observeObject(initialState);

  const emit = function(event: EVENTS, args: any) {
    store.hook(store, event, args);
  };

  const defaultHook: MiddleWare<EVENTS> = (_store, event, args: any) => {
    if (events[event]) {
      trackers._isEditing = true;
      events[event](state, args);
      trackers._isEditing = false;
    }
  };

  const store = {
    state,
    emit,
    hook: defaultHook,
    addEvents(evts, newState) {
      Object.assign(events, evts);
      Object.assign(state, newState);
      return store;
    }
  } as Store<T, EVENTS>;
  return store;
}

export { createStore };
