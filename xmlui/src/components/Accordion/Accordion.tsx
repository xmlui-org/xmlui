import { createMetadata, d } from "@abstractions/ComponentDefs";

import styles from "./Accordion.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { parseScssVar } from "@components-core/theming/themeVars";
import { AccordionComponent } from "./AccordionNative";
import {
  dCollapse,
  dComponent,
  dDidChange,
  dExpand,
  dExpanded,
  dFocus,
} from "@components/metadata-helpers";
import { MemoizedItem } from "@components/container-helpers";
import { triggerPositionNames } from "@components/abstractions";

const COMP = "Accordion";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/accordion/
// Make the header focusable, handle ARIA attributes, and manage the state of the accordion.

export const AccordionMd = createMetadata({
  description:
    `(**NOT IMPLEMENTED YET**) The \`${COMP}\` component is a collapsible container that toggles ` +
    `the display of content sections. It helps organize information by expanding or collapsing it ` +
    `based on user interaction.`,
  props: {
    headerTemplate: dComponent(
      "This property describes the template to use as the component's header.",
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
  ({ node, renderChild, extractValue }) => {
    return (
      <AccordionComponent
        headerRenderer={
          node.props.headerTemplate
            ? (item) => (
                <MemoizedItem
                  node={node.props.headerTemplate ?? ({ type: "Fragment" } as any)}
                  item={item}
                  renderChild={renderChild}
                />
              )
            : undefined
        }
        triggerPosition={extractValue.asOptionalString(node.props?.triggerPosition)}
        collapsedIcon={node.props.collapsedIcon}
        expandedIcon={node.props.expandedIcon}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        rotateExpanded={node.props.rotateExpanded}
      >
        {renderChild(node.children)}
      </AccordionComponent>
    );
  },
);
