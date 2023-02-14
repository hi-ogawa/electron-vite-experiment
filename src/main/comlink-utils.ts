import { tinyassert } from "@hiogawa/utils";
import * as comlink from "comlink";
import { ipcMain } from "electron";

export function exposeComlinkMain(channel: string, service: unknown) {
  ipcMain.on(channel, (e, message: unknown) => {
    const port = e.ports[0];
    tinyassert(port);
    comlink.expose(service, toMainEndpoint(port));
    e.sender.postMessage(channel, message);
  });
}

function toMainEndpoint(port: Electron.MessagePortMain): comlink.Endpoint {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),

    postMessage: (message: any, transfer?: Transferable[]) => {
      tinyassert((transfer ?? []).length === 0);
      port.postMessage(message, []);
    },

    addEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      _options?: {}
    ) => {
      const wrapper = (event: Electron.MessageEvent) => {
        const comlinkEvent = { data: event.data } as MessageEvent;
        if ("handleEvent" in listener) {
          listener.handleEvent(comlinkEvent);
        } else {
          listener(comlinkEvent);
        }
      };
      tinyassert(type === "message");
      port.on("message", wrapper);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      _options?: {}
    ) => {
      tinyassert(type === "message");
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        port.off("message", wrapper);
        listerWrappers.delete(listener);
      }
    },
  };
}
