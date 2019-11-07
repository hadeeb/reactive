import { Reaction, Options } from "./internaltypes";

let queue: Set<Reaction> = new Set();
let isUpdating = false;

const options: Options = {};

const enqueue = function(x: Reaction) {
  queue.add(x);
  if (isUpdating) return;
  isUpdating = true;
  Promise.resolve().then(() => {
    const currentQueue = new Set(queue);
    queue = new Set();
    if (options.batch) {
      options.batch(() => {
        currentQueue.forEach(x => {
          x._callback();
        });
      });
    } else {
      currentQueue.forEach(x => {
        x._callback();
      });
    }
    isUpdating = false;
  });
};

export { enqueue, options };
