import { InputComponentDriver } from "../ComponentDrivers";
import { PART_INPUT, PART_TRACK, PART_RANGE, PART_THUMB } from "../../components-core/parts";

export class SliderDriver extends InputComponentDriver {
  get input() {
    return this.getByPartName(PART_INPUT);
  }

  get track() {
    return this.getByPartName(PART_TRACK);
  }

  get range() {
    return this.getByPartName(PART_RANGE);
  }

  get thumb() {
    return this.getByPartName(PART_THUMB);
  }
}
