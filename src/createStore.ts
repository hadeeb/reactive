import { Primitive } from "type-fest";
import { observeObject } from "./observe";
import { createTrackers, Trackers } from "./trackers";

export type BasicObject = Record<PropertyKey, StoreValue>;
export interface BasicArray extends Array<Primitive | BasicObject> {}
interface BasicObjectChild extends BasicObject {}

export type StoreValue = BasicObjectChild | BasicArray | Primitive;

export type Store<T> = {
  _state: T;
  _trackers: Trackers;
};

function createStore<T extends BasicObject>(initialState: T): Store<T> {
  const trackers = createTrackers();
  const state = observeObject(initialState, trackers);
  return {
    _state: state,
    _trackers: trackers
  };
}

export { createStore };
