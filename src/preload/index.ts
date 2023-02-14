import { contextBridge } from "electron";
import { createComlinkEndpointPreload } from "./comlink-utils";
import { PRELOAD_API } from "./common";

function main() {
  const preloadApi = new PreloadApi();
  contextBridge.exposeInMainWorld(PRELOAD_API, preloadApi);
}

export class PreloadApi {
  createComlinkEndpointPreload = createComlinkEndpointPreload;
}

main();
