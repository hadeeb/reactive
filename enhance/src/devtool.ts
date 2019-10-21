import { Store } from "reactive";
const UPDATE_FROM_DEVTOOL = Symbol();

/**
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
 * https://github.com/zalmoxisus/redux-devtools-extension/blob/master/npm-package/index.d.ts#L3
 */
type DevtoolOptions = {
  [x: string]: any;
};

export function addReduxDevTool(
  store: Store<any, any>,
  options: DevtoolOptions = {}
) {
  //@ts-ignore
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ as any;
  if (!extension) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Please install Redux devtools extension\n" +
          "http://extension.remotedev.io/"
      );
    }
    return;
  }

  let ReduxTool = extension && extension.connect(options);
  let ignoreUpdate = false;
  const state = store.state;
  store.addEvents({
    [UPDATE_FROM_DEVTOOL](state, newState) {
      for (let i in state) {
        delete state[i];
      }
      for (let i in newState) {
        state[i] = newState[i];
      }
    }
  });
  ReduxTool.subscribe(function(
    message: Record<"type" | "state" | "payload", any>
  ) {
    if (message.type === "DISPATCH" && message.state) {
      ignoreUpdate =
        message.payload.type === "JUMP_TO_ACTION" ||
        message.payload.type === "JUMP_TO_STATE";

      const newState = JSON.parse(message.state);
      store.emit(UPDATE_FROM_DEVTOOL, newState);
    }
  });
  ReduxTool.init(state);

  const oldHook = store.hook;

  store.hook = (store, event: PropertyKey, payload: any) => {
    oldHook(store, event, payload);
    if (!ignoreUpdate) {
      ReduxTool.send({ type: String(event), payload }, state);
    } else {
      ignoreUpdate = false;
    }
  };
}
