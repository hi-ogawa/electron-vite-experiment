import path from "path";
import { expose } from "comlink";
import { BrowserWindow, app, ipcMain } from "electron";
import { toMainEndpoint } from "../utils/comlink-utils";
import { receiveMessagePortMain } from "../utils/message-channel-utils";
import { range } from "../utils/misc";
import { EXPOSE_MAIN_SERVICE } from "./common";
import { MainService } from "./service";

async function main() {
  await app.whenReady();

  // expose comlink service
  setupService();

  // create two renderes to test comlink event callback
  for (const i of range(2)) {
    await createWindow(i);
  }
}

/** expose comlink-based service from main to all renderers */
function setupService() {
  const service = new MainService();
  receiveMessagePortMain(ipcMain, EXPOSE_MAIN_SERVICE, (port) => {
    expose(service, toMainEndpoint(port));
  });
}

/** instantiate renderer */
async function createWindow(i: number) {
  const window = new BrowserWindow({
    x: 500 * (i + 1),
    y: 300,
    width: 500,
    height: 300,
    webPreferences: {
      preload: PRELOAD_PATH,
    },
  });
  await window.loadURL(WINDOW_URL);
  return window;
}

const PRELOAD_PATH = path.resolve(__dirname, "../preload/index.js");

const WINDOW_URL =
  process.env["APP_RENDERER_URL"] ??
  new URL(`file://${__dirname}/../src/renderer/index.html`).toString();

if (require.main === module) {
  main();
}
