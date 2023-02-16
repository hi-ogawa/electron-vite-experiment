import { tinyassert } from "@hiogawa/utils";
import { generateId } from "./misc";

// instantiate MessageChannel in preload and share MessagePort with main

export async function handshakePortPreload(
  ipcRenderer: Electron.IpcRenderer,
  channel: string
): Promise<MessagePort> {
  console.log("handshakePortPreload", { channel });

  const { port1, port2 } = new MessageChannel();
  const id = `handshakePortPreload-${generateId()}`;
  const message = { id };

  const result = new Promise<MessagePort>((resolve) => {
    function handler(_: Electron.IpcRendererEvent, reply: unknown) {
      console.log("handshakePortPreload.handler", reply);
      tinyassert(reply);
      if ((reply as any).id === message.id) {
        resolve(port2);
        ipcRenderer.off(channel, handler);
      }
    }

    ipcRenderer.on(channel, handler);
  });

  ipcRenderer.postMessage(channel, message, [port1]);

  return result;
}

export async function handshakePortMain(
  ipcMain: Electron.IpcMain,
  channel: string
): Promise<Electron.MessagePortMain> {
  console.log("handshakePortMain", { channel });
  return new Promise((resolve) => {
    ipcMain.on(channel, (e, message: unknown) => {
      console.log("handshakePortMain.handler", message);
      const port = e.ports[0];
      tinyassert(port);
      resolve(port);
      e.sender.postMessage(channel, message);
    });
  });
}
