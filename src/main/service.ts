import { ipcMain } from "electron";
import { EventEmitterMain } from "../utils/comlink-event-utils";
import { receiveMessagePortMainPromise } from "../utils/message-channel-utils";
import { DEFAULT_EVENT } from "./common";

export class MainService {
  public eventEmitter = new EventEmitterMain((id) =>
    receiveMessagePortMainPromise(ipcMain, id)
  );

  private counter: number = 0;

  getCounter(): number {
    return this.counter;
  }

  changeCounter(delta: number) {
    this.counter += delta;
    this.eventEmitter.emit(DEFAULT_EVENT, {});
  }
}
