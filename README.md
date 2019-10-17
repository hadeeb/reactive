# Reactive Store

Reactive global state for react apps

## References

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [hyperactiv](https://github.com/elbywan/hyperactiv)
- [Mobx](https://github.com/mobxjs/mobx)
- [mobx-react-lite](https://github.com/mobxjs/mobx-react-lite)

---

- ~1.2 KB (min+gzip)
- Maps,Sets,etc are not reactive
- Wrapper works only on functional components

---

### Example

```tsx
import { StoreProvider, createStore, observe, useStore } from "...";

const store = createStore(
  {
    INCREMENT(state) {
      state.counter++;
    },
    DECREMENT(state) {
      state.counter--;
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

## Enhancers

Add features to store

### Redux DevTool Integration

```tsx
import {addReduxDevTool} from ".../enhance"
const store = createStore(...,...)

addReduxDevTool(store,options)
```

### Async Events

Perform Asynchronous actions on events

```tsx
import {addAsyncEvents} from ".../enhance"
const store = createStore(...,...)

addAsyncEvents(store, {
  ASYNC_FETCH({state,emit}){
    fetchDataFromApi(state.query)
      .then(data=>{
        emit("API_RESPONSE",data);
      })
  }
})

function Component() {
  const { store, emit } = useStore();
  return (
    <div>
      <span>{store.data}</span>
      <button
        onClick={() => {
          emit("ASYNC_FETCH");
        }}
      >
        Fetch Data
      </button>
    </div>
  );
}
```

## TODO

- Documentation
  - codesplit with `addEvents`
  - creating an enhancer with `hook` option
  - batch updates
  - type helpers
- Tests
- Example Project
- Decouple react integration(Maybe)
