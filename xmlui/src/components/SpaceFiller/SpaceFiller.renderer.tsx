import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { SpaceFillerMd } from "./SpaceFiller";
import { SpaceFiller } from "./SpaceFillerReact";

const COMP = "SpaceFiller";

export const spaceFillerRenderer = wrapComponent({
  name: COMP,
  metadata: SpaceFillerMd as ComponentMetadata,
  renderer: ({ adapter }) => (
    <SpaceFiller
      classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      data-xmlui-component={COMP}
      data-xmlui-part="root"
      data-testid={adapter.stringProp("testId", "test-id-component")}
    />
  ),
});
