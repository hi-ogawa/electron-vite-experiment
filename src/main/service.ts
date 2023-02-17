import { ipcMain } from "electron";
import { EventEmitterMain } from "../utils/comlink-event-utils";
import { receiveMessagePortMainPromise } from "../utils/message-channel-utils";

const DEFAULT_EVENT = "__default";

export class MainService {
  private eventEmitter = new EventEmitterMain((id) =>
    receiveMessagePortMainPromise(ipcMain, id)
  );

  constructor() {
    setInterval(() => {
      this.eventEmitter.emit(DEFAULT_EVENT, "test");
    }, 1000);
  }

  hello(who: string) {
    return "hello " + who;
  }

  async subscribe(callbackId: string) {
    this.eventEmitter.on(DEFAULT_EVENT, callbackId);
  }

  unsubscribe(callbackId: string) {
    this.eventEmitter.off(DEFAULT_EVENT, callbackId);
  }
}
