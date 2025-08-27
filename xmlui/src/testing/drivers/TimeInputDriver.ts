import { InputComponentDriver } from "../ComponentDrivers";

export class TimeInputDriver extends InputComponentDriver {
  get hourInput() {
    return this.getByPartName("hour");
  }

  get minuteInput() {
    return this.getByPartName("minute");
  }

  get secondInput() {
    return this.getByPartName("second");
  }

  get amPmInput() {
    return this.getByPartName("ampm");
  } 

  get clearButton() {
    return this.getByPartName("clearButton");
  }
}
