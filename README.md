# Reactive Store

Reactive global state for react apps

## References

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [hyperactiv](https://github.com/elbywan/hyperactiv)
- [Mobx](https://github.com/mobxjs/mobx)
- [mobx-react-lite](https://github.com/mobxjs/mobx-react-lite)

---

- ~1 KB (min+gzip)
- Maps,Sets,etc are not reactive
- Wrapper works only on functional components

---

### Example

```tsx
import { unstable_batchedUpdates } from "react-dom"; //Or react-native
import { StoreProvider, createStore, observe, useStore, options } from "...";

const store = createStore(
  {
    INCREMENT({ state }) {
      state.counter++;
    },
    DECREMENT({ state }) {
      state.counter--;
    },
    UPDATE_COUNTER({ state }, payload) {
      state.counter = state.counter + payload;
    },
    async ASYNC_INCREMENT({ dispatch }) {
      await someApi();
      dispatch("INCREMENT");
    }
  },
  { counter: 0 }
);

function Child() {
  const [store, dispatch] = useStore();
  return (
    <div>
      <span>{store.counter}</span>
      <button
        onClick={() => {
          dispatch("INCREMENT");
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          dispatch("DECREMENT");
        }}
      >
        -
      </button>
      <button
        onClick={() => {
          dispatch("UPDATE_COUNTER", 5);
        }}
      >
        Increment by 5
      </button>
    </div>
  );
}
const ConnectedChild = observe(Child);

function App() {
  return (
    <StoreProvider store={store}>
      <ConnectedChild />
    </StoreProvider>
  );
}
// This is important
options.batch = unstable_batchedUpdates;
```

## Enhancers

Add features to store

### Redux DevTool Integration

```tsx
import {addReduxDevTool} from ".../enhance"
const store = createStore(...,...)

addReduxDevTool(store,options)
```

## TODO

- Documentation
  - type helpers
- Example Project
