import { BasicObject, BasicArray } from "./createStore";
import { isObject, isArray, isSymbol, hasOwn } from "./util";
import { Trackers } from "./trackers";
import { enqueue } from "./enqueue";
import { Reaction } from "./reaction";

const $IterateTracker = Symbol();
const TYPE_ADD = 1;
const TYPE_EDIT = 2;
const TYPE_REMOVE = 3;

function observeObject<T extends BasicObject | BasicArray>(
  obj: T,
  trackers: Trackers
): T {
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
      addTrackers(trackers, target, prop);
      return isObject(res) ? observeObject(res as T, trackers) : res;
    },
    //Setter
    set(target, prop, value, reciever) {
      const result = Reflect.set(target, prop, value, reciever);
      if (hasOwn(target, prop)) {
        triggerTrackers(trackers, target, TYPE_ADD, prop);
      } else if (isArray(target)) {
        triggerTrackers(trackers, target, TYPE_EDIT, prop);
      }
      return result;
    },
    //Delete property
    deleteProperty(target, prop) {
      const result = Reflect.deleteProperty(target, prop);
      triggerTrackers(trackers, target, TYPE_REMOVE, prop);
      return result;
    },
    ownKeys(target) {
      addTrackers(trackers, target, $IterateTracker);
      return Reflect.ownKeys(target);
    },
    has(target, prop) {
      addTrackers(trackers, target, prop);
      return Reflect.has(target, prop);
    }
  });

  trackers._toProxy.set(obj, proxy);
  return proxy;
}

function addTrackers(
  trackers: Trackers,
  target: BasicObject | BasicArray,
  key: PropertyKey
) {
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
  trackers: Trackers,
  target: BasicObject | BasicArray,
  type: number,
  key: PropertyKey
) {
  const deps = trackers._depList.get(target);
  if (!deps) return;
  const reactions = new Set<Reaction>();
  const t = deps.get(key);
  t && t.forEach(x => reactions.add(x));

  if (type !== TYPE_EDIT) {
    const iterateKey = isArray(target) ? "length" : $IterateTracker;
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
