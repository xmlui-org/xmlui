import type { CSSProperties } from "react";

import { createMetadata, dComponent } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent, nonPropertyChildren } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps } from "./Accordion.defaults";
import { defaultProps as accordionItemDefaultProps } from "./AccordionItem.defaults";
import { AccordionComponent } from "./AccordionReact";
import { AccordionItemComponent } from "./AccordionItemReact";

const COMP = "Accordion";
const ITEM_COMP = "AccordionItem";
const accordionStylesSource = `
  createThemeVar("borderRadius-Accordion");
  createThemeVar("border-Accordion");
  createThemeVar("padding-Accordion");
  createThemeVar("paddingHorizontal-header-Accordion");
  createThemeVar("paddingVertical-header-Accordion");
  createThemeVar("verticalAlignment-header-Accordion");
  createThemeVar("fontSize-header-Accordion");
  createThemeVar("fontWeight-header-Accordion");
  createThemeVar("fontFamily-header-Accordion");
  createThemeVar("fontStyle-header-Accordion");
  createThemeVar("backgroundColor-header-Accordion");
  createThemeVar("backgroundColor-header-Accordion-hover");
  createThemeVar("color-header-Accordion");
  createThemeVar("color-content-Accordion");
  createThemeVar("backgroundColor-content-Accordion");
  createThemeVar("color-icon-Accordion");
  createThemeVar("padding-content-Accordion");
  createThemeVar("width-icon-Accordion");
  createThemeVar("height-icon-Accordion");
`;

export const AccordionMd = createMetadata({
  status: "in progress",
  description:
    `The \`${COMP}\` component is a collapsible container that toggles the display of content sections.`,
  props: {
    triggerPosition: {
      description: "This property indicates the position where the trigger icon should be displayed.",
      defaultValue: defaultProps.triggerPosition,
      valueType: "string",
      availableValues: ["start", "end"],
    },
    collapsedIcon: {
      description: "This property is the icon name displayed when the accordion is collapsed.",
      valueType: "string",
      defaultValue: defaultProps.collapsedIcon,
    },
    expandedIcon: {
      description: "This property is the icon name displayed when the accordion is expanded.",
      valueType: "string",
    },
    hideIcon: {
      description: "This property indicates that the trigger icon is not displayed.",
      defaultValue: defaultProps.hideIcon,
      valueType: "boolean",
    },
    rotateExpanded: {
      description: "This optional property defines the rotation angle of the expanded icon.",
      valueType: "string",
      defaultValue: defaultProps.rotateExpanded,
    },
    testId: {
      description: "Adds a test identifier to the Accordion root.",
      valueType: "string",
    },
  },
  events: {
    displayDidChange: {
      description: `This event fires when the displayed state of the ${COMP} changes.`,
      signature: "(changedValue: string[]) => void",
      parameters: {
        changedValue: "An array of IDs representing the currently expanded accordion items.",
      },
    },
  },
  apis: {
    expanded: {
      description: "Returns true if an accordion item is expanded.",
      signature: "get expanded(): boolean",
    },
    expand: {
      description: "Expands the accordion item.",
      signature: "expand()",
    },
    collapse: {
      description: "Collapses the accordion item.",
      signature: "collapse()",
    },
    toggle: {
      description: "Toggles the state of the accordion item.",
      signature: "toggle()",
    },
    focus: {
      description: `Focus the ${COMP} component.`,
      signature: "focus(): void",
    },
  },
  themeVars: extractScssThemeVars(accordionStylesSource),
  defaultThemeVars: {
    [`paddingHorizontal-header-${COMP}`]: "$space-3",
    [`paddingVertical-header-${COMP}`]: "$space-3",
    [`verticalAlignment-header-${COMP}`]: "center",
    [`fontSize-header-${COMP}`]: "$fontSize-base",
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
    [`padding-content-${COMP}`]: "$space-2",
  },
});

export const AccordionItemMd = createMetadata({
  status: "in progress",
  description: `\`${ITEM_COMP}\` describes a collapsible item inside an Accordion.`,
  props: {
    header: {
      description: "This property declares the text used in the component's header.",
      valueType: "string",
    },
    id: {
      description: "This property identifies the accordion item in expanded state APIs and events.",
      valueType: "string",
    },
    headerTemplate: dComponent("This property describes the template to use as the component's header."),
    initiallyExpanded: {
      description: `This property indicates if the ${ITEM_COMP} is expanded.`,
      valueType: "boolean",
      defaultValue: accordionItemDefaultProps.initiallyExpanded,
    },
    testId: {
      description: "Adds a test identifier to the AccordionItem root.",
      valueType: "string",
    },
  },
});

export const accordionRenderer = wrapComponent({
  name: COMP,
  metadata: AccordionMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    return (
      <AccordionComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        triggerPosition={adapter.stringProp("triggerPosition", defaultProps.triggerPosition) as "start" | "end"}
        collapsedIcon={adapter.stringProp("collapsedIcon", defaultProps.collapsedIcon)}
        expandedIcon={adapter.stringProp("expandedIcon")}
        hideIcon={adapter.booleanProp("hideIcon", defaultProps.hideIcon)}
        rotateExpanded={adapter.stringProp("rotateExpanded", defaultProps.rotateExpanded)}
        onDisplayDidChange={(value) => { void adapter.event("displayDidChange")(value); }}
        registerComponentApi={adapter.registerApi}
      >
        {adapter.renderChildren()}
      </AccordionComponent>
    );
  },
});

export const accordionItemRenderer = wrapComponent({
  name: ITEM_COMP,
  metadata: AccordionItemMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const hasHeaderTemplate = adapter.node.children.some(
      (child) => child.kind === "element" &&
        child.type === "property" &&
        child.props.name === "headerTemplate",
    );
    const header = hasHeaderTemplate
      ? adapter.renderTemplate("headerTemplate")
      : adapter.prop("header", "");
    return (
      <AccordionItemComponent
        {...rootAttrs}
        style={rootAttrs.style as CSSProperties}
        id={typeof adapter.props.id === "string" ? adapter.props.id : undefined}
        header={header}
        initiallyExpanded={adapter.booleanProp("initiallyExpanded", accordionItemDefaultProps.initiallyExpanded)}
        content={adapter.context.renderChildren(nonPropertyChildren(adapter.node.children), adapter.scope)}
      />
    );
  },
});
