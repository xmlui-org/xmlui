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
    fitContent: {
      description:
        `When \`true\`, the app sizes itself to its content's natural height rather than ` +
        `filling its container's viewport. Intended for embedding an app inside an iframe ` +
        `or as a block within a larger page: the host page becomes the sole scroll container. ` +
        `This overrides \`scrollWholePage\`'s viewport pinning.`,
      valueType: "boolean",
      defaultValue: defaultProps.fitContent,
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
    persistTheme: {
      description:
        'When set to `true`, both the current theme ID and tone ("light" or "dark") are ' +
        'automatically saved to `localStorage` and restored on the next visit. The persisted ' +
        'values take precedence over `defaultTheme`, `defaultTone`, and `autoDetectTone`.',
      valueType: "boolean",
      defaultValue: defaultProps.persistTheme,
      isInternal: true,
    },
    themeStorageKey: {
      description:
        'The `localStorage` key used to persist the theme ID when `persistTheme` is `true`. ' +
        'Change this if you need to namespace the key per-app or per-user.',
      valueType: "string",
      defaultValue: defaultProps.themeStorageKey,
      isInternal: true,
    },
    toneStorageKey: {
      description:
        'The `localStorage` key used to persist the tone when `persistTheme` is `true`. ' +
        'Change this if you need to namespace the key per-app or per-user.',
      valueType: "string",
      defaultValue: defaultProps.toneStorageKey,
      isInternal: true,
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
    keyDown: {
      description:
        `This event fires when a key is pressed while the \`${COMP}\` has focus or when the ` +
        `event reaches the app level without being consumed by a child component.`,
      signature: "(event: KeyboardEvent) => void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
    keyUp: {
      description:
        `This event fires when a key is released while the \`${COMP}\` has focus or when the ` +
        `event reaches the app level without being consumed by a child component.`,
      signature: "(event: KeyboardEvent) => void",
      parameters: {
        event: "The keyboard event object.",
      },
    },
    willNavigate: {
      description:
        `This event fires before the app is about to navigate programmatically via \`navigate()\` or \`Actions.navigate()\`. ` +
        `The event handler receives the target path and optional query parameters. Returning \`false\` cancels the navigation; ` +
        `returning \`null\`, \`undefined\`, or any other value proceeds with normal navigation. ` +
        `Note: This event does NOT fire for Link clicks or browser back/forward navigation due to React Router limitations ` +
        `(event handlers are async, but router blocking is synchronous).`,
      signature: "(to: string | number, queryParams?: Record<string, any>) => Promise<false | void | null | undefined>",
      parameters: {
        to: "The target path or history delta (e.g., -1 for back) to navigate to.",
        queryParams: "Optional query parameters to include in the navigation.",
      },
    },
    didNavigate: {
      description:
        `This event fires after the app has completed any navigation (including Link clicks, browser back/forward, ` +
        `and programmatic navigation).`,
      signature: "(to: string | number, queryParams?: Record<string, any>) => Promise<void>",
      parameters: {
        to: "The path that was navigated to.",
        queryParams: "Query parameters (only available for programmatic navigation).",
      },
    },
  },
  themeVars: { ...parseScssVar(styles.themeVars), ...parseScssVar(drawerStyles.themeVars) },
  limitThemeVarsToComponent: true,
  themeVarContributorComponents: ["Footer", "Pages"],
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
    [`maxWidth-drawer-${COMP}`]: "100%",
    [`top-closeButton-${COMP}`]: "$space-2",
    [`right-closeButton-${COMP}`]: "$space-2",
    [`width-navPanel-${COMP}`]: "$space-64",
    [`width-navPanel-collapsed-${COMP}`]: "48px",
    [`borderRight-navPanelWrapper-${COMP}`]: "1px solid $borderColor",
    [`backgroundColor-navPanel-${COMP}`]: "$backgroundColor",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`maxWidth-${COMP}`]: "$maxWidth-content",
    [`boxShadow-header-${COMP}`]: "none",
    [`boxShadow-navPanel-${COMP}`]: "none",
    [`scroll-padding-block-Pages`]: "$space-4",
    [`backgroundColor-content-${COMP}`]: "$backgroundColor",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});


function AppNode({ node, extractValue, renderChild, classes, lookupEventHandler, registerComponentApi }) {
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

  // Determine if default content padding should be applied
  // Only apply if Pages is not present AND padding/paddingTop is not explicitly set
  const hasExplicitPadding = node.props.padding !== undefined
  const applyDefaultContentPadding = !Pages && !hasExplicitPadding;
  const footerSticky = Footer?.props?.sticky !== undefined
    ? extractValue.asOptionalBoolean(Footer.props.sticky, true)
    : true;
  const scrollWholePage = extractValue.asOptionalBoolean(node.props.scrollWholePage, true);
  const fitContent = extractValue.asOptionalBoolean(node.props.fitContent, false);

  // When scrollWholePage is false, pageContentContainer is a vertical flex container
  // Pass layout context so children can properly resolve star sizing
  const contentLayoutContext = !scrollWholePage ? { type: "Stack" as const, orientation: "vertical" as const } : undefined;

  return (
    <AppComponent
      scrollWholePage={scrollWholePage}
      fitContent={fitContent}
      noScrollbarGutters={extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false)}
      classes={classes}
      layout={extractValue(node.props.layout)}
      loggedInUser={extractValue(node.props.loggedInUser)}
      onReady={lookupEventHandler("ready")}
      onMessageReceived={lookupEventHandler("messageReceived")}
      onKeyDown={lookupEventHandler("keyDown")}
      onKeyUp={lookupEventHandler("keyUp")}
      onWillNavigate={lookupEventHandler("willNavigate")}
      onDidNavigate={lookupEventHandler("didNavigate")}
      name={extractValue(node.props.name)}
      logo={extractValue(node.props.logo)}
      logoDark={extractValue(node.props["logo-dark"])}
      logoLight={extractValue(node.props["logo-light"])}
      defaultTone={extractValue(node.props.defaultTone)}
      defaultTheme={extractValue(node.props.defaultTheme)}
      autoDetectTone={extractValue.asOptionalBoolean(node.props.autoDetectTone, false)}
      persistTheme={extractValue.asOptionalBoolean(node.props.persistTheme, false)}
      themeStorageKey={extractValue(node.props.themeStorageKey) ?? defaultProps.themeStorageKey}
      toneStorageKey={extractValue(node.props.toneStorageKey) ?? defaultProps.toneStorageKey}

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
      <SearchIndexCollector Pages={Pages} NavPanel={NavPanel} renderChild={renderChild} />
    </AppComponent>
  );
}

export const appRenderer = createComponentRenderer(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, classes, lookupEventHandler, registerComponentApi }) => {
    return (
      <AppNode
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        classes={classes}
        lookupEventHandler={lookupEventHandler}
        registerComponentApi={registerComponentApi}
      />
    );
  },
);
