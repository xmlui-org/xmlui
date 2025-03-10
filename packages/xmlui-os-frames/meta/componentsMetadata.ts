import { iphoneFrameMd, macAppFrameMd, windowsAppFrameMd } from "../src";

export const componentMetadata = {
  name: "OSFrames",
  description: "This package provides containers that appear to look like OS-specific windows.",
  state: "internal",
  metadata: {
    WindowsAppFrame: windowsAppFrameMd,
    MacAppFrame: macAppFrameMd,
    IphoneFrame: iphoneFrameMd,
  },
};
