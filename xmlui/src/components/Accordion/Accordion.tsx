import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import styles from "./Accordion.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/accordion/
// Make the header focusable, handle ARIA attributes, and manage the state of the accordion.

/**
 * The \`Accordion\` component is a collapsible container that toggles the display of content sections. It helps
 * organize information by expanding or collapsing it based on user interaction.
 */
export interface AccordionComponentDef extends ComponentDef<"Accordion"> {
  props: {
    /**
     * Declares the text used in the component's header.
     * @descriptionRef
     */
    header?: string;
    /**
     * This property describes the template to use as the component's header.
     * @descriptionRef
     */
    headerTemplate?: ComponentDef;
    /**
     * This property indicates if the accordion is expanded (\`true\`) or collapsed (\`false\`). By default,
     * this value is \`false\`.
     * @descriptionRef
     */
    initiallyExpanded?: boolean;
    /**
     * This property indicates the position where the trigger icon should be displayed. The \`start\` value
     * signs the trigger is before the header text (template), and \`end\` indicates that it follows the header.
     * @descriptionRef
     */
    triggerPosition?: "start" | "end";
    /**
     * This property is the name of the icon that is displayed when the accordion is collapsed.
     * @descriptionRef
     */
    collapsedIcon?: string;
    /**
     * This property is the name of the icon that is displayed when the accordion is expanded.
     * @descriptionRef
     */
    expandedIcon?: string;
    /**
     * This property indicates that the trigger icon is not displayed (\`true\`). By default, its value
     * is \`false\`.
     * @descriptionRef
     */
    hideIcon?: boolean;
    /**
     * This property indicates the position of the accordion in a group of accordions. The possible values are:
     * @descriptionRef
     * @defaultValue "single"
     */
    positionInGroup?: "single" | "first" | "middle" | "last";
  };
  events: {
    /**
     * This event is triggered when the state of the accordion changes from collapsed to expanded or vice versa.
     * The event has a single Boolean argument, which is \`true\`, if the new state of the accordion is expanded.
     * @descriptionRef
     */
    displayDidChange?: (expanded: boolean) => void;
  };
  api: {
    /**
     * This property indicates if the accordion is expanded (\`true\`) or collapsed (\`false\`).
     * @descriptionRef
     */
    expanded: boolean;
    /**
     * This method expands the accordion.
     * @descriptionRef
     */
    expand: () => void;
    /**
     * This method collapses the accordion.
     * @descriptionRef
     */
    collapse: () => void;
    /**
     * This method toggles the accordion's state between expanded and collapsed.
     * @descriptionRef
     */
    toggle: () => void;
    /**
     * This method sets the focus on the accordion.
     * @descriptionRef
     */
    focus: () => void;
  };
}

const metadata: ComponentDescriptor<AccordionComponentDef> = {
  displayName: "Accordion",
  description: "A collapsible container that toggles the display of content sections.",
  props: {
    header: desc("Text used in the component's header"),
    headerTemplate: desc("Template to use as the component's header"),
    initiallyExpanded: desc("Indicates if the accordion is expanded or collapsed"),
    triggerPosition: desc("Position where the trigger icon should be displayed"),
    collapsedIcon: desc("Name of the icon displayed when the accordion is collapsed"),
    expandedIcon: desc("Name of the icon displayed when the accordion is expanded"),
    hideIcon: desc("Indicates that the trigger icon is not displayed"),
    positionInGroup: desc("Position of the accordion in a group of accordions"),
  },
  events: {
    displayDidChange: desc("Triggered when the state of the accordion changes"),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-horizontal-Accordion": "",
    "padding-vertical-Accordion": "",
    "align-header-Accordion": "",
    "font-size-header-Accordion": "",
    "font-weight-header-Accordion": "",
    "font-style-header-Accordion": "",
    "border-radius-Accordion": "",
    "thickness-border-Accordion": "",
    "style-border-Accordion": "",
    "width-icon-Accordion": "",
    "height-icon-Accordion": "",
    light: {
      "color-bg-header-Accordion": "",
      "color-header-Accordion": "",
      "color-border-Accordion": "",
      "color-icon-Accordion": "",
    },
    dark: {
      "color-bg-header-Accordion": "",
      "color-header-Accordion": "",
      "color-border-Accordion": "",
      "color-icon-Accordion": "",
    },
  },
};

export const accordionComponentRenderer = createComponentRenderer<AccordionComponentDef>(
  "Accordion",
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <div style={{ backgroundColor: "red", color: "white" }}>Accordion component is not implemented yet</div>;
  },
  metadata,
);
