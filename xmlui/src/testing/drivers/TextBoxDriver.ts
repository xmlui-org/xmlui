import { PART_START_ADORNMENT, PART_END_ADORNMENT } from "../../components-core/parts";
import { InputComponentDriver } from "../ComponentDrivers";

export class TextBoxDriver extends InputComponentDriver {
  get input() {
    return this.getByPartName("input");
  }

  get startAdornment() {
    return this.getByPartName(PART_START_ADORNMENT);
  }

  get endAdornment() {
    return this.getByPartName(PART_END_ADORNMENT);
  }

  get button() {
    return this.getByPartName(PART_END_ADORNMENT);
  }
}