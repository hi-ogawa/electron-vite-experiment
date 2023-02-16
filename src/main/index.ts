import path from "path";
import { expose } from "comlink";
import { BrowserWindow, app, ipcMain } from "electron";
import { toMainEndpoint } from "../utils/comlink-utils";
import { receiveMessagePortMain } from "../utils/message-channel-utils";
import { EXPOSE_MAIN_SERVICE } from "./common";
import { MainService } from "./service";

async function main() {
  await app.whenReady();

  // expose service from main to all renderers
  const service = new MainService();
  receiveMessagePortMain(ipcMain, EXPOSE_MAIN_SERVICE, (port) => {
    expose(service, toMainEndpoint(port));
  });

  // create window
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, "../preload/index.js"),
    },
  });
  const url =
    process.env["APP_RENDERER_URL"] ??
    new URL(`file://${__dirname}/../src/renderer/index.html`).toString();
  await window.loadURL(url);
}

if (require.main === module) {
  main();
}
