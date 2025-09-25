import { PART_START_ADORNMENT, PART_END_ADORNMENT, PART_INPUT } from "../../components-core/parts";
import { InputComponentDriver } from "../ComponentDrivers";

const PART_SPINNER_UP = "spinnerUp";
const PART_SPINNER_DOWN = "spinnerDown";

export class NumberBoxDriver extends InputComponentDriver {
  get input() {
    return this.getByPartName(PART_INPUT);
  }

  get startAdornment() {
    return this.getByPartName(PART_START_ADORNMENT);
  }

  get endAdornment() {
    return this.getByPartName(PART_END_ADORNMENT);
  }

  get spinnerUp() {
    return this.getByPartName(PART_SPINNER_UP);
  }

  get spinnerDown() {
    return this.getByPartName(PART_SPINNER_DOWN);
  }

  async increment() {
    await this.spinnerUp.click();
  }

  async decrement() {
    await this.spinnerDown.click();
  }
}
