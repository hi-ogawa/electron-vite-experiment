import { tinyassert } from "@hiogawa/utils";

// fix up small interface differences of MessagePort to be usable in main/preload/renderer

// TODO: move to message-channel-utils.ts

export function normalizeMessagePortMain(
  port: Electron.MessagePortMain
): MessagePort {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),
    close: port.close.bind(port),

    // @ts-expect-error inessential type imcompatibility
    postMessage: (message: any, transfer: Transferable[] = []) => {
      tinyassert(transfer.length === 0);
      port.postMessage(message, []);
    },

    addEventListener: (type: string, listener: any) => {
      tinyassert(type === "message");
      const wrapper = (event: Electron.MessageEvent) => {
        listener({ data: event.data } as MessageEvent);
      };
      port.on("message", wrapper);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (type: string, listener: any) => {
      tinyassert(type === "message");
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        port.off("message", wrapper);
        listerWrappers.delete(listener);
      }
    },
  };
}

export function normalizeMessagePortPreload(port: MessagePort): MessagePort {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),
    close: port.close.bind(port),

    // @ts-expect-error inessential type imcompatibility
    postMessage: (message: any, transfer: Transferable[] = []) => {
      tinyassert(transfer.length === 0);
      port.postMessage(message, []);
    },

    addEventListener: (type: string, listener: any) => {
      tinyassert(type === "message");
      const wrapper = (event: MessageEvent) => {
        listener({ data: event.data }); // strip out non "data" properties since there seem to be something non-serializable/proxy-able.
      };
      port.addEventListener(type, wrapper);
      listerWrappers.set(listener, wrapper);
    },

    removeEventListener: (type: string, listener: any) => {
      tinyassert(type === "message");
      const wrapper = listerWrappers.get(listener);
      if (wrapper) {
        port.removeEventListener(type, wrapper);
        listerWrappers.delete(listener);
      }
    },
  };
}
