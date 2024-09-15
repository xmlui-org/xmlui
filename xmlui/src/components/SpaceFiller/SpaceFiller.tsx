import { createMetadata } from "@abstractions/ComponentDefs";
import { createComponentRendererNew } from "@components-core/renderers";
import styles from "./SpaceFiller.module.scss";
import { parseScssVar } from "@components-core/theming/themeVars";
import { SpaceFiller } from "./SpaceFillerNative";

const COMP = "SpaceFiller";

export const SpaceFillerMd = createMetadata({
  description:
    `The \`${COMP}\` is a component that works well in layout containers to fill the ` +
    `remaining (unused) space. Its behavior depends on the layout container in which it is used.`,
  themeVars: parseScssVar(styles.themeVars),
});

export const spaceFillerComponentRenderer = createComponentRendererNew(COMP, SpaceFillerMd, () => (
  <SpaceFiller />
));
