import { EventEmitter } from "node:events";

export class MainService {
  private eventEmitter = new EventEmitter();

  constructor() {
    setInterval(() => {
      this.eventEmitter.emit("timer");
    }, 1000);
  }

  hello(who: string) {
    return "hello " + who;
  }

  subscribe(eventName: string, handler: () => void) {
    this.eventEmitter.on(eventName, handler);
  }
}
