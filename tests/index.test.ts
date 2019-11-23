import anyTest, { TestInterface } from "ava";

import { createStore, Store } from "../src";
import { createReaction, untrack } from "../src/reaction";

const test = anyTest as TestInterface<{
  store: Store<StoreState, StoreEvents>;
  cleanup?: VoidFunction;
}>;

type StoreState = {
  count: number;
  deep: {
    value: string;
    anotherValue: string;
  };
};
type StoreEvents =
  | "INCREMENT"
  | "DECREMENT"
  | "UPDATE_STRING"
  | "UPDATE_ANOTHERSTRING";

function autorun(fun: () => any) {
  function cb() {
    reaction._track(fun);
  }
  const reaction = createReaction(cb);
  cb();
  return reaction._cleanup;
}

test.beforeEach(t => {
  t.context.store = createStore(
    {
      INCREMENT({ state }) {
        state.count++;
      },
      DECREMENT({ state }) {
        state.count--;
      },
      UPDATE_STRING({ state }) {
        state.deep.value += "!";
      },
      UPDATE_ANOTHERSTRING({ state }) {
        state.deep.anotherValue += "#";
      }
    },
    {
      count: 0,
      deep: {
        value: "qwerty",
        anotherValue: "asdfgh"
      }
    }
  );
});

test.afterEach(t => {
  t.context.cleanup && t.context.cleanup();
});

test("Mutates state synchronously", t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  t.deepEqual(state.count, 0);

  dispatch("INCREMENT");
  t.deepEqual(state.count, 1);

  dispatch("DECREMENT");
  t.deepEqual(state.count, 0);
});

test("Callbacks are executed asynchronously", async t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.count;
  };

  t.context.cleanup = autorun(cb);

  dispatch("INCREMENT");
  t.deepEqual(fired, 0);
  await Promise.resolve();
  t.deepEqual(fired, 1);
});

test("Callbacks are batched", async t => {
  t.plan(1);

  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  const cb = () => {
    t.deepEqual(state.count, 3);
  };
  const reaction = createReaction(cb);
  reaction._track(() => {
    return state.count;
  });

  dispatch("INCREMENT");
  dispatch("INCREMENT");
  dispatch("INCREMENT");
});

test("Throws on mutation outside eventlisteners", t => {
  const state = t.context.store.getState();
  t.throws(() => {
    // Disable Typescript error
    // @ts-ignore
    state.count++;
  });
});

test("Callbacks are executed only when dependencies are mutated", async t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.deep.value;
  };

  t.context.cleanup = autorun(cb);

  const initialValue = state.deep.value;

  dispatch("INCREMENT");
  t.deepEqual(state.deep.value, initialValue);
  await Promise.resolve();
  t.deepEqual(fired, 0);

  dispatch("UPDATE_STRING");
  t.deepEqual(state.deep.value, initialValue + "!");
  await Promise.resolve();
  t.deepEqual(fired, 1);
});

test("Tracked values are updated on each invokation", async t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.count % 2 === 0 ? state.deep.value : state.deep.anotherValue;
  };

  t.context.cleanup = autorun(cb);
  t.deepEqual(fired, 0);

  // state.deep.anotherValue is not tracked
  dispatch("UPDATE_STRING");
  await Promise.resolve();
  t.deepEqual(fired, 1);
  dispatch("UPDATE_ANOTHERSTRING");
  await Promise.resolve();
  t.deepEqual(fired, 1);

  dispatch("INCREMENT");
  await Promise.resolve();
  t.deepEqual(fired, 2);

  // state.deep.value is not tracked
  dispatch("UPDATE_STRING");
  await Promise.resolve();
  t.deepEqual(fired, 2);
  dispatch("UPDATE_ANOTHERSTRING");
  await Promise.resolve();
  t.deepEqual(fired, 3);
});

test("Values used inside 'untrack' are not tracked", async t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    const untrackedCount = untrack(() => state.count);
    return state.deep.value + untrackedCount;
  };

  t.context.cleanup = autorun(cb);
  t.deepEqual(fired, 0);

  dispatch("INCREMENT");
  await Promise.resolve();

  t.deepEqual(fired, 0);

  dispatch("UPDATE_STRING");
  await Promise.resolve();

  t.deepEqual(fired, 1);
});

test("Dispatch hook", t => {
  const store = t.context.store;
  const state = store.getState();
  const dispatch = store.dispatch;
  const actionArray: StoreEvents[] = [];

  const prevHook = store.$;
  store.$ = (store, action, payload) => {
    prevHook(store, action, payload);
    actionArray.push(action);
  };

  dispatch("INCREMENT");
  t.deepEqual(state.count, 1);
  dispatch("DECREMENT");
  t.deepEqual(state.count, 0);

  t.deepEqual(actionArray, ["INCREMENT", "DECREMENT"]);
});
