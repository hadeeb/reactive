import { Reaction, ReactionObject, VoidFunction } from "./internaltypes";
import { trackers } from "./trackers";
import { ZERO as CREATED } from "./util";

function createReaction<T>(callback: VoidFunction): ReactionObject<T> {
  const thisReaction: Reaction = { _callback: callback };

  const cleanup = function() {
    const usedValues = trackers._reactions.get(thisReaction);
    if (usedValues) {
      usedValues.forEach(val => {
        trackers._depList.get(val)!.forEach(x => {
          x.delete(thisReaction);
        });
      });
    }
  };

  return {
    _track: fn => {
      // Reset dependencies from previous render
      cleanup();
      trackers._reactions.set(thisReaction, new Set());
      const prevTracker = trackers._currentWatcher;
      trackers._currentWatcher = thisReaction;
      const result = fn();
      trackers._currentWatcher = prevTracker;
      return result;
    },
    _status: CREATED,
    _cleanup: cleanup
  };
}

function untrack<T>(callback: () => T): T {
  const prevTracker = trackers._currentWatcher;
  trackers._currentWatcher = false;
  try {
    return callback();
  } finally {
    trackers._currentWatcher = prevTracker;
  }
}

export { createReaction, untrack };
