import { createMetadata, dComponent } from "../../component-core/metadata/helpers";

const COMP = "NavPanel";

export const defaultNavPanelProps = {
  inDrawer: false,
  scrollStyle: "normal",
  showScrollerFade: true,
  syncWithContent: false,
  syncScrollBehavior: "smooth",
  syncScrollPosition: "center",
};

export const NavPanelMd = createMetadata({
  status: "in progress",
  description:
    "`NavPanel` defines the navigation structure within an App and contains NavLink and NavGroup components.",
  parts: {
    logo: {
      description: "The logo area within the NavPanel component.",
    },
    content: {
      description: "The scrollable content area within the NavPanel component.",
    },
    footer: {
      description: "Optional footer area at the bottom of the NavPanel.",
    },
  },
  props: {
    logoTemplate: dComponent("Template displayed in the NavPanel logo area."),
    footerTemplate: dComponent("Template displayed in the NavPanel footer area."),
    inDrawer: {
      description: "Indicates whether the navigation panel is displayed in a drawer.",
      valueType: "boolean",
      defaultValue: defaultNavPanelProps.inDrawer,
    },
    scrollStyle: {
      description: "Determines the scrollbar style.",
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultNavPanelProps.scrollStyle,
    },
    showScrollerFade: {
      description: "Displays gradient fade indicators for scrollable content.",
      valueType: "boolean",
      defaultValue: defaultNavPanelProps.showScrollerFade,
    },
    syncWithContent: {
      description: "Scrolls the active navigation item into view after navigation.",
      valueType: "boolean",
      defaultValue: defaultNavPanelProps.syncWithContent,
    },
    syncScrollBehavior: {
      description: "Controls scroll animation when syncWithContent is enabled.",
      valueType: "string",
      availableValues: ["smooth", "instant"],
      defaultValue: defaultNavPanelProps.syncScrollBehavior,
    },
    syncScrollPosition: {
      description: "Controls active item alignment when syncWithContent scrolls it into view.",
      valueType: "string",
      availableValues: ["center", "nearest", "start", "end"],
      defaultValue: defaultNavPanelProps.syncScrollPosition,
    },
  },
  themeVars: {
    [`backgroundColor-${COMP}`]: "NavPanel background.",
    [`borderColor-${COMP}`]: "NavPanel border color.",
    [`borderWidth-${COMP}`]: "NavPanel border width.",
    [`borderStyle-${COMP}`]: "NavPanel border style.",
    [`paddingVertical-${COMP}`]: "NavPanel vertical padding.",
    [`paddingHorizontal-${COMP}`]: "NavPanel horizontal padding.",
    [`paddingVertical-logo-${COMP}`]: "NavPanel logo vertical padding.",
    [`paddingHorizontal-logo-${COMP}`]: "NavPanel logo horizontal padding.",
    [`marginBottom-logo-${COMP}`]: "Margin below the logo area.",
    [`paddingVertical-footer-${COMP}`]: "Footer vertical padding.",
    [`paddingHorizontal-footer-${COMP}`]: "Footer horizontal padding.",
    [`borderColor-footer-${COMP}`]: "Footer top border color.",
    [`boxShadow-${COMP}`]: "NavPanel box shadow.",
  },
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`borderColor-${COMP}`]: "$borderColor",
    [`borderWidth-${COMP}`]: "0px",
    [`borderStyle-${COMP}`]: "solid",
    [`paddingVertical-${COMP}`]: "$space-5",
    [`paddingHorizontal-${COMP}`]: "0",
    [`paddingVertical-logo-${COMP}`]: "$space-4",
    [`paddingHorizontal-logo-${COMP}`]: "$space-4",
    [`marginBottom-logo-${COMP}`]: "$space-4",
    [`paddingVertical-footer-${COMP}`]: "$space-2",
    [`paddingHorizontal-footer-${COMP}`]: "$space-4",
    [`borderColor-footer-${COMP}`]: "$borderColor",
    [`boxShadow-${COMP}`]: "none",
  },
});
