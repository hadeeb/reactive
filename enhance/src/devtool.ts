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
  store: Store<any>,
  options?: DevtoolOptions
): void {
  //@ts-ignore
  const extension = window.__REDUX_DEVTOOLS_EXTENSION__ as any;
  if (!extension) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "%cInstall Redux DevTools extension for a better development experience\n" +
          "%chttp://extension.remotedev.io/",
        "font-weight:bold",
        "font-weight:normal"
      );
    }
    return;
  }

  let ReduxTool = extension && extension.connect(options || {});
  let ignoreUpdate = false;

  ReduxTool.init(store.getState());

  ReduxTool.subscribe(function(
    message: Record<"type" | "state" | "payload", any>
  ) {
    if (message.type === "DISPATCH" && message.state) {
      ignoreUpdate =
        message.payload.type === "JUMP_TO_ACTION" ||
        message.payload.type === "JUMP_TO_STATE";

      const newState = JSON.parse(message.state);
      store.dispatch(UPDATE_FROM_DEVTOOL, newState);
    }
  });

  const oldHook = store.$;

  store.$ = function(store, action, payload) {
    if (!ignoreUpdate) {
      ReduxTool.send({ type: String(action), payload }, store.getState());
    } else {
      ignoreUpdate = false;
    }

    if (action === UPDATE_FROM_DEVTOOL) {
      const state = store.getState();

      for (let i in state) {
        delete state[i];
      }
      for (let i in payload) {
        state[i] = payload[i];
      }
    } else {
      oldHook(store, action);
    }
  };
}
