import { ipcMain } from "electron";
import { EventEmitterMain } from "../utils/comlink-event-utils";
import { receiveMessagePortMainPromise } from "../utils/message-channel-utils";
import { CHANGE_COUNTER } from "./common";

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
    this.eventEmitter.emit(CHANGE_COUNTER, {});
  }
}
