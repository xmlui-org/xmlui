import type { ComponentDef } from "@abstractions/ComponentDefs";
import { createComponentRenderer } from "@components-core/renderers";
import styles from "./SpaceFiller.module.scss";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { parseScssVar } from "@components-core/theming/themeVars";

// =====================================================================================================================
// React SpaceFiller component implementation

export const SpaceFiller = () => {
  return <div className={styles.spacer} />;
};

// =====================================================================================================================
// XMLUI SpaceFiller component definition

/**
 * The \`SpaceFiller\` is a component that works well in layout containers to fill the remaining (unused) space. 
 * Its behavior depends on the layout container in which it is used.
 * @descriptionRef
 */
export interface SpaceFillerComponentDef extends ComponentDef<"SpaceFiller"> {}

export const SpaceFillerMd: ComponentDescriptor<SpaceFillerComponentDef> = {
  displayName: "SpaceFiller",
  description: "Fills the space between two components in a Stack or FlowLayout container.",
  themeVars: parseScssVar(styles.themeVars),
};

export const spaceFillerComponentRenderer = createComponentRenderer<SpaceFillerComponentDef>(
  "SpaceFiller",
  () => <SpaceFiller />,
  SpaceFillerMd
);
