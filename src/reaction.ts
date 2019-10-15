import { StoreValue } from "./createStore";
import { Trackers } from "./trackers";

export type Reaction = {
  cb: () => void;
};

export type ReactionObject<T> = {
  _track: (fn: () => T) => T;
  _dispose: () => void;
};

function createReaction<T extends StoreValue>(
  trackers: Trackers,
  cb: () => void
): ReactionObject<T> {
  const thisReaction: Reaction = { cb };

  trackers._reactions.set(thisReaction, new Set());
  return {
    _track: fn => {
      trackers._currentWatcher = thisReaction;
      const result = fn();
      trackers._currentWatcher = null;
      return result;
    },
    _dispose: () => {
      const usedValues = trackers._reactions.get(thisReaction);
      usedValues!.forEach(val =>
        trackers._depList.get(val)!.forEach(x => x.delete(thisReaction))
      );
      trackers._reactions.delete(thisReaction);
    }
  };
}

export { createReaction };
