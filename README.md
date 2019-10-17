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

### TODO

- ReduxDevtool Integration

---

### Example

```tsx
import { StoreProvider, createStore, observe, useStore } from "...";

const store = createStore(
  {
    INCREMENT(state) {
      store.counter++;
    },
    DECREMENT(state) {
      store.counter--;
    }
  },
  { counter: 0 }
);

function Child() {
  const { store, emit } = useStore();
  return (
    <div>
      <span>{store.counter}</span>
      <button
        onClick={() => {
          emit("INCREMENT");
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          emit("DECREMENT");
        }}
      >
        -
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
```
