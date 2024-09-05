import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import styles from "./AccordionGroup.module.scss";

import { createComponentRenderer } from "@components-core/renderers";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";

// See reference implementation here: https://getbootstrap.com/docs/5.3/components/accordion/
// Use this component to draw borders around the accordion group and its nested items.

/**
 */
export interface AccordionGroupComponentDef extends ComponentDef<"AccordionGroup"> {
  props: {
  };
  events: {
  };
  api: {
  };
}

const metadata: ComponentDescriptor<AccordionGroupComponentDef> = {
  displayName: "AccordionGroup",
  description: "A container that groups accordion items",
  props: {
  },
  events: {
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    light: {
    },
    dark: {
    },
  },
};

export const accordionGroupComponentRenderer = createComponentRenderer<AccordionGroupComponentDef>(
  "AccordionGroup",
  ({ node, extractValue, lookupEventHandler, layoutCss }) => {
    return <div style={{ backgroundColor: "red", color: "white" }}>AccordionGroup component is not implemented yet</div>;
  },
  metadata,
);
