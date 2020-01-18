import { act, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React, { Component, FunctionComponent } from "react";

import {
  createStore,
  decorate,
  observe,
  options,
  Store,
  StoreProvider,
  useStore
} from "../src";

type ContextStore = Store<StoreState, StoreEvents>;

type StoreState = {
  count: number;
  deep: {
    value: string;
  };
};
type StoreEvents = "INCREMENT" | "DECREMENT" | "UPDATE_STRING";

let store: Store<StoreState, StoreEvents>;

beforeAll(() => {
  options.batch = act;
});

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

test("useStore provides state and dispatch", () => {
  const wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={store}>{children}</StoreProvider>
  );

  const { result } = renderHook(() => useStore<ContextStore>(), {
    wrapper
  });

  expect(result.current[0]).toEqual(store.getState());
  expect(result.current[1]).toEqual(store.dispatch);
});

test("observe re-renders on state change", async done => {
  const Child = observe(() => {
    const [state] = useStore<ContextStore>();
    return <div>{state.count}</div>;
  });

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={store}>{children}</StoreProvider>
  );

  const { container, unmount } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  expect(container.querySelector("div")!.innerHTML).toEqual("0");

  store.dispatch("INCREMENT");
  await Promise.resolve();

  expect(container.querySelector("div")!.innerHTML).toEqual("1");
  unmount();
  done();
});

test("observe re-renders only on changes to observed state", async done => {
  let renders = 0;
  const Child = observe(() => {
    renders++;
    const [state] = useStore<ContextStore>();
    return <div>{state.count}</div>;
  });

  const Wrapper: FunctionComponent = ({ children }) => (
    <StoreProvider store={store}>{children}</StoreProvider>
  );

  const { container, unmount } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );
  expect(container.querySelector("div")!.innerHTML).toEqual("0");

  expect(renders).toEqual(1);

  store.dispatch("INCREMENT");
  await Promise.resolve();

  expect(container.querySelector("div")!.innerHTML).toEqual("1");

  expect(renders).toEqual(2);

  store.dispatch("UPDATE_STRING");
  await Promise.resolve();

  expect(renders).toEqual(2);
  unmount();
  done();
});

test("decorate re-renders on state change", async done => {
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
    <StoreProvider store={store}>{children}</StoreProvider>
  );

  const { container, unmount } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  expect(container.querySelector("div")!.innerHTML).toEqual("0");

  store.dispatch("INCREMENT");
  await Promise.resolve();

  expect(container.querySelector("div")!.innerHTML).toEqual("1");
  unmount();
  done();
});

test("decorate re-renders only on changes to observed state", async done => {
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
    <StoreProvider store={store}>{children}</StoreProvider>
  );

  const { container, unmount } = render(
    <Wrapper>
      <Child />
    </Wrapper>
  );

  expect(container.querySelector("div")!.innerHTML).toEqual("0");
  expect(renders).toEqual(1);

  store.dispatch("INCREMENT");

  await Promise.resolve();

  expect(container.querySelector("div")!.innerHTML).toEqual("1");
  expect(renders).toEqual(2);

  store.dispatch("UPDATE_STRING");
  await Promise.resolve();

  expect(renders).toEqual(2);
  unmount();
  done();
});
