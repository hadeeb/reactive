import { createStore, options, Store } from "../src";
import { createReaction, untrack } from "../src/reaction";

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
  | "UPDATE_ANOTHERSTRING"
  | "KEEP_COUNT";

function autorun(fun: () => any) {
  function cb() {
    reaction._track(fun);
  }
  const reaction = createReaction(cb);
  cb();
  return reaction._cleanup;
}

let store: Store<StoreState, StoreEvents>;
let cleanup: VoidFunction | null = null;

beforeEach(() => {
  store = createStore(
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
      },
      KEEP_COUNT({ state }) {
        state.count = +state.count;
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

afterEach(() => {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
});

test("Mutates state synchronously", () => {
  const state = store.getState();
  const dispatch = store.dispatch;

  expect(state.count).toEqual(0);

  dispatch("INCREMENT");
  expect(state.count).toEqual(1);

  dispatch("DECREMENT");
  expect(state.count).toEqual(0);
});

test("Callbacks are executed asynchronously", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.count;
  };

  cleanup = autorun(cb);

  dispatch("INCREMENT");
  expect(fired).toEqual(0);

  await Promise.resolve();
  expect(fired).toEqual(1);

  done();
});

test("Callbacks are batched", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  const cb = () => {
    expect(state.count).toEqual(3);
  };
  const reaction = createReaction(cb);
  reaction._track(() => {
    return state.count;
  });

  dispatch("INCREMENT");
  dispatch("INCREMENT");
  dispatch("INCREMENT");
  await Promise.resolve();
  done();
});

test("Throws on mutation outside eventlisteners", () => {
  const state = store.getState();
  expect(() => {
    // Disable Typescript error
    // @ts-ignore
    state.count++;
  }).toThrow();
});

test("Callbacks are executed only when dependencies are mutated", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.deep.value;
  };

  cleanup = autorun(cb);

  const initialValue = state.deep.value;

  dispatch("INCREMENT");
  expect(state.deep.value).toEqual(initialValue);
  await Promise.resolve();
  expect(fired).toEqual(0);

  dispatch("UPDATE_STRING");
  expect(state.deep.value).toEqual(initialValue + "!");
  await Promise.resolve();
  expect(fired).toEqual(1);
  done();
});

test("Callbacks are executed only when the value of dependencies have changed", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.count;
  };

  cleanup = autorun(cb);

  dispatch("INCREMENT");
  expect(state.count).toEqual(1);
  await Promise.resolve();
  expect(fired).toEqual(1);

  dispatch("KEEP_COUNT");
  expect(state.count).toEqual(1);

  await Promise.resolve();
  expect(fired).toEqual(1);
  done();
});

test("Tracked values are updated on each invokation", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    return state.count % 2 === 0 ? state.deep.value : state.deep.anotherValue;
  };

  cleanup = autorun(cb);
  expect(fired).toEqual(0);

  // state.deep.anotherValue is not tracked
  dispatch("UPDATE_STRING");
  await Promise.resolve();
  expect(fired).toEqual(1);

  dispatch("UPDATE_ANOTHERSTRING");
  await Promise.resolve();
  expect(fired).toEqual(1);

  dispatch("INCREMENT");
  await Promise.resolve();
  expect(fired).toEqual(2);

  // state.deep.value is not tracked
  dispatch("UPDATE_STRING");
  await Promise.resolve();
  expect(fired).toEqual(2);

  dispatch("UPDATE_ANOTHERSTRING");
  await Promise.resolve();
  expect(fired).toEqual(3);
  done();
});

test("Values used inside 'untrack' are not tracked", async done => {
  const state = store.getState();
  const dispatch = store.dispatch;

  let fired = -1;
  const cb = () => {
    ++fired;
    const untrackedCount = untrack(() => state.count);
    return state.deep.value + untrackedCount;
  };

  cleanup = autorun(cb);
  expect(fired).toEqual(0);

  dispatch("INCREMENT");
  await Promise.resolve();

  expect(fired).toEqual(0);

  dispatch("UPDATE_STRING");
  await Promise.resolve();

  expect(fired).toEqual(1);
  done();
});

test("Dispatching unknown action is a noop", () => {
  const dispatch = store.dispatch;
  expect(() => {
    //@ts-ignore
    dispatch("UNKNOWN_ACTION");
  }).not.toThrow();
});

test("options.batch is called on updates with a function", async done => {
  const dispatch = store.dispatch;
  const state = store.getState();

  cleanup = autorun(() => {
    return state.count;
  });

  const spy = jest.fn();
  options.batch = spy;

  dispatch("INCREMENT");
  await Promise.resolve();

  expect(spy).toHaveBeenCalledTimes(1);

  dispatch("INCREMENT");
  dispatch("DECREMENT");
  await Promise.resolve();

  expect(spy).toHaveBeenCalledTimes(2);

  delete options.batch;
  done();
});

test("Dispatch hook", done => {
  const state = store.getState();
  const dispatch = store.dispatch;
  const actionArray: StoreEvents[] = [];

  const prevHook = store.$;
  store.$ = (store, action, payload) => {
    prevHook(store, action, payload);
    actionArray.push(action);
  };

  dispatch("INCREMENT");
  expect(state.count).toEqual(1);
  dispatch("DECREMENT");
  expect(state.count).toEqual(0);

  expect(actionArray).toEqual(["INCREMENT", "DECREMENT"]);

  done();
});
