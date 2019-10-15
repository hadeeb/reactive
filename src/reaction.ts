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

  function cleanup() {
    const usedValues = trackers._reactions.get(thisReaction);
    if (usedValues) {
      usedValues.forEach(val =>
        trackers._depList.get(val)!.forEach(x => x.delete(thisReaction))
      );
    }
  }

  return {
    _track: fn => {
      // Reset dependencies from previous render
      cleanup();
      trackers._reactions.set(thisReaction, new Set());
      trackers._currentWatcher = thisReaction;
      const result = fn();
      trackers._currentWatcher = null;
      return result;
    },
    _dispose: cleanup
  };
}

export { createReaction };
