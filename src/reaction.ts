import { Trackers, Reaction, ReactionObject } from "./types";
import { JsonObject } from "type-fest";

function createReaction<T extends JsonObject>(
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
      const prevTracker = trackers._currentWatcher;
      trackers._currentWatcher = thisReaction;
      const result = fn();
      trackers._currentWatcher = prevTracker;
      return result;
    },
    _dispose: cleanup
  };
}

export { createReaction };
