import styles from "./ResponsiveBar.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata } from "../metadata-helpers";
import { isComponentDefChildren } from "../../components-core/utils/misc";
import { NotAComponentDefError } from "../../components-core/EngineError";
import {
  defaultResponsiveBarProps,
  ResponsiveBar,
  ResponsiveBarItem,
} from "./ResponsiveBarNative";

const RMCOMP = "ResponsiveBar";

export const ResponsiveBarMd = createMetadata({
  status: "stable",
  description:
    "`ResponsiveBar` provides a horizontal menu that automatically moves overflow " +
    "items to a dropdown when they don't fit in the available viewport width. " +
    "This pattern is commonly used in application menus (like VS Code's main menu) " +
    "to maintain usability across different screen sizes while preserving access " +
    "to all menu items. Each child is automatically wrapped as a menu item.",
  props: {
    overflowIcon: {
      description:
        `This property defines the icon to display on the overflow dropdown button. ` +
        `You can change the default icon for all ${RMCOMP} instances with the ` +
        `"icon.overflow:ResponsiveBar" declaration in the app configuration file.`,
      defaultValue: defaultResponsiveBarProps.overflowIcon,
      valueType: "string",
    },
    overflowLabel: {
      description:
        `This property defines the accessible label for the overflow dropdown button.`,
      defaultValue: defaultResponsiveBarProps.overflowLabel,
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
    [`backgroundColor-${RMCOMP}`]: "transparent",
    [`borderColor-${RMCOMP}`]: "$borderColor-subtle",
    [`borderWidth-${RMCOMP}`]: "0",
    [`borderStyle-${RMCOMP}`]: "solid",
    [`padding-${RMCOMP}`]: "0",
    [`gap-${RMCOMP}`]: "$space-1",
    
    [`backgroundColor-ResponsiveBarItem`]: "transparent",
    [`color-ResponsiveBarItem`]: "$textColor-primary",
    [`fontFamily-ResponsiveBarItem`]: "$fontFamily",
    [`fontSize-ResponsiveBarItem`]: "$fontSize-small",
    [`fontWeight-ResponsiveBarItem`]: "$fontWeight-medium",
    [`padding-ResponsiveBarItem`]: "0",
    [`borderRadius-ResponsiveBarItem`]: "$borderRadius-sm",
    [`gap-ResponsiveBarItem`]: "$space-1",
    
    [`backgroundColor-ResponsiveBarItem--hover`]: "$backgroundColor-action--hover",
    [`color-ResponsiveBarItem--hover`]: "$textColor-primary",
    [`backgroundColor-ResponsiveBarItem--active`]: "$backgroundColor-action--active",
    [`color-ResponsiveBarItem--active`]: "$color-primary",
    [`color-ResponsiveBarItem--disabled`]: "$textColor--disabled",
  },
});

export const responsiveBarComponentRenderer = createComponentRenderer(
  RMCOMP,
  ResponsiveBarMd,
  ({ node, extractValue, renderChild, registerComponentApi, layoutCss }) => {
    if (!isComponentDefChildren(node.children)) {
      throw new NotAComponentDefError();
    }

    return (
      <ResponsiveBar
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
              <ResponsiveBarItem>
                {renderedChild}
              </ResponsiveBarItem>
            );
          },
        })}
      </ResponsiveBar>
    );
  },
);


