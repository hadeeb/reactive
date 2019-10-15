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
- **NOT** flux(see [Mobx](https://github.com/mobxjs/mobx))

---

### TODO

- ReduxDevtool Integration

  - Updates can/will be nondeterministic.
  - Changes done in a single cycle grouped together.
  - Is there a point?

- Scaling

---

### Example

```tsx
import { StoreProvider, createStore, observe, useStore } from "...";

const store = createStore({ counter: 0 });

function Child() {
  const store = useStore();
  return (
    <div>
      <span>{store.counter}</span>
      <button
        onClick={() => {
          store.counter++;
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          store.counter--;
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
