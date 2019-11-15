import invariant from "tiny-invariant";

import { enqueue } from "./enqueue";
import { ObservableObject } from "./internaltypes";
import { trackers } from "./trackers";
import {
  isSymbol,
  ONE as TYPE_EDIT,
  OneofThree,
  TWO as TYPE_REMOVE,
  ZERO as TYPE_ADD
} from "./util";

const $IterateTracker = Symbol();

const InvalidMutationMessage =
  "Store shouldn't be modified outside event listeners\n" +
  "If you are trying to do some asynchronous actions inside event listeners,\n" +
  "dispatch another action after async operations";

const observeObject = function<T extends ObservableObject>(obj: T): T {
  if (trackers._toObject.has(obj)) {
    // This is a proxy
    return obj;
  }

  if (trackers._toProxy.has(obj)) {
    // Already tracked
    return trackers._toProxy.get(obj) as T;
  }

  const proxy = new Proxy(obj, {
    //Getter
    get(target, prop, reciever) {
      const res = Reflect.get(target, prop, reciever);
      if (isSymbol(prop) && builtInSymbols.has(prop)) {
        return res;
      }
      addTrackers(target, prop);
      return typeof res === "object" && res ? observeObject(res as T) : res;
    },
    //Setter
    set(target, prop, value, reciever) {
      invariant(trackers._isEditing, InvalidMutationMessage);

      if (target.hasOwnProperty(prop)) {
        const currentValue = Reflect.get(target, prop);
        if (currentValue !== value) {
          triggerTrackers(target, TYPE_EDIT, prop);
        }
      } else {
        triggerTrackers(target, TYPE_ADD, prop);
      }

      const unwrappedValue = trackers._toObject.has(value)
        ? // This is a proxy, get the actual object
          trackers._toObject.get(value)
        : value;

      return Reflect.set(target, prop, unwrappedValue, reciever);
    },
    //Delete property
    deleteProperty(target, prop) {
      invariant(trackers._isEditing, InvalidMutationMessage);
      triggerTrackers(target, TYPE_REMOVE, prop);
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(target) {
      addTrackers(target, $IterateTracker);
      return Reflect.ownKeys(target);
    },
    has(target, prop) {
      addTrackers(target, prop);
      return Reflect.has(target, prop);
    }
  });

  trackers._toProxy.set(obj, proxy);
  trackers._toObject.set(proxy, obj);
  return proxy;
};

const addTrackers = function(target: ObservableObject, key: PropertyKey) {
  if (trackers._currentWatcher) {
    let currentTracker = trackers._depList.get(target);
    if (!currentTracker) {
      trackers._depList.set(target, (currentTracker = new Map()));
    }
    let deps = currentTracker.get(key);
    if (!deps) {
      currentTracker.set(key, (deps = new Set()));
    }
    deps.add(trackers._currentWatcher);
    const depList = trackers._reactions.get(trackers._currentWatcher);
    if (depList) {
      depList.add(target);
    }
  }
};

const triggerTrackers = function(
  target: ObservableObject,
  type: OneofThree,
  key: PropertyKey
) {
  const deps = trackers._depList.get(target);
  if (!deps) return;
  const reactions = deps.get(key);
  if (reactions) {
    reactions.forEach(x => {
      enqueue(x);
    });
  }

  if (type !== TYPE_EDIT) {
    const iterateKey = Array.isArray(target) ? "length" : $IterateTracker;
    const reactions = deps.get(iterateKey);
    if (reactions) {
      reactions.forEach(x => {
        enqueue(x);
      });
    }
    if (type === TYPE_REMOVE) {
      deps.delete(key);
    }
  }
};

const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(isSymbol)
);

export { observeObject };
