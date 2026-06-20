import { createMetadata } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { SpaceFiller } from "./SpaceFillerReact";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  status: "stable",
  description:
    "`SpaceFiller` works well in layout containers to fill remaining unused space.",
  themeVars: extractScssThemeVars(""),
});

export const spaceFillerRenderer = wrapComponent({
  name: COMP,
  metadata: SpaceFillerMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <SpaceFiller
      data-xmlui-component={COMP}
      data-xmlui-part="root"
      data-testid={adapter.stringProp("testId", "test-id-component")}
    />
  ),
});
