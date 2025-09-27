import { Locator } from "@playwright/test";
import { ComponentDriver } from "../ComponentDrivers";

export class TreeDriver extends ComponentDriver {
  getNodeById(nodeId: string): Locator {
    return this.component.locator(`[data-tree-node-id="${nodeId}"]`).first();
  }
}
