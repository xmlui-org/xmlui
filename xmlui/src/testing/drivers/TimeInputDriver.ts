import { ComponentDriver } from "../ComponentDrivers";

export class TimeInputDriver extends ComponentDriver {
  /**
   * Get the input component representing the hour part
   */
  getHourInput() {
    return this.getByPartName("hour");
  }

  getMinuteInput() {
    return this.getByPartName("minute");
  }

  getSecondInput() {
    return this.getByPartName("second");
  }

  getAmPmInput() {
    return this.getByPartName("ampm");
  } 

  getClearButton() {
    return this.getByPartName("clearButton");
  }
}
