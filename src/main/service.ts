import { EventEmitter } from "node:events";
import { DefaultMap, tinyassert } from "@hiogawa/utils";
import { ipcMain } from "electron";
import { handshakePortMain } from "../utils/message-channel-utils";

type ServiceEvent = "test";

export class MainService {
  private eventEmitter = new EventEmitter();
  private subscriptions = new DefaultMap<
    ServiceEvent,
    Map<string, { handler: any; port: Electron.MessagePortMain }>
  >(() => new Map());

  constructor() {
    setInterval(() => {
      this.eventEmitter.emit("test");
    }, 1000);
  }

  hello(who: string) {
    return "hello " + who;
  }

  //
  // DIY event callback system since `comlink.proxy` would require transfering MessagePort internally
  //

  async subscribe(event: ServiceEvent, subscriptionId: string) {
    console.log("subscribe", { event, subscriptionId });
    tinyassert(!this.subscriptions.get(event).has(subscriptionId));
    const port = await handshakePortMain(ipcMain, subscriptionId);
    const handler = (e: unknown) => {
      console.log("subscribe.handler", { e });
      port.postMessage({ success: true });
    };
    port.start();
    this.eventEmitter.on(event, handler);
    this.subscriptions.get(event).set(subscriptionId, { handler, port });
  }

  unsubscribe(event: ServiceEvent, subscriptionId: string) {
    const subscription = this.subscriptions.get(event).get(subscriptionId);
    tinyassert(subscription);
    this.eventEmitter.off(event, subscription.handler);
    subscription.port.close();
  }
}
