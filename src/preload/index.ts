import type * as comlink from "comlink";
import { contextBridge, ipcRenderer } from "electron";
import { handshakePortPreload } from "../utils/message-channel-utils";
import {
  createComlinkEndpointPreload,
  toPreloadEndpoint,
} from "./comlink-utils";
import { PRELOAD_API } from "./common";

function main() {
  const preloadApi = new PreloadApi();
  contextBridge.exposeInMainWorld(PRELOAD_API, preloadApi);
}

export class PreloadApi {
  createComlinkEndpointPreload = createComlinkEndpointPreload;

  handshakePortPreload = async (channel: string): Promise<comlink.Endpoint> => {
    const port = await handshakePortPreload(ipcRenderer, channel);
    return toPreloadEndpoint(port);
  };
}

main();
