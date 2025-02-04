import type { ComponentMetadata } from "xmlui";
import { iphoneFrameMd, macAppFrameMd, windowsAppFrameMd } from "../src";

export const componentMetadata: Record<string, ComponentMetadata> = {
  windowsAppFrame: windowsAppFrameMd,
  macAppFrame: macAppFrameMd,
  iphoneFrame: iphoneFrameMd,
};
