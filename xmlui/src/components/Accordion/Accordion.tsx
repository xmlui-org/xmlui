import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./Accordion.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { Accordion, positionInGroupNames } from "./AccordionNative";
import {
  dCollapse,
  dComponent,
  dDidChange,
  dExpand,
  dExpanded,
  dFocus,
} from "@components/metadata-helpers";
import { triggerPositionNames } from "@components/abstractions";
import { MemoizedItem } from "@components/container-helpers";

const COMP = "Accordion";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/accordion/
// Make the header focusable, handle ARIA attributes, and manage the state of the accordion.

export const AccordionMd = createMetadata({
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a collapsible container that toggles ` +
    `the display of content sections. It helps organize information by expanding or collapsing it ` +
    `based on user interaction.`,
  props: {
    header: d("This property declares the text used in the component's header."),
    headerTemplate: dComponent(
      "This property describes the template to use as the component's header.",
    ),
    initiallyExpanded: d(
      `This property indicates if the ${COMP} is expanded (\`true\`) or collapsed (\`false\`).`,
      null,
      "boolean",
      false,
    ),
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
    positionInGroup: d(
      `This property indicates the position of the accordion in a group of accordions.`,
      positionInGroupNames,
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
    [`padding-horizontal-header-${COMP}`]: "",
    [`padding-vertical-header-${COMP}`]: "",
    [`align-vertical-header-${COMP}`]: "",
    [`font-size-header-${COMP}`]: "",
    [`font-weight-header-${COMP}`]: "",
    [`font-style-header-${COMP}`]: "",
    [`border-radius-${COMP}`]: "",
    [`thickness-border-${COMP}`]: "",
    [`style-border-${COMP}`]: "",
    [`width-icon-${COMP}`]: "",
    [`height-icon-${COMP}`]: "",
    light: {
      [`color-bg-header-${COMP}`]: "",
      [`color-header-${COMP}`]: "",
      [`color-border-${COMP}`]: "",
      [`color-icon-${COMP}`]: "",
    },
    dark: {
      [`color-bg-header-${COMP}`]: "",
      [`color-header-${COMP}`]: "",
      [`color-border-${COMP}`]: "",
      [`color-icon-${COMP}`]: "",
    },
  },
});

export const accordionComponentRenderer = createComponentRenderer(
  COMP,
  AccordionMd,
  ({ node, extractValue, lookupEventHandler, layoutCss, renderChild }) => {
    return (
      <Accordion>
        {renderChild(node.children)}
      </Accordion>
    );
  },
);
