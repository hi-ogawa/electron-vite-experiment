import { contextBridge, ipcRenderer } from "electron";
import { toPreloadEndpoint } from "../utils/comlink-utils";
import { sendMessagePortPreload } from "../utils/message-channel-utils";
import { PRELOAD_API } from "./common";

function main() {
  const preloadApi = new PreloadApi();
  contextBridge.exposeInMainWorld(PRELOAD_API, preloadApi);
}

export class PreloadApi {
  sendMessagePort = async (channel: string) => {
    const port = await sendMessagePortPreload(ipcRenderer, channel);
    return toPreloadEndpoint(port);
  };
}

main();
