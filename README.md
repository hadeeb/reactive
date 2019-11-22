# Reactive Store

Reactive global state for react apps

---

```sh
npm i @hadeeb/reactive
OR
yarn add @hadeeb/reactive
```

- ~1 KB (min+gzip)
- Automatic dependency tracking with ES6 Proxies.
- Dispatch events to update the state.
- Mutate the state inside event listeners.
- Components are updated only when used values have changed.

---

### Example

```tsx
import { unstable_batchedUpdates } from "react-dom"; //Or react-native
import {
  StoreProvider,
  createStore,
  observe,
  useStore,
  options
} from "@hadeeb/reactive";

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

### Redux DevTool Integration

```tsx
import {addReduxDevTool} from "@hadeeb/reactive/enhance"
const store = createStore(...,...)

addReduxDevTool(store,options)
```

### Caveats

- ES6 collections are not reactive

### Prior art

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [hyperactiv](https://github.com/elbywan/hyperactiv)
- [Mobx](https://github.com/mobxjs/mobx)
- [mobx-react-lite](https://github.com/mobxjs/mobx-react-lite)

### TODO

- Documentation
  - Class components
- Example Project
