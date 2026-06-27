import type { CSSProperties } from "react";

import { wrapComponent } from "../../runtime/rendering/adapter";
import { extractScssThemeVars } from "../../styling/theme";
import { createMetadata, dClick, dContextMenu } from "../../component-core/metadata/helpers";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { Stack } from "./StackReact";
import stackStylesSource from "./Stack.module.scss?xmlui-theme-vars";
import { defaultProps } from "./Stack.defaults";

const COMP = "Stack";

const stackProps = {
  desktopOnly: {
    description: "Optional boolean property to hide the Stack on desktop devices.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.desktopOnly,
  },
  gap: {
    description: "Optional size value indicating the gap between child elements.",
    valueType: "string",
    defaultValue: "$gap-normal",
  },
  reverse: {
    description: "Optional boolean property to reverse the order of child elements.",
    valueType: "boolean",
    defaultValue: defaultProps.reverse,
  },
  wrapContent: {
    description: "Optional boolean which wraps horizontal Stack content when the available space is not large enough.",
    valueType: "boolean",
    defaultValue: false,
  },
  orientation: {
    description: "An optional property that governs whether the Stack lays out its children in a row or a column.",
    availableValues: ["horizontal", "vertical"],
    isStrictEnum: true,
    valueType: "string",
    defaultValue: defaultProps.orientation,
  },
  horizontalAlignment: {
    description: "Manages the horizontal content alignment for each child element in the Stack.",
    availableValues: ["start", "center", "end", "stretch"],
    valueType: "string",
    defaultValue: "start",
  },
  verticalAlignment: {
    description: "Manages the vertical content alignment for each child element in the Stack.",
    availableValues: ["start", "center", "end", "stretch", "baseline"],
    valueType: "string",
    defaultValue: "start",
  },
  hoverContainer: {
    description: "Reserved for future use.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.hoverContainer,
  },
  visibleOnHover: {
    description: "Reserved for future use.",
    valueType: "boolean",
    isInternal: true,
    defaultValue: defaultProps.visibleOnHover,
  },
  scrollStyle: {
    description: "Determines the scrollbar style.",
    valueType: "string",
    availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
    isStrictEnum: true,
    defaultValue: defaultProps.scrollStyle,
  },
  showScrollerFade: {
    description: "When enabled, displays gradient fade indicators around scrollable Stack content.",
    valueType: "boolean",
    defaultValue: defaultProps.showScrollerFade,
  },
  itemWidth: {
    description: "The default width applied to child elements in the Stack.",
    valueType: "string",
  },
  dock: {
    description: "When set on a child of a Stack, activates DockPanel-style layout in the parent Stack.",
    availableValues: ["top", "bottom", "left", "right", "stretch"],
    isStrictEnum: true,
    valueType: "string",
  },
  testId: {
    description: "This optional property adds a test identifier to the Stack root element.",
    valueType: "string",
  },
} as const;

export const StackMd = createMetadata({
  status: "stable",
  description:
    "`Stack` is the fundamental layout container that organizes child elements in configurable horizontal or vertical arrangements.",
  props: stackProps,
  events: {
    click: dClick(COMP),
    contextMenu: dContextMenu(COMP),
    mounted: {
      description: "Reserved for future use.",
      signature: "mounted(): void",
      parameters: {},
      isInternal: true,
    },
  },
  apis: {
    scrollToTop: {
      description: "Scrolls the Stack container to the top.",
      signature: "scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToBottom: {
      description: "Scrolls the Stack container to the bottom.",
      signature: "scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToStart: {
      description: "Scrolls the Stack container to the start.",
      signature: "scrollToStart(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
    scrollToEnd: {
      description: "Scrolls the Stack container to the end.",
      signature: "scrollToEnd(behavior?: 'auto' | 'instant' | 'smooth'): void",
    },
  },
  themeVars: extractScssThemeVars(stackStylesSource),
  defaultThemeVars: {
    [`gap-${COMP}`]: "$gap-layout",
  },
});

export const VStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: "This component represents a stack rendering its contents vertically.",
};

export const HStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description: "This component represents a stack rendering its contents horizontally.",
};

export const CVStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack rendering its contents vertically and aligning it in the center along both axes.",
};

export const CHStackMd = {
  ...StackMd,
  specializedFrom: COMP,
  description:
    "This component represents a stack rendering its contents horizontally and aligning it in the center along both axes.",
};

export const stackRenderer = createStackRenderer("Stack", StackMd as ComponentMetadata);
export const hStackRenderer = createStackRenderer("HStack", HStackMd as ComponentMetadata, "horizontal");
export const vStackRenderer = createStackRenderer("VStack", VStackMd as ComponentMetadata, "vertical");
export const chStackRenderer = createStackRenderer(
  "CHStack",
  CHStackMd as ComponentMetadata,
  "horizontal",
  "center",
  "center",
);
export const cvStackRenderer = createStackRenderer(
  "CVStack",
  CVStackMd as ComponentMetadata,
  "vertical",
  "center",
  "center",
);

function createStackRenderer(
  name: string,
  metadata: ComponentMetadata,
  orientation?: string,
  fixedHorizontalAlignment?: string,
  fixedVerticalAlignment?: string,
) {
  return wrapComponent({
    name,
    metadata,
    renderer: ({ adapter }) => {
      const rootAttrs = adapter.rootAttrs();
      const gap = adapter.stringProp("gap");
      const style = { ...(rootAttrs.style as CSSProperties | undefined) };
      if (orientation) {
        delete style.display;
        delete style.flexDirection;
      }
      return (
        <Stack
          {...rootAttrs}
          style={{
            ...style,
            ...(gap ? { "--xmlui-gap-Stack": gap } : undefined),
          } as CSSProperties}
          orientation={orientation ?? adapter.stringProp("orientation", defaultProps.orientation)}
          horizontalAlignment={fixedHorizontalAlignment ?? adapter.stringProp("horizontalAlignment")}
          verticalAlignment={fixedVerticalAlignment ?? adapter.stringProp("verticalAlignment")}
          reverse={adapter.booleanProp("reverse", defaultProps.reverse)}
          wrapContent={adapter.booleanProp("wrapContent", false)}
          hoverContainer={adapter.booleanProp("hoverContainer", defaultProps.hoverContainer)}
          visibleOnHover={adapter.booleanProp("visibleOnHover", defaultProps.visibleOnHover)}
          desktopOnly={adapter.booleanProp("desktopOnly", defaultProps.desktopOnly)}
          onClick={() => void adapter.event("click")()}
          onContextMenu={() => void adapter.event("contextMenu")()}
          onMount={() => void adapter.event("mounted")()}
          registerComponentApi={adapter.registerApi}
        >
          {adapter.renderChildren()}
        </Stack>
      );
    },
  });
}
