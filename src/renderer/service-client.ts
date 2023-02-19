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
  const port = await getGlobalPreloadApi().shareMessageChannelRenderer(
    EXPOSE_MAIN_SERVICE
  );
  mainServiceClient = wrap<MainService>(port);

  // create EventEmitterRenderer as a wrapper of Remote<EventEmitterMain>
  mainServiceEventEmitter = new EventEmitterRenderer(
    // @ts-expect-error wrong comlink typing
    mainServiceClient.eventEmitter as Remote<EventEmitterMain>,
    getGlobalPreloadApi().shareMessageChannelRenderer
  );
}
