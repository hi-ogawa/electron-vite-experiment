import { Remote, wrap } from "comlink";
import { DEFAULT_EVENT, EXPOSE_MAIN_SERVICE } from "../main/common";
import type { MainService } from "../main/service";
import { getGlobalPreloadApi } from "../preload/common";
import {
  EventEmitterMain,
  EventEmitterRenderer,
} from "../utils/comlink-event-utils";

export let mainServiceClient: Remote<MainService>;

export async function initializeMainServiceClient(): Promise<void> {
  // request Remove<MainService>
  const endpoint = await getGlobalPreloadApi().sendMessagePort(
    EXPOSE_MAIN_SERVICE
  );
  mainServiceClient = wrap<MainService>(endpoint);

  // register callback via dedicated port
  const eventEmitterClient = new EventEmitterRenderer(
    mainServiceClient.eventEmitter as unknown as Remote<EventEmitterMain>, // TODO: wrong comlink typing
    getGlobalPreloadApi().sendMessagePort
  );
  await eventEmitterClient.on(DEFAULT_EVENT, (...args) => {
    console.log({ args });
  });
}
