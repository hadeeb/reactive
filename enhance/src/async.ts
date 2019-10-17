import { Store, GetStoreType, GetEventTypes } from "reactive";
import { ReadonlyDeep } from "type-fest";

type AsyncArg<T extends Store<any, any>, KEYS> = {
  state: ReadonlyDeep<GetStoreType<T>>;
  emit: (event: GetEventTypes<T> | KEYS, ...args: any[]) => void;
};

export type AsyncEvent<
  T extends Store<any, any>,
  KEYS,
  Args extends any[] = any[]
> = (t: AsyncArg<T, KEYS>, ...args: Args) => void | Promise<void>;

export type AsyncEvents<
  T extends Store<any, any>,
  KEYS extends PropertyKey
> = Record<KEYS, AsyncEvent<T, KEYS>>;

function addAsyncEvents<T extends Store<any, any>, EVENTS extends PropertyKey>(
  store: T,
  events: AsyncEvents<T, EVENTS>
): Store<GetStoreType<T>, GetEventTypes<T> | EVENTS> {
  const oldHook = store.hook;

  store.hook = (store, event: EVENTS, payload: any) => {
    oldHook(store, event, payload);
    events[event] &&
      events[event]({
        state: store.state,
        emit: store.emit
      });
  };
  return store;
}

export { addAsyncEvents };
