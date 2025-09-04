import { ComponentDriver } from "../ComponentDrivers";

export class TimerDriver extends ComponentDriver {
  async isEnabled(): Promise<boolean> {
    const enabled = await this.component.getAttribute("data-timer-enabled");
    return enabled === "true";
  }

  async isRunning(): Promise<boolean> {
    const running = await this.component.getAttribute("data-timer-running");
    return running === "true";
  }

  async isPaused(): Promise<boolean> {
    const paused = await this.component.getAttribute("data-timer-paused");
    return paused === "true";
  }

  async isInInitialDelay(): Promise<boolean> {
    const inDelay = await this.component.getAttribute("data-timer-in-initial-delay");
    return inDelay === "true";
  }

  async getInterval(): Promise<number> {
    const interval = await this.component.getAttribute("data-timer-interval");
    return parseInt(interval || "0", 10);
  }

  async getInitialDelay(): Promise<number> {
    const delay = await this.component.getAttribute("data-timer-initial-delay");
    return parseInt(delay || "0", 10);
  }

  async isOnce(): Promise<boolean> {
    const once = await this.component.getAttribute("data-timer-once");
    return once === "true";
  }

  async hasExecuted(): Promise<boolean> {
    const executed = await this.component.getAttribute("data-timer-has-executed");
    return executed === "true";
  }
}
