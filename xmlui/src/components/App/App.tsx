import styles from "./App.module.scss";
import drawerStyles from "./Sheet.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { createMetadata, dComponent } from "../metadata-helpers";
import { appLayoutMd } from "../App/AppLayoutContext";
import { App as AppComponent, defaultProps } from "./AppNative";
import { useRef } from "react";
import { SearchIndexCollector } from "./SearchIndexCollector";
import { extractAppComponents, extractNavPanelFromPages } from "./AppNavigation";

const COMP = "App";

export const AppMd = createMetadata({
  status: "stable",
  description:
    "The `App` component is the root container that defines your application's overall " +
    "structure and layout. It provides a complete UI framework with built-in navigation, " +
    "header, footer, and content areas that work together seamlessly.",
  excludeBehaviors: ["tooltip", "animation", "label"],
  props: {
    layout: {
      description:
        `This property sets the layout template of the app. This setting determines the position ` +
        `and size of the app parts (such as header, navigation bar, footer, etc.) and the app's ` +
        `scroll behavior.`,
      availableValues: appLayoutMd,
    },
    loggedInUser: {
      description:
        "Stores information about the currently logged-in user. By not defining this property, " +
        "you can indicate that no user is logged in.",
      valueType: "string",
    },
    logoTemplate: dComponent("Optional template of the app logo"),
    logo: {
      description: "Optional logo path",
      valueType: "string",
    },
    "logo-dark": {
      description: "Optional logo path in dark tone",
      valueType: "string",
    },
    "logo-light": {
      description: "Optional logo path in light tone",
      valueType: "string",
    },
    name: {
      description:
        "Optional application name (visible in the browser tab). When you do not define " +
        "this property, the tab name falls back to the one defined in the app\'s configuration. " +
        'If the name is not configured, "XMLUI App" is displayed in the tab.',
      valueType: "string",
    },
    scrollWholePage: {
      description:
        `This boolean property specifies whether the whole page should scroll (\`true\`) or just ` +
        `the content area (\`false\`). The default value is \`true\`.`,
      valueType: "boolean",
      defaultValue: defaultProps.scrollWholePage,
    },
    noScrollbarGutters: {
      description:
        "This boolean property specifies whether the scrollbar gutters should be hidden.",
      valueType: "boolean",
      defaultValue: defaultProps.noScrollbarGutters,
    },
    defaultTone: {
      description: 'This property sets the app\'s default tone ("light" or "dark").',
      valueType: "string",
      defaultValue: defaultProps.defaultTone,
      availableValues: ["light", "dark"],
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: defaultProps.defaultTheme,
    },
    autoDetectTone: {
      description: 
        'This boolean property enables automatic detection of the system theme preference. ' +
        'When set to true and no defaultTone is specified, the app will automatically use ' +
        '"light" or "dark" tone based on the user\'s system theme setting. The app will ' +
        'also respond to changes in the system theme preference.',
      valueType: "boolean",
      defaultValue: defaultProps.autoDetectTone,
    },
  },
  events: {
    ready: {
      description: `This event fires when the \`${COMP}\` component finishes rendering on the page.`,
      signature: "() => void",
      parameters: {},
    },
    messageReceived: {
      description: `This event fires when the \`${COMP}\` component receives a message from another window or iframe via the window.postMessage API.`,
      signature: "(data: any) => void",
      parameters: {
        data: "The data sent from the other window via postMessage.",
      },
    },
  },
  themeVars: { ...parseScssVar(styles.themeVars), ...parseScssVar(drawerStyles.themeVars) },
  limitThemeVarsToComponent: true,
  themeVarDescriptions: {
    "maxWidth-content-App":
      "This theme variable defines the maximum width of the main content. If the main " +
      "content is broader, the engine adds margins to keep the expected maximum size.",
    "boxShadow‑header‑App": "This theme variable sets the shadow of the app's header section.",
    "boxShadow‑navPanel‑App":
      "This theme variable sets the shadow of the app's navigation panel section " +
      "(visible only in vertical layouts).",
    "width‑navPanel‑App":
      "This theme variable sets the width of the navigation panel when the app is displayed " +
      "with one of the vertical layouts.",
  },
  defaultThemeVars: {
    "maxWidth-Drawer": "100%",
    [`width-navPanel-${COMP}`]: "$space-64",
    [`width-navPanel-collapsed-${COMP}`]: "48px",
    [`borderRight-navPanelWrapper-${COMP}`]: "1px solid $borderColor",
    [`backgroundColor-navPanel-${COMP}`]: "$backgroundColor",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`maxWidth-${COMP}`]: "$maxWidth-content",
    [`boxShadow-header-${COMP}`]: "none",
    [`boxShadow-navPanel-${COMP}`]: "none",
    [`scroll-padding-block-Pages`]: "$space-4",
    [`backgroundColor-content-App`]: "$backgroundColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});


function AppNode({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) {
  // --- Use ref to track if we've already processed the navigation to avoid duplicates in strict mode
  const processedNavRef = useRef(false);

  // --- Extract app components
  const extracted = extractAppComponents(node.children);
  const { AppHeader, Footer, Pages, restChildren } = extracted;
  
  // --- Enhance NavPanel with page navigation inline
  const { NavPanel: originalNavPanel } = extracted;
  
  let NavPanel = originalNavPanel;
  
  if (Pages && !processedNavRef.current) {
    processedNavRef.current = true;
    
    const extraNavs = extractNavPanelFromPages(Pages, originalNavPanel, extractValue);
    
    if (extraNavs?.length) {
      if (originalNavPanel) {
        NavPanel = {
          ...originalNavPanel,
          children: originalNavPanel.children ? [...originalNavPanel.children, ...extraNavs] : extraNavs,
        };
      } else {
        NavPanel = {
          type: "NavPanel",
          props: {},
          children: extraNavs,
        };
      }
    }
  }

  const applyDefaultContentPadding = !Pages;
  const footerSticky = Footer?.props?.sticky !== undefined 
    ? extractValue.asOptionalBoolean(Footer.props.sticky, true)
    : true;
  const scrollWholePage = extractValue.asOptionalBoolean(node.props.scrollWholePage, true);
  
  // When scrollWholePage is false, pageContentContainer is a vertical flex container
  // Pass layout context so children can properly resolve star sizing
  const contentLayoutContext = !scrollWholePage ? { type: "Stack" as const, orientation: "vertical" as const } : undefined;

  return (
    <AppComponent
      scrollWholePage={scrollWholePage}
      noScrollbarGutters={extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false)}
      className={className}
      layout={extractValue(node.props.layout)}
      loggedInUser={extractValue(node.props.loggedInUser)}
      onReady={lookupEventHandler("ready")}
      onMessageReceived={lookupEventHandler("messageReceived")}
      name={extractValue(node.props.name)}
      logo={extractValue(node.props.logo)}
      logoDark={extractValue(node.props["logo-dark"])}
      logoLight={extractValue(node.props["logo-light"])}
      defaultTone={extractValue(node.props.defaultTone)}
      defaultTheme={extractValue(node.props.defaultTheme)}
      autoDetectTone={extractValue.asOptionalBoolean(node.props.autoDetectTone, false)}
      applyDefaultContentPadding={applyDefaultContentPadding}
      header={renderChild(AppHeader)}
      footer={renderChild(Footer)}
      footerSticky={footerSticky}
      navPanel={renderChild(NavPanel)}
      navPanelDef={NavPanel}
      logoContentDef={node.props.logoTemplate}
      renderChild={renderChild}
      registerComponentApi={registerComponentApi}
    >
      {renderChild(restChildren, contentLayoutContext)}
      <SearchIndexCollector Pages={Pages} renderChild={renderChild} />
    </AppComponent>
  );
}

export const appRenderer = createComponentRenderer(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, className, lookupEventHandler, registerComponentApi }) => {
    return (
      <AppNode
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        className={className}
        lookupEventHandler={lookupEventHandler}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
