import styles from "./SubNavPanel.module.scss";

import { createMetadata } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { SubNavPanel } from "./SubNavPanelNative";

const COMP = "SubNavPanel";

export const NavPanelMd = createMetadata({
  status: "experimental",
  props: {
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
  },
});

export const subNavPanelRenderer = createComponentRenderer(
  COMP,
  NavPanelMd,
  ({ node, renderChild, layoutCss, layoutContext }) => {
    return (
        <SubNavPanel>
          {renderChild(node.children)}
        </SubNavPanel>
    );
  },
);
