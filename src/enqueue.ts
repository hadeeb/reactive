import { unstable_batchedUpdates as batch } from "react-dom";
import { Reaction } from "./reaction";

let queue: Set<Reaction> = new Set();
let isUpdating = false;

function enqueue(x: Reaction) {
  queue.add(x);
  if (isUpdating) return;
  isUpdating = true;
  Promise.resolve().then(() => {
    const currentQueue = new Set(queue);
    queue = new Set();
    batch(() => {
      currentQueue.forEach(x => {
        x.cb();
      });
    });
    isUpdating = false;
  });
}

export { enqueue };
