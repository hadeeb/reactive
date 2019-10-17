import { Options, Reaction } from "./types";

let queue: Set<Reaction> = new Set();
let isUpdating = false;

const options: Options = {
  batch: x => x()
};

function enqueue(x: Reaction) {
  queue.add(x);
  if (isUpdating) return;
  isUpdating = true;
  Promise.resolve().then(() => {
    const currentQueue = new Set(queue);
    queue = new Set();
    options.batch(() => {
      currentQueue.forEach(x => {
        x.cb();
      });
    });
    isUpdating = false;
  });
}

export { enqueue, options };
