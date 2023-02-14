import path from "path";
import { BrowserWindow, app } from "electron";
import { exposeComlinkMain } from "./comlink-utils";
import { COMLINK_HANDSHAKE_MESSAGE } from "./common";
import { MainService } from "./service";

async function main() {
  await app.whenReady();

  // expose main service
  const service = new MainService();
  exposeComlinkMain(COMLINK_HANDSHAKE_MESSAGE, service);

  // window
  const window = new BrowserWindow({
    webPreferences: {
      preload: path.resolve(__dirname, "../preload/index.js"),
    },
  });

  // load page
  const url =
    process.env["APP_RENDERER_URL"] ??
    new URL(`file://${__dirname}/../src/renderer/index.html`).toString();
  await window.loadURL(url);
}

if (require.main === module) {
  main();
}
