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
import { AccordionComponent } from "./AccordionNative";

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
    triggerPosition: d(
      `This property indicates the position where the trigger icon should be displayed. The \`start\` ` +
        `value signs the trigger is before the header text (template), and \`end\` indicates that it ` +
        `follows the header.`,
      triggerPositionNames,
      null,
      "end",
    ),
    collapsedIcon: d(
      `This property is the name of the icon that is displayed when the accordion is collapsed.`,
    ),
    expandedIcon: d(
      `This property is the name of the icon that is displayed when the accordion is expanded.`,
    ),
    hideIcon: d(
      `This property indicates that the trigger icon is not displayed (\`true\`).`,
      null,
      "boolean",
      false,
    ),
    rotateExpanded: d(
      `This optional property defines the rotation angle of the expanded icon (relative to the collapsed icon).`,
    ),
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
    [`padding-horizontal-header-${COMP}`]: "$space-3",
    [`padding-vertical-header-${COMP}`]: "$space-3",
    [`align-vertical-header-${COMP}`]: "center",
    [`font-size-header-${COMP}`]: "$font-size-normal",
    [`font-weight-header-${COMP}`]: "$font-weight-normal",
    [`font-family-header-${COMP}`]: "$font-family",
    [`border-${COMP}`]: "none",
    [`width-icon-${COMP}`]: "",
    [`height-icon-${COMP}`]: "",
    light: {
      [`color-bg-header-${COMP}`]: "$color-primary-500",
      [`color-bg-header-${COMP}-hover`]: "$color-primary-400",
      [`color-header-${COMP}`]: "$color-surface-50",
      [`color-content-${COMP}`]: "$color-text-primary",
      [`color-bg-content-${COMP}`]: "transparent",
      [`color-icon-${COMP}`]: "$color-surface-50",
    },
    dark: {
      [`color-bg-header-${COMP}`]: "$color-primary-500",
      [`color-bg-header-${COMP}-hover`]: "$color-primary-600",
      [`color-header-${COMP}`]: "$color-surface-50",
      [`color-content-${COMP}`]: "$color-text-primary",
      [`color-bg-content-${COMP}`]: "transparent",
      [`color-icon-${COMP}`]: "$color-surface-50",
    },
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
