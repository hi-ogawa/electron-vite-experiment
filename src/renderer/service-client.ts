import { Remote, wrap } from "comlink";
import { EXPOSE_MAIN_SERVICE } from "../main/common";
import type { MainService } from "../main/service";
import { getGlobalPreloadApi } from "../preload/common";
import { sendCallbackRenderer } from "../utils/comlink-event-utils";

export let mainServiceClient: Remote<MainService>;

export async function initializeMainServiceClient(): Promise<void> {
  // request Remove<MainService>
  const endpoint = await getGlobalPreloadApi().sendMessagePort(
    EXPOSE_MAIN_SERVICE
  );
  mainServiceClient = wrap<MainService>(endpoint);

  // register callback via dedicated port
  await sendCallbackRenderer(
    (event) => {
      console.log("test received", event);
    },
    (id) => getGlobalPreloadApi().sendMessagePort(id),
    (id) => mainServiceClient.subscribe(id)
  );
}
