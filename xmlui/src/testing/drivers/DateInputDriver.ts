import { InputComponentDriver } from "../ComponentDrivers";

export class DateInputDriver extends InputComponentDriver {
  get dayInput() {
    return this.getByPartName("day");
  }

  get monthInput() {
    return this.getByPartName("month");
  }

  get yearInput() {
    return this.getByPartName("year");
  }

  get clearButton() {
    return this.getByPartName("clearButton");
  }
}
