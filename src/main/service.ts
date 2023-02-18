import { ipcMain } from "electron";
import { EventEmitterMain } from "../utils/comlink-event-utils";
import { receiveMessagePortMainPromise } from "../utils/message-channel-utils";
import { DEFAULT_EVENT } from "./common";

export class MainService {
  public eventEmitter = new EventEmitterMain((id) =>
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
}
