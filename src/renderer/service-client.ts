import { Remote, wrap } from "comlink";
import { EXPOSE_MAIN_SERVICE } from "../main/common";
import type { MainService } from "../main/service";
import { getGlobalPreloadApi } from "../preload/common";
import {
  EventEmitterMain,
  EventEmitterRenderer,
} from "../utils/comlink-event-utils";

export let mainServiceClient: Remote<MainService>;
export let mainServiceEventEmitter: EventEmitterRenderer;

export async function initializeMainServiceClient(): Promise<void> {
  // request Remove<MainService>
  const endpoint = await getGlobalPreloadApi().sendMessagePort(
    EXPOSE_MAIN_SERVICE
  );
  mainServiceClient = wrap<MainService>(endpoint);

  // create EventEmitterRenderer as a wrapper of Remote<EventEmitterMain>
  mainServiceEventEmitter = new EventEmitterRenderer(
    mainServiceClient.eventEmitter as unknown as Remote<EventEmitterMain>, // TODO: wrong comlink typing
    getGlobalPreloadApi().sendMessagePort
  );
}
