import { ComponentDriver } from "../ComponentDrivers";

export class ModalDialogDriver extends ComponentDriver {
  get titlePart() {
    return this.getByPartName("title");
  }
}
