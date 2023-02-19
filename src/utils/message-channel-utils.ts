import { tinyassert } from "@hiogawa/utils";
import { generateId } from "./misc";

//
// instantiate MessageChannel in preload and send MessagePort to main
//

export async function shareMessagePortPreload(
  ipcRenderer: Electron.IpcRenderer,
  channel: string
): Promise<MessagePort> {
  // console.log("shareMessagePortPreload:register", channel);
  const { port1, port2 } = new MessageChannel();
  const id = `shareMessageChannelPreload:${generateId()}`;
  const message = { id };

  ipcRenderer.postMessage(channel, message, [port1]);

  await new Promise((resolve) => {
    function handler(_: Electron.IpcRendererEvent, reply: unknown) {
      // console.log("shareMessagePortPreload:handler", channel);
      tinyassert(reply);
      if ((reply as any).id === message.id) {
        ipcRenderer.off(channel, handler);
        resolve(null);
      }
    }

    ipcRenderer.on(channel, handler);
  });

  return port2;
}

export function receiveMessagePortMain(
  ipcMain: Electron.IpcMain,
  channel: string,
  onPort: (port: Electron.MessagePortMain) => void
) {
  // console.log("receiveMessagePortMain:register", channel);
  const handler = (e: Electron.IpcMainEvent, message: unknown) => {
    // console.log("receiveMessagePortMain:handler", channel);
    const port = e.ports[0];
    tinyassert(port);
    onPort(port);
    e.sender.postMessage(channel, message);
  };
  ipcMain.on(channel, handler);
  return () => {
    ipcMain.off(channel, handler);
  };
}

export function receiveMessagePortMainPromise(
  ipcMain: Electron.IpcMain,
  channel: string
): Promise<Electron.MessagePortMain> {
  return new Promise((resolve) => {
    const unsubscribe = receiveMessagePortMain(ipcMain, channel, (port) => {
      unsubscribe();
      resolve(port);
    });
  });
}

//
// fix up small interface differences of MessagePort to be uniformally usable in main/preload/renderer
//

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
