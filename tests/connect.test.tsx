import React, { Component, FunctionComponent } from "react";
import { render } from "@testing-library/react";
import { JSDOM } from "jsdom";
import { renderHook } from "@testing-library/react-hooks";
import anyTest, { TestInterface } from "ava";

import {
  createStore,
  observe,
  Store,
  StoreProvider,
  useStore,
  decorate
} from "../src";

const test = anyTest as TestInterface<{
  store: ContextStore;
}>;

type ContextStore = Store<StoreState, StoreEvents>;

type StoreState = {
  count: number;
  deep: {
    value: string;
  };
};
type StoreEvents = "INCREMENT" | "DECREMENT" | "UPDATE_STRING";

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
      }
    },
    {
      count: 0,
      deep: {
        value: "qwerty"
      }
    }
  );

  //@ts-ignore
  global.document = new JSDOM().window.document;
  //@ts-ignore
  global.window = new JSDOM().window;
});

test.afterEach(() => {
  //@ts-ignore
  delete global.document;
  //@ts-ignore
  delete global.window;
});

test("useStore provides state and dispatch", t => {
  const wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={t.context.store}>{children}</StoreProvider>
  );

  const { result } = renderHook(() => useStore<ContextStore>(), {
    wrapper
  });

  t.deepEqual(result.current[0], t.context.store.getState());
  t.deepEqual(result.current[1], t.context.store.dispatch);
});

test("observe re-renders on state change", async t => {
  const Child = observe(() => {
    const [state] = useStore<ContextStore>();
    return <div>{state.count}</div>;
  });

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={t.context.store}>{children}</StoreProvider>
  );

  const { container } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  t.deepEqual(container.querySelector("div")!.innerHTML, "0");

  t.context.store.dispatch("INCREMENT");
  await Promise.resolve();

  t.deepEqual(container.querySelector("div")!.innerHTML, "1");
});

test("observe re-renders only on changes to observed state", async t => {
  let renders = 0;
  const Child = observe(() => {
    renders++;
    const [state] = useStore<ContextStore>();
    return <div>{state.count}</div>;
  });

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={t.context.store}>{children}</StoreProvider>
  );

  const { container } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  t.deepEqual(container.querySelector("div")!.innerHTML, "0");
  t.deepEqual(renders, 1);

  t.context.store.dispatch("INCREMENT");
  await Promise.resolve();

  t.deepEqual(container.querySelector("div")!.innerHTML, "1");
  t.deepEqual(renders, 2);

  t.context.store.dispatch("UPDATE_STRING");
  await Promise.resolve();

  t.deepEqual(renders, 2);
});

test("decorate re-renders on state change", async t => {
  const Child = decorate(
    class extends Component {
      context!: ContextStore;
      render() {
        const state = this.context.getState();
        return <div>{state.count}</div>;
      }
    }
  );

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={t.context.store}>{children}</StoreProvider>
  );

  const { container } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  t.deepEqual(container.querySelector("div")!.innerHTML, "0");

  t.context.store.dispatch("INCREMENT");
  await Promise.resolve();

  t.deepEqual(container.querySelector("div")!.innerHTML, "1");
});

test("decorate re-renders only on changes to observed state", async t => {
  let renders = 0;
  const Child = decorate(
    class extends Component {
      context!: ContextStore;
      render() {
        renders++;
        const state = this.context.getState();
        return <div>{state.count}</div>;
      }
    }
  );

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={t.context.store}>{children}</StoreProvider>
  );

  const { container } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  t.deepEqual(container.querySelector("div")!.innerHTML, "0");
  t.deepEqual(renders, 1);

  t.context.store.dispatch("INCREMENT");

  await Promise.resolve();

  t.deepEqual(container.querySelector("div")!.innerHTML, "1");
  t.deepEqual(renders, 2);

  t.context.store.dispatch("UPDATE_STRING");
  await Promise.resolve();

  t.deepEqual(renders, 2);
});
