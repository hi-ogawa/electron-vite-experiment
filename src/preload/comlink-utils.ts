import { tinyassert } from "@hiogawa/utils";
import type * as comlink from "comlink";
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
        resolve(toEndpoint(port2));
        ipcRenderer.off(channel, handler);
      }
    }

    ipcRenderer.on(channel, handler);
  });

  ipcRenderer.postMessage(channel, message, [port1]);

  return result;
}

function toEndpoint(port: MessagePort): comlink.Endpoint {
  const listerWrappers = new WeakMap<object, any>();

  return {
    start: port.start.bind(port),

    postMessage: (message: any, transfer?: Transferable[]) => {
      tinyassert((transfer ?? []).length === 0);
      port.postMessage(message, []);
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
