import { tinyassert } from "@hiogawa/utils";
import { Endpoint, Remote, TransferHandler, expose, wrap } from "comlink";
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

const INJECTED_MESSAGE_CHANNEL = "__INJECTED_MESSAGE_CHANNEL";

export function myProxy<T extends object>(
  value: T,
  messageChannel: MessageChannel
): T {
  Object.assign(value, { [INJECTED_MESSAGE_CHANNEL]: messageChannel });
  return value;
}

export const myProxyTransferHandlerPreload: TransferHandler<any, any> = {
  canHandle: (value: any): value is any => {
    return Object.hasOwn(value, INJECTED_MESSAGE_CHANNEL);
  },

  // run on preload
  serialize: (value: any): [any, Transferable[]] => {
    const messageChannel: MessageChannel = value[INJECTED_MESSAGE_CHANNEL];
    messageChannel.port1;
    delete value[INJECTED_MESSAGE_CHANNEL];

    // const channel = `myProxy-${generateId()}`;
    // expose(value, value.__endpoint);
    return [{}, []];
  },

  // run on main
  deserialize: (value: any): any => {
    value;
  },
};
