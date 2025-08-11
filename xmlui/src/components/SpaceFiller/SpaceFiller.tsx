import styles from "./SpaceFiller.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { SpaceFiller } from "./SpaceFillerNative";
import { createMetadata } from "../metadata-helpers";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  status: "stable",
  description:
    "`SpaceFiller` works well in layout containers to fill remaining (unused) " +
    "space. Its behavior depends on the layout container in which it is used.",
  themeVars: parseScssVar(styles.themeVars),
});

export const spaceFillerComponentRenderer = createComponentRenderer(COMP, SpaceFillerMd, () => (
  <SpaceFiller />
));
