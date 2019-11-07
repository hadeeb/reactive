import anyTest, { TestInterface } from "ava";

import { createStore, Store } from "../src";
import { createReaction } from "../src/reaction";

const test = anyTest as TestInterface<{
  store: Store<StoreState, StoreEvents>;
}>;

type StoreState = {
  count: number;
  deep: {
    value: string;
  };
};
type StoreEvents = "INCREMENT" | "DECREMENT" | "UPDATE_STRING";

test.beforeEach(t => {
  t.context.store;
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
      }
    },
    {
      count: 0,
      deep: {
        value: "qwerty"
      }
    }
  );
});

test("Mutates state synchronously", t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  t.deepEqual(state.count, 0);

  dispatch("INCREMENT");
  t.deepEqual(state.count, 1);

  dispatch("DECREMENT");
  t.deepEqual(state.count, 0);

  t.pass();
});

test("Callbacks are executed asynchronously", async t => {
  const state = t.context.store.getState();
  const dispatch = t.context.store.dispatch;

  let fired = 0;
  const cb = () => {
    ++fired;
  };

  const reaction = createReaction(cb);
  reaction._track(() => {
    return state.count;
  });

  dispatch("INCREMENT");
  t.deepEqual(fired, 0);
  await Promise.resolve();
  t.deepEqual(fired, 1);

  t.pass();
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

  let fired = 0;
  const cb = () => {
    ++fired;
  };
  const reaction = createReaction(cb);
  reaction._track(() => {
    return state.deep.value;
  });

  const initialValue = state.deep.value;

  dispatch("INCREMENT");
  t.deepEqual(state.deep.value, initialValue);
  await Promise.resolve();
  t.deepEqual(fired, 0);

  dispatch("UPDATE_STRING");
  t.deepEqual(state.deep.value, initialValue + "!");
  await Promise.resolve();
  t.deepEqual(fired, 1);

  t.pass();
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
