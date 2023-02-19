import { contextBridge, ipcRenderer } from "electron";
import {
  normalizeMessagePortPreload,
  shareMessagePortPreload,
} from "../utils/message-channel-utils";
import { PRELOAD_API } from "./common";

function main() {
  const preloadApi = new PreloadApi();
  contextBridge.exposeInMainWorld(PRELOAD_API, preloadApi);
}

export class PreloadApi {
  shareMessageChannelRenderer = async (channel: string) => {
    const port = await shareMessagePortPreload(ipcRenderer, channel);
    return normalizeMessagePortPreload(port);
  };
}

main();
