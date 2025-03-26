import styles from "./Accordion.module.scss";

import { createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import {
  dCollapse,
  dDidChange,
  dExpand,
  dExpanded,
  dFocus,
} from "../../components/metadata-helpers";
import { triggerPositionNames } from "../../components/abstractions";
import { AccordionComponent, defaultProps } from "./AccordionNative";

const COMP = "Accordion";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/accordion/
// Make the header focusable, handle ARIA attributes, and manage the state of the accordion.

export const AccordionMd = createMetadata({
  status: "in progress",
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a collapsible container that toggles ` +
    `the display of content sections. It helps organize information by expanding or collapsing it ` +
    `based on user interaction.`,
  props: {
    triggerPosition: {
      description: `This property indicates the position where the trigger icon should be displayed. The \`start\` ` +
        `value signs the trigger is before the header text (template), and \`end\` indicates that it ` +
        `follows the header.`,
      defaultValue: defaultProps.triggerPosition,
      valueType: "string",
      availableValues: triggerPositionNames,
    },
    collapsedIcon: {
      description: `This property is the name of the icon that is displayed when the accordion is collapsed.`,
      valueType: "string",
      defaultValue: defaultProps.collapsedIcon,
    },
    expandedIcon: {
      description: `This property is the name of the icon that is displayed when the accordion is expanded.`,
      valueType: "string",
    },
    hideIcon: {
      description: `This property indicates that the trigger icon is not displayed (\`true\`).`,
      defaultValue: defaultProps.hideIcon,
      valueType: "boolean",
    },
    rotateExpanded: {
      description: `This optional property defines the rotation angle of the expanded icon (relative to the collapsed icon).`,
      valueType: "string",
      defaultValue: defaultProps.rotateExpanded,
    },
  },
  events: {
    displayDidChange: dDidChange(COMP),
  },
  apis: {
    expanded: dExpanded(COMP),
    expand: dExpand(COMP),
    collapse: dCollapse(COMP),
    toggle: d(`This method toggles the state of the ${COMP} between expanded and collapsed.`),
    focus: dFocus(COMP),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`paddingHorizontal-header-${COMP}`]: "$space-3",
    [`paddingVertical-header-${COMP}`]: "$space-3",
    [`verticalAlign-header-${COMP}`]: "center",
    [`fontSize-header-${COMP}`]: "$fontSize-normal",
    [`fontWeight-header-${COMP}`]: "$fontWeight-normal",
    [`fontFamily-header-${COMP}`]: "$fontFamily",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`width-icon-${COMP}`]: "",
    [`height-icon-${COMP}`]: "",
    [`backgroundColor-header-${COMP}`]: "$color-primary-500",
    [`backgroundColor-header-${COMP}-hover`]: "$color-primary-400",
    [`color-header-${COMP}`]: "$color-surface-50",
    [`color-content-${COMP}`]: "$textColor-primary",
    [`backgroundColor-content-${COMP}`]: "transparent",
    [`color-icon-${COMP}`]: "$color-surface-50",
  },
});

export const accordionComponentRenderer = createComponentRenderer(
  COMP,
  AccordionMd,
  ({ node, renderChild, extractValue, lookupEventHandler, registerComponentApi, layoutCss }) => {
    return (
      <AccordionComponent
        style={layoutCss}
        triggerPosition={extractValue(node.props?.triggerPosition)}
        collapsedIcon={extractValue(node.props.collapsedIcon)}
        expandedIcon={extractValue(node.props.expandedIcon)}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        rotateExpanded={extractValue(node.props.rotateExpanded)}
        onDisplayDidChange={lookupEventHandler("displayDidChange")}
        registerComponentApi={registerComponentApi}
      >
        {renderChild(node.children)}
      </AccordionComponent>
    );
  },
);
