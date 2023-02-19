import { tinyassert } from "@hiogawa/utils";
import { generateId } from "./misc";

// instantiate MessageChannel in preload and send MessagePort to main

export async function shareMessagePortPreload(
  ipcRenderer: Electron.IpcRenderer,
  channel: string
): Promise<MessagePort> {
  const { port1, port2 } = new MessageChannel();
  const id = `shareMessageChannelPreload-${generateId()}`;
  const message = { id };

  ipcRenderer.postMessage(channel, message, [port1]);

  await new Promise((resolve) => {
    function handler(_: Electron.IpcRendererEvent, reply: unknown) {
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
  const handler = (e: Electron.IpcMainEvent, message: unknown) => {
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
