import {
  createMetadata,
  dAutoFocus,
  dClick,
  dComponent,
  dContextMenu,
  dEnabled,
  dGotFocus,
  dInternal,
  dLostFocus,
} from "./helpers";

export const AppMd = createMetadata({
  status: "stable",
  description:
    "The `App` component is the root container that defines your application's overall structure and layout.",
  excludeBehaviors: ["tooltip", "animation", "label"],
  optimization: {
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
  },
  props: {
    layout: {
      description: "This property sets the layout template of the app.",
      valueType: "string",
      availableValues: ["horizontal", "vertical", "vertical-sticky"],
    },
    loggedInUser: {
      description: "Stores information about the currently logged-in user.",
      valueType: "string",
    },
    logoTemplate: dComponent("Optional template of the app logo"),
    logo: {
      description: "Optional logo path",
      valueType: "string",
    },
    name: {
      description: "Optional application name.",
      valueType: "string",
    },
    scrollWholePage: {
      description: "This boolean property specifies whether the whole page should scroll.",
      valueType: "boolean",
      defaultValue: true,
    },
    defaultTone: {
      description: "This property sets the app's default tone.",
      valueType: "string",
      availableValues: ["light", "dark"],
      isStrictEnum: true,
      defaultValue: "light",
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: "xmlui",
    },
    useHashBasedRouting: {
      description: "Use hash-based routing instead of browser history routing.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    ready: {
      description: "This event fires when the `App` component finishes rendering on the page.",
      signature: "ready(): void",
      parameters: {},
    },
    messageReceived: {
      description: "This event fires when the `App` component receives a window message.",
      signature: "messageReceived(data: any): void",
      parameters: {
        data: "The data sent from the other window via postMessage.",
      },
    },
    keyDown: {
      description: "This event fires when a key is pressed at the app level.",
      signature: "keyDown(event: KeyboardEvent): void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
    keyUp: {
      description: "This event fires when a key is released at the app level.",
      signature: "keyUp(event: KeyboardEvent): void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
  },
  contextVars: {
    $pathname: {
      description: "The current app route pathname.",
      valueType: "string",
    },
    $routeParams: {
      description: "The current route parameters.",
      valueType: "any",
    },
    $queryParams: {
      description: "The current query parameters.",
      valueType: "any",
    },
  },
  themeVars: {
    "backgroundColor-App": "The app background color.",
    "gap-App": "The gap between app layout regions.",
  },
  defaultThemeVars: {
    "backgroundColor-App": "$backgroundColor",
    "gap-App": "$gap-layout",
  },
});

export const ButtonMd = createMetadata({
  status: "stable",
  description:
    "`Button` is the primary interactive component for triggering actions like form submissions, navigation, opening modals, and API calls.",
  parts: {
    icon: {
      description: "The icon displayed within the button, if any.",
    },
  },
  props: {
    autoFocus: dAutoFocus(),
    variant: {
      description: "The button variant determines the level of emphasis the button should possess.",
      valueType: "string",
      availableValues: ["solid", "outlined", "ghost"],
      defaultValue: "solid",
    },
    themeColor: {
      description: "Sets the button color scheme defined in the application theme.",
      valueType: "string",
      availableValues: ["primary", "secondary", "attention"],
      defaultValue: "primary",
    },
    size: {
      description: "Sets the size of the button.",
      valueType: "string",
      availableValues: ["xs", "sm", "md", "lg"],
      defaultValue: "md",
    },
    label: {
      description: "This property is an optional string to set a label for the Button.",
      valueType: "string",
    },
    type: {
      description: "This optional string describes how the Button appears in an HTML context.",
      valueType: "string",
      availableValues: ["button", "submit", "reset"],
      defaultValue: "button",
    },
    enabled: dEnabled(),
    orientation: {
      description: "This optional string determines the Button content orientation.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: "horizontal",
    },
    icon: {
      description: "This string value denotes an icon name.",
      valueType: "string",
    },
    iconPosition: {
      description: "This optional string determines the location of the icon in the Button.",
      valueType: "string",
      availableValues: ["start", "end"],
      defaultValue: "start",
    },
    contentPosition: {
      description: "This optional value determines how the label and icon should be placed inside the Button component.",
      valueType: "string",
      availableValues: ["start", "center", "end"],
      defaultValue: "center",
    },
    contextualLabel: {
      description: "This optional value is used to provide an accessible name for the Button.",
      valueType: "string",
    },
    busyOnClick: {
      description: "When `true`, the Button auto-disables itself while its `onClick` handler is running.",
      valueType: "boolean",
      defaultValue: false,
    },
  },
  events: {
    click: dClick("Button"),
    contextMenu: dContextMenu("Button"),
    gotFocus: dGotFocus("Button"),
    lostFocus: dLostFocus("Button"),
  },
  themeVars: {
    "padding-Button": "The Button padding.",
    "gap-Button": "The gap between Button icon and label.",
    "backgroundColor-Button": "The Button background color.",
  },
  defaultThemeVars: {
    "padding-Button": "$space-2 $space-4",
    "gap-Button": "$space-2",
    "backgroundColor-Button": "transparent",
  },
});

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
