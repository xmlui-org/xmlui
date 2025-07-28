import styles from "./ResponsiveMenu.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../metadata-helpers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import {
  defaultResponsiveMenuProps,
  ResponsiveMenu,
  ResponsiveMenuItem,
} from "./ResponsiveMenuNative";

const RMCOMP = "ResponsiveMenuBar";

export const ResponsiveMenuBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveMenuBar` provides a horizontal menu that automatically moves overflow " +
    "items to a dropdown when they don't fit in the available viewport width. " +
    "This pattern is commonly used in application menus (like VS Code's main menu) " +
    "to maintain usability across different screen sizes while preserving access " +
    "to all menu items. Each child is automatically wrapped as a menu item.",
  props: {
    overflowIcon: {
      description:
        `This property defines the icon to display on the overflow dropdown button. ` +
        `You can change the default icon for all ${RMCOMP} instances with the ` +
        `"icon.overflow:ResponsiveMenuBar" declaration in the app configuration file.`,
      defaultValue: defaultResponsiveMenuProps.overflowIcon,
      valueType: "string",
    },
    overflowLabel: {
      description:
        `This property defines the accessible label for the overflow dropdown button.`,
      defaultValue: defaultResponsiveMenuProps.overflowLabel,
      valueType: "string",
    },
  },
  apis: {
    recalculate: {
      description: `This method recalculates the visible and overflow items based on current container width.`,
      signature: "recalculate(): void",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${RMCOMP}`]: "$color-surface",
    [`borderColor-${RMCOMP}`]: "$borderColor-subtle",
    [`borderWidth-${RMCOMP}`]: "0",
    [`borderStyle-${RMCOMP}`]: "solid",
    [`padding-${RMCOMP}`]: "$space-2 $space-3",
    [`gap-${RMCOMP}`]: "$space-1",
    
    [`backgroundColor-ResponsiveMenuItem`]: "transparent",
    [`color-ResponsiveMenuItem`]: "$textColor-primary",
    [`fontFamily-ResponsiveMenuItem`]: "$fontFamily",
    [`fontSize-ResponsiveMenuItem`]: "$fontSize-small",
    [`fontWeight-ResponsiveMenuItem`]: "$fontWeight-medium",
    [`padding-ResponsiveMenuItem`]: "$space-1 $space-2",
    [`borderRadius-ResponsiveMenuItem`]: "$borderRadius-sm",
    [`gap-ResponsiveMenuItem`]: "$space-1",
    
    [`backgroundColor-ResponsiveMenuItem--hover`]: "$backgroundColor-action--hover",
    [`color-ResponsiveMenuItem--hover`]: "$textColor-primary",
    [`backgroundColor-ResponsiveMenuItem--active`]: "$backgroundColor-action--active",
    [`color-ResponsiveMenuItem--active`]: "$color-primary",
    [`color-ResponsiveMenuItem--disabled`]: "$textColor--disabled",
  },
});

export const responsiveMenuBarComponentRenderer = createComponentRenderer(
  RMCOMP,
  ResponsiveMenuBarMd,
  ({ node, extractValue, renderChild, registerComponentApi, layoutCss }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    return (
      <ResponsiveMenu
        registerComponentApi={registerComponentApi}
        style={layoutCss}
        overflowIcon={extractValue(node.props?.overflowIcon)}
        overflowLabel={extractValue(node.props?.overflowLabel)}
      >
        {renderChild(node.children, {
          wrapChild: ({ node, extractValue, lookupEventHandler }, renderedChild, hints) => {
            if (hints?.opaque) {
              return renderedChild;
            }
            
            return (
              <ResponsiveMenuItem>
                {renderedChild}
              </ResponsiveMenuItem>
            );
          },
        })}
      </ResponsiveMenu>
    );
  },
);


