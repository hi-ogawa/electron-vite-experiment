import { Remote, wrap } from "comlink";
import { EXPOSE_MAIN_SERVICE } from "../main/common";
import type { MainService } from "../main/service";
import { getGlobalPreloadApi } from "../preload/common";
import { generateId } from "../utils/misc";

export let mainServiceClient: Remote<MainService>;

export async function initializeMainServiceClient(): Promise<void> {
  // request Remove<MainService>
  const endpoint = await getGlobalPreloadApi().sendMessagePort(
    EXPOSE_MAIN_SERVICE
  );
  mainServiceClient = wrap<MainService>(endpoint);

  // request dedicated port for event callbacks
  // TODO: can we abstract like "exposeEventEmitter/wrapEventEmitter"
  const subscriptionId = generateId();
  const [, port] = await Promise.all([
    // TODO: does order matters?
    mainServiceClient.subscribe("test", subscriptionId),
    getGlobalPreloadApi().sendMessagePort(subscriptionId),
  ]);
  port.addEventListener("message", (event) => {
    console.log("test received", event);
  });
}
