import { tinyassert } from "@hiogawa/utils";
import type { Endpoint } from "comlink";

export function toMainEndpoint(port: Electron.MessagePortMain): Endpoint {
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

// renderers cannot directly use MessagePort instantiated in preload
export function toPreloadEndpoint(port: MessagePort): Endpoint {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),

    postMessage: (message: any, transfer?: Transferable[]) => {
      tinyassert((transfer ?? []).length === 0);
      port.postMessage(message, []);
    },

    addEventListener: (type: string, listener: any, options?: {}) => {
      const wrapper = (event: MessageEvent) => {
        // strip out non "data" properties since there seem to be something non-serializable/proxy-able.
        listener({ data: event.data });
      };
      tinyassert(type === "message");
      port.addEventListener("message", wrapper, options);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: {}
    ) => {
      tinyassert(type === "message");
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        port.removeEventListener("message", wrapper, options);
        listerWrappers.delete(listener);
      }
    },
  };
}
