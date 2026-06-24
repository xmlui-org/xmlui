import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  status: "stable",
  description:
    "`SpaceFiller` works well in layout containers to fill remaining unused space.",
  themeVars: extractScssThemeVars(""),
});
