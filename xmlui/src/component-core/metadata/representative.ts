import {
  createMetadata,
  dClick,
  dContextMenu,
  dInternal,
} from "./helpers";

import { AppMd } from "../../components/App/App";
import { ButtonMd } from "../../components/Button/Button";

export { AppMd } from "../../components/App/App";
export { ButtonMd } from "../../components/Button/Button";

export const TextMd = createMetadata({
  status: "stable",
  description: "The `Text` component displays textual information in a number of optional styles and variants.",
  props: {
    value: {
      description: "The text to be displayed.",
      valueType: "string",
    },
    variant: {
      description: "An optional string value that provides named presets for text variants.",
      availableValues: ["body", "secondary", "strong", "abbr"],
      isStrictEnum: true,
      valueType: "string",
    },
    maxLines: {
      description: "This property determines the maximum number of lines the component can wrap to.",
      valueType: "number",
    },
    preserveLinebreaks: {
      description: "This property indicates if linebreaks should be preserved when displaying text.",
      valueType: "boolean",
      defaultValue: false,
    },
    ellipses: {
      description: "This property indicates whether ellipses should be displayed when the text is cropped.",
      valueType: "boolean",
      defaultValue: true,
    },
    breakMode: {
      description: "This property controls how text breaks into multiple lines.",
      valueType: "string",
      defaultValue: "normal",
      availableValues: ["normal", "word", "anywhere", "keep", "hyphenate"],
      isStrictEnum: true,
    },
    overflowMode: {
      description: "This property controls how text overflow is handled.",
      valueType: "string",
      defaultValue: "not specified",
      availableValues: ["none", "ellipsis", "scroll", "flow"],
      isStrictEnum: true,
    },
  },
  events: {
    contextMenu: dContextMenu("Text"),
  },
  apis: {
    hasOverflow: {
      description: "Returns true when the displayed text overflows its container boundaries.",
      signature: "hasOverflow(): boolean",
    },
  },
  themeVars: {
    "textColor-Text": "The Text color.",
    "fontSize-Text": "The Text font size.",
    "fontWeight-Text": "The Text font weight.",
  },
  defaultThemeVars: {
    "textColor-Text": "$textColor",
    "fontSize-Text": "$fontSize",
    "fontWeight-Text": "$fontWeight-normal",
  },
});

export const StackMd = createMetadata({
  status: "stable",
  description:
    "`Stack` is the fundamental layout container that organizes child elements in configurable horizontal or vertical arrangements.",
  props: {
    desktopOnly: {
      description: "Optional boolean property to hide the Stack on desktop devices.",
      valueType: "boolean",
      isInternal: true,
      defaultValue: false,
    },
    gap: {
      description: "Optional size value indicating the gap between child elements.",
      valueType: "string",
      defaultValue: "$gap-normal",
    },
    reverse: {
      description: "Optional boolean property to reverse the order of child elements.",
      valueType: "boolean",
      defaultValue: false,
    },
    wrapContent: {
      description: "Optional boolean which wraps the content if set to true and space is not enough.",
      valueType: "boolean",
      defaultValue: false,
    },
    orientation: {
      description: "An optional property that governs the Stack's orientation.",
      availableValues: ["horizontal", "vertical"],
      isStrictEnum: true,
      valueType: "string",
      defaultValue: "vertical",
    },
    horizontalAlignment: {
      description: "This property aligns child elements horizontally.",
      valueType: "string",
      availableValues: ["start", "center", "end", "stretch"],
    },
    verticalAlignment: {
      description: "This property aligns child elements vertically.",
      valueType: "string",
      availableValues: ["start", "center", "end", "stretch"],
    },
    hoverContainer: {
      ...dInternal("Reserved for future use"),
      defaultValue: false,
    },
    visibleOnHover: {
      ...dInternal("Reserved for future use"),
      defaultValue: false,
    },
    scrollStyle: {
      description: "This property determines the scrollbar style.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
      defaultValue: "normal",
    },
    showScrollerFade: {
      description: "When enabled, displays gradient fade indicators on the scroll container.",
      valueType: "boolean",
      defaultValue: false,
    },
    itemWidth: {
      description: "The default width applied to child elements in the Stack.",
      valueType: "string",
    },
    dock: {
      description: "When set on a child of a Stack, activates DockPanel layout in the parent Stack.",
      availableValues: ["top", "bottom", "left", "right", "stretch"],
      isStrictEnum: true,
      valueType: "string",
    },
  },
  events: {
    click: dClick("Stack"),
    contextMenu: dContextMenu("Stack"),
    mounted: {
      description: "Reserved for future use",
      signature: "mounted(): void",
      parameters: {},
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
  themeVars: {
    "gap-Stack": "The Stack child gap.",
  },
  defaultThemeVars: {
    "gap-Stack": "$gap-layout",
  },
});

export const representativeComponentMetadata = {
  App: AppMd,
  Button: ButtonMd,
  Text: TextMd,
  Stack: StackMd,
} as const;
