import { tinyassert } from "@hiogawa/utils";
import * as comlink from "comlink";
import { ipcRenderer } from "electron";
import { generateId } from "../utils/misc";

export function createComlinkEndpointPreload(
  channel: string
): Promise<comlink.Endpoint> {
  const { port1, port2 } = new MessageChannel();
  const id = `getComlinkEndpoint-${generateId()}`;
  const message = { id };

  const result = new Promise<comlink.Endpoint>((resolve) => {
    function handler(_: Electron.IpcRendererEvent, reply: unknown) {
      tinyassert(reply);
      if ((reply as any).id === message.id) {
        resolve(toPreloadEndpoint(port2));
        ipcRenderer.off(channel, handler);
      }
    }

    ipcRenderer.on(channel, handler);
  });

  ipcRenderer.postMessage(channel, message, [port1]);

  return result;
}

export function toPreloadEndpoint(port: MessagePort): comlink.Endpoint {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),

    postMessage: (message: any, transfer?: Transferable[]) => {
      tinyassert((transfer ?? []).length === 0);
      const { port1 } = new MessageChannel();
      port.postMessage(message, [port1]);
    },

    addEventListener: (type: string, listener: any, options?: {}) => {
      const wrapper = (event: MessageEvent) => {
        // omit other than "data" since there seem to be something non-serializable/proxy-able.
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

// cf. https://github.com/GoogleChromeLabs/comlink/blob/dffe9050f63b1b39f30213adeb1dd4b9ed7d2594/src/comlink.ts#L209
// TODO: `serialize` (i.e. instanciation MessageChannel) should happen in "preload" instead of "renderer"
export const proxyTransferHandlerPreload: comlink.TransferHandler<
  any,
  MessagePort
> = {
  canHandle: (value: unknown): value is any => {
    return Boolean(
      value &&
        (typeof value === "object" || typeof value === "function") &&
        comlink.proxyMarker in value
    );
  },

  serialize: (value: any): [MessagePort, Transferable[]] => {
    const { port1, port2 } = new MessageChannel();
    comlink.expose(value, toPreloadEndpoint(port1));
    return [port2, [port2]];
  },

  deserialize: (_serialized: unknown): any => {
    tinyassert(false, "cannot run on preload");
  },
};

export const proxyTransferHandlerMain: comlink.TransferHandler<
  any,
  Electron.MessagePortMain
> = {
  canHandle: (value: unknown): value is any => {
    return Boolean(
      value &&
        (typeof value === "object" || typeof value === "function") &&
        comlink.proxyMarker in value
    );
  },

  serialize: (_value: any): [Electron.MessagePortMain, Transferable[]] => {
    tinyassert(false, "cannot run on main");
  },

  deserialize: (port2: Electron.MessagePortMain): any => {
    port2;
  },
};

export const proxyTransferHandlerRenderer: comlink.TransferHandler<
  any,
  MessagePort
> = {
  canHandle: (value: unknown): value is any => {
    return Boolean(
      value &&
        (typeof value === "object" || typeof value === "function") &&
        comlink.proxyMarker in value
    );
  },

  serialize: (value: any): [MessagePort, Transferable[]] => {
    const { port1, port2 } = new MessageChannel();
    comlink.expose(value, toPreloadEndpoint(port1));
    return [port2, [port2]];
  },

  deserialize: (_serialized: unknown): any => {
    tinyassert(false, "cannot run on preload");
  },
};
