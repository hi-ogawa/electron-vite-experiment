import * as comlink from "comlink";
import { COMLINK_HANDSHAKE_MESSAGE } from "../main/common";
import type { MainService } from "../main/service";
import { getGlobalPreloadApi } from "../preload/common";
import { generateId } from "../utils/misc";

export let mainServiceClient: comlink.Remote<MainService>;

export async function initializeMainServiceClient(): Promise<void> {
  const endpoint = await getGlobalPreloadApi().createComlinkEndpointPreload(
    COMLINK_HANDSHAKE_MESSAGE
  );
  mainServiceClient = comlink.wrap<MainService>(endpoint);

  const subscriptionId = generateId();
  mainServiceClient.subscribe("test", subscriptionId);
  const port = await getGlobalPreloadApi().handshakePortPreload(subscriptionId);
  port.addEventListener("message", () => {
    console.log("yeah");
  });
}
