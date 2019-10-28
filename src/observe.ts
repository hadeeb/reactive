import { isSymbol } from "./util";
import { enqueue } from "./enqueue";
import { Reaction, ObservableObject } from "./types";
import { trackers } from "./trackers";

const $IterateTracker = Symbol();
const TYPE_ADD = 1;
const TYPE_EDIT = 2;
const TYPE_REMOVE = 3;

function observeObject<T extends ObservableObject>(obj: T): T {
  // Already tracked
  if (trackers._toProxy.has(obj)) {
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
      if (!trackers._isEditing) {
        if (process.env.NODE_ENV !== "production") {
          throw new Error(
            "Store shouldn't be modified outside event listeners"
          );
        }
        return false;
      }
      const result = Reflect.set(target, prop, value, reciever);
      if (target.hasOwnProperty(prop)) {
        triggerTrackers(target, TYPE_EDIT, prop);
      } else {
        triggerTrackers(target, TYPE_ADD, prop);
      }
      return result;
    },
    //Delete property
    deleteProperty(target, prop) {
      const result = Reflect.deleteProperty(target, prop);
      triggerTrackers(target, TYPE_REMOVE, prop);
      return result;
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
  return proxy;
}

function addTrackers(target: ObservableObject, key: PropertyKey) {
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
}

function triggerTrackers(
  target: ObservableObject,
  type: number,
  key: PropertyKey
) {
  const deps = trackers._depList.get(target);
  if (!deps) return;
  const reactions = new Set<Reaction>();
  const t = deps.get(key);
  t && t.forEach(x => reactions.add(x));

  if (type !== TYPE_EDIT) {
    const iterateKey = Array.isArray(target) ? "length" : $IterateTracker;
    const t = deps.get(iterateKey);
    t && t.forEach(x => reactions.add(x));
    if (type === TYPE_REMOVE) {
      deps.delete(key);
    }
  }

  reactions.forEach(x => {
    enqueue(x);
  });
}

const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(isSymbol)
);

export { observeObject };
