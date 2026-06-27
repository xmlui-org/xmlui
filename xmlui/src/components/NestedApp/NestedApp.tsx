import { createMetadata } from "../../component-core/metadata/helpers";

export const defaultProps = {
  components: [],
};

export const NestedAppMd = createMetadata({
  status: "stable",
  description: "The `NestedApp` component nests an entire XMLUI app inside another one.",
  props: {
    app: {
      description: "The source markup of the app to be nested.",
      valueType: "string",
    },
    api: {
      description: "Optional emulated API to be used with the nested app.",
      valueType: "hash",
    },
    components: {
      description: "Optional list of components to be used with the nested app.",
      defaultValue: defaultProps.components,
    },
    refreshVersion: {
      description: "Forces the nested app to remount when the value changes.",
    },
    config: {
      description: "Optional configuration for the nested app.",
      valueType: "hash",
    },
    activeTheme: {
      description: "The active theme for the nested app.",
      valueType: "string",
    },
    activeTone: {
      description: "The active tone for the nested app.",
      valueType: "string",
    },
    title: {
      description: "Optional title displayed when the nested app frame is enabled.",
      valueType: "string",
    },
    withFrame: {
      description: "Displays a lightweight frame around the nested app.",
      valueType: "boolean",
      defaultValue: false,
    },
    allowReset: {
      description: "Displays a reset control when the nested app frame is enabled.",
      valueType: "boolean",
      defaultValue: false,
    },
    splitView: {
      description: "Displays app/code view controls when the nested app frame is enabled.",
      valueType: "boolean",
      defaultValue: false,
    },
    initiallyShowCode: {
      description: "Shows the nested app source first when split view controls are enabled.",
      valueType: "boolean",
      defaultValue: false,
    },
    noHeader: {
      description: "Hides the nested app frame header.",
      valueType: "boolean",
      defaultValue: false,
    },
    height: {
      description: "The height of the nested app.",
      valueType: "length",
    },
    testId: {
      description: "Adds a test identifier to the nested app container.",
      valueType: "string",
    },
  },
  themeVars: {},
  defaultThemeVars: {
    "marginTop-NestedApp": "$space-6",
    "marginBottom-NestedApp": "$space-6",
    "padding-NestedApp": "0",
    "paddingTop-NestedApp": "0",
    "border-NestedApp": "0.5px solid $borderColor",
    "borderRadius-NestedApp": "$space-2",
    "backgroundColor-frame-NestedApp": "$color-surface-100",
    "gap-frame-NestedApp": "0",
    "fontWeight-header-NestedApp": "$fontWeight-bold",
    "boxShadow-NestedApp": "0px 0px 32px 0px rgba(0, 0, 0, 0.05)",
    "backgroundColor-viewControls-NestedApp": "$color-secondary-100",
    "borderRadius-viewControls-NestedApp": "5px",
    "border-viewControls-NestedApp": "0.5px solid $borderColor",
    "padding-viewControls-NestedApp": "$space-0_5",
    "borderBottom-header-NestedApp": "0.5px solid $borderColor",
    "backgroundColor-header-NestedApp": "$color-surface-100",
    "color-loadingText-NestedApp": "$color-surface-600",
    "padding-button-splitView-NestedApp": "1px 6px",
    "width-button-splitView-NestedApp": "60px",
    "height-button-splitView-NestedApp": "19px",
    "width-logo-splitView-NestedApp": "1.5rem",
    "height-logo-splitView-NestedApp": "2rem",
    "backgroundColor-button-splitView-NestedApp--active": "$color-surface-0",
    "color-button-splitView-NestedApp": "$color-surface-600",
    "color-button-splitView-NestedApp--active": "$color-primary",
    "width-controls-NestedApp": "80px",
    "backgroundColor-code-splitView-NestedApp": "$color-surface-0",
    "borderRadius-button-splitView-NestedApp": "$space-1",
    "borderColor-button-splitView-NestedApp": "transparent",
  },
});
