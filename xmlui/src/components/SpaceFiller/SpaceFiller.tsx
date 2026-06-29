import { createMetadata } from "../../component-core/metadata/helpers";
import { extractScssThemeVars } from "../../styling/theme";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  status: "stable",
  description:
    "`SpaceFiller` works well in layout containers to fill remaining (unused) space. Its behavior depends on the layout container in which it is used.",
  props: {
    testId: {
      description: "This optional property adds a test identifier to the SpaceFiller root element.",
      valueType: "string",
    },
  },
  themeVars: extractScssThemeVars(""),
});
