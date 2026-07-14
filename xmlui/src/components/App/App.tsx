import styles from "./App.module.scss";
import drawerStyles from "./Sheet.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { createMetadata, dComponent } from "../metadata-helpers";
import { appLayoutMd, type AppLayoutType } from "../App/AppLayoutContext";
import { defaultProps } from "./App.defaults";
import { App as AppComponent } from "./AppReact";
import { useRef } from "react";
import { SearchIndexCollector } from "./SearchIndexCollector";
import { extractAppComponents, extractNavPanelFromPages } from "./AppNavigation";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import type { RendererContext } from "../../abstractions/RendererDefs";

const COMP = "App";

export const AppMd = createMetadata({
  status: "stable",
  description:
    "The `App` component is the root container that defines your application's overall " +
    "structure and layout. It provides a complete UI framework with built-in navigation, " +
    "header, footer, and content areas that work together seamlessly.",
  excludeBehaviors: ["tooltip", "animation", "label"],
  optimization: {
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
  },
  props: {
    layout: {
      description:
        `This property sets the layout template of the app. This setting determines the position ` +
        `and size of the app parts (such as header, navigation bar, footer, etc.) and the app's ` +
        `scroll behavior.`,
      valueType: "string",
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
      isStrictEnum: true,
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: defaultProps.defaultTheme,
    },
    autoDetectTone: {
      description:
        "This boolean property enables automatic detection of the system theme preference. " +
        "When set to true and no defaultTone is specified, the app will automatically use " +
        '"light" or "dark" tone based on the user\'s system theme setting. The app will ' +
        "also respond to changes in the system theme preference.",
      valueType: "boolean",
      defaultValue: defaultProps.autoDetectTone,
    },
    persistTheme: {
      description:
        'When set to `true`, both the current theme ID and tone ("light" or "dark") are ' +
      "automatically saved to `localStorage` and restored on the next visit. The persisted " +
      "values take precedence over `defaultTheme`, `defaultTone`, and `autoDetectTone`.",
      valueType: "boolean",
      defaultValue: defaultProps.persistTheme,
    },
    themeStorageKey: {
      description:
        "The `localStorage` key used to persist the theme ID when `persistTheme` is `true`. " +
      "Change this if you need to namespace the key per-app or per-user.",
      valueType: "string",
      defaultValue: defaultProps.themeStorageKey,
    },
    toneStorageKey: {
      description:
        "The `localStorage` key used to persist the tone when `persistTheme` is `true`. " +
      "Change this if you need to namespace the key per-app or per-user.",
      valueType: "string",
      defaultValue: defaultProps.toneStorageKey,
    },
    locale: {
      description:
        "BCP-47 locale override for the app. Use this to set the active locale from markup; " +
        "user-driven locale changes through `App.setLocale()` can still update the active locale at runtime.",
      valueType: "string",
    },
    localeBundles: {
      description:
        "Locale bundles registered by the app. Accepts bundle URLs, inline bundles, " +
        "or a locale-to-messages map used by `App.translate()` and the `I18n` component.",
      valueType: "any",
    },
    direction: {
      description:
        "Text direction for the app. Use `auto` to derive left-to-right or right-to-left " +
        "direction from the active locale.",
      valueType: "string",
      availableValues: ["ltr", "rtl", "auto"],
      isStrictEnum: true,
      defaultValue: "auto",
    },
    scheduler: {
      description: "Handler scheduler mode.",
      valueType: "string",
      availableValues: ["concurrent", "fifo"],
      isStrictEnum: true,
      defaultValue: "concurrent",
      isInternal: true,
    },
    maxQueuedPerTrace: {
      description: "Maximum number of queued handlers allowed per scheduler trace.",
      valueType: "integer",
      defaultValue: 64,
      isInternal: true,
    },
    urlCase: {
      description: "URL canonicalisation case policy.",
      valueType: "string",
      availableValues: ["preserve", "lower"],
      isStrictEnum: true,
      defaultValue: "preserve",
      isInternal: true,
    },
    urlTrailingSlash: {
      description: "URL canonicalisation trailing-slash policy.",
      valueType: "string",
      availableValues: ["preserve", "always", "never"],
      isStrictEnum: true,
      defaultValue: "preserve",
      isInternal: true,
    },
    urlQueryParamOrder: {
      description: "URL canonicalisation query-parameter ordering policy.",
      valueType: "string",
      availableValues: ["preserve", "alphabetical"],
      isStrictEnum: true,
      defaultValue: "preserve",
      isInternal: true,
    },
    nonCanonicalUrl: {
      description: "Action taken when the current URL is not canonical.",
      valueType: "string",
      availableValues: ["warn", "rewrite", "redirect"],
      isStrictEnum: true,
      defaultValue: "warn",
      isInternal: true,
    },
    auditPolicy: {
      description:
        "Plan #15: declarative audit-pipeline policy. An object literal with " +
        "`redact: RedactionRule[]`, `sample: { head?, tail? }`, `retention: { bufferSize, onOverflow }`, " +
        "and optional `sink: { kind: 'otlp' | 'console' | 'custom', endpoint?, headers? }`. " +
        "See `dev-docs/plans/15-audit-grade-observability.md`.",
      valueType: "any",
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
      signature:
        "(to: string | number, queryParams?: Record<string, any>) => Promise<false | void | null | undefined>",
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
    error: {
      description:
        `This event fires whenever the framework signals an unhandled error (loader failure, ` +
        `handler exception, or render-time throw). The handler receives the structured ` +
        `\`AppError\` and an event-like object whose \`preventDefault()\` suppresses the ` +
        `default toast. By default the toast is shown first; the handler can also return ` +
        `\`false\` to suppress the toast. Use this hook for centralised telemetry or custom ` +
        `error UI.`,
      signature:
        "(error: AppError, event: { preventDefault(): void; defaultPrevented: boolean }) => void | boolean | Promise<void | boolean>",
      parameters: {
        error: "The structured `AppError` (code, category, retryable, correlationId, data).",
        event: "Cancellable event payload. Call `event.preventDefault()` to suppress the toast.",
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
    [`paddingHorizontal-content-${COMP}`]: "$space-4",
    [`paddingVertical-content-${COMP}`]: "$space-5",
    [`gap-content-${COMP}`]: "$space-5",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});

type AppNodeProps = Pick<
  RendererContext,
  | "node"
  | "extractValue"
  | "renderChild"
  | "classes"
  | "lookupEventHandler"
  | "registerComponentApi"
>;

function AppNode({
  node,
  extractValue,
  renderChild,
  classes,
  lookupEventHandler,
  registerComponentApi,
}: AppNodeProps) {
  // --- Use ref to track if we've already processed the navigation to avoid duplicates in strict mode
  const processedNavRef = useRef(false);

  // --- Extract app components
  const extracted = extractAppComponents(node.children);
  const { AppHeader, Footer, Pages, restChildren } = extracted;

  // --- Enhance NavPanel with page navigation inline
  const { NavPanel: originalNavPanel } = extracted;

  let NavPanel = originalNavPanel;
  const props = node.props ?? {};

  if (Pages && !processedNavRef.current) {
    processedNavRef.current = true;

    const extraNavs = extractNavPanelFromPages(Pages, originalNavPanel, extractValue);

    if (extraNavs?.length) {
      if (originalNavPanel) {
        NavPanel = {
          ...originalNavPanel,
          children: originalNavPanel.children
            ? [...originalNavPanel.children, ...extraNavs]
            : extraNavs,
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
  const hasExplicitPadding = props.padding !== undefined;
  const applyDefaultContentPadding = !Pages && !hasExplicitPadding;
  const footerSticky =
    Footer?.props?.sticky !== undefined
      ? extractValue.asOptionalBoolean(Footer.props.sticky, true)
      : true;
  const logoContentDef = props.logoTemplate;
  const scrollWholePage = extractValue.asOptionalBoolean(props.scrollWholePage, true) ?? true;
  const fitContent = extractValue.asOptionalBoolean(props.fitContent, false) ?? false;

  // When scrollWholePage is false, pageContentContainer is a vertical flex container
  // Pass layout context so children can properly resolve star sizing
  const contentLayoutContext = !scrollWholePage
    ? { type: "Stack" as const, orientation: "vertical" as const }
    : undefined;

  return (
    <AppComponent
      scrollWholePage={scrollWholePage}
      fitContent={fitContent}
      noScrollbarGutters={extractValue.asOptionalBoolean(props.noScrollbarGutters, false) ?? false}
      classes={classes}
      layout={extractValue(props.layout) as AppLayoutType}
      loggedInUser={extractValue(props.loggedInUser)}
      onReady={lookupEventHandler("ready")}
      onMessageReceived={lookupEventHandler("messageReceived")}
      onKeyDown={lookupEventHandler("keyDown")}
      onKeyUp={lookupEventHandler("keyUp")}
      onWillNavigate={lookupEventHandler("willNavigate")}
      onDidNavigate={lookupEventHandler("didNavigate")}
      onError={lookupEventHandler("error")}
      name={extractValue(props.name)}
      logo={extractValue(props.logo)}
      logoDark={extractValue(props["logo-dark"])}
      logoLight={extractValue(props["logo-light"])}
      defaultTone={extractValue(props.defaultTone)}
      defaultTheme={extractValue(props.defaultTheme)}
      autoDetectTone={extractValue.asOptionalBoolean(props.autoDetectTone, false)}
      persistTheme={extractValue.asOptionalBoolean(props.persistTheme, false)}
      themeStorageKey={extractValue(props.themeStorageKey) ?? defaultProps.themeStorageKey}
      toneStorageKey={extractValue(props.toneStorageKey) ?? defaultProps.toneStorageKey}
      locale={extractValue(props.locale)}
      localeBundles={extractValue(props.localeBundles)}
      auditPolicy={extractValue(props.auditPolicy)}
      direction={
        (extractValue.asOptionalString(props.direction, "auto") ?? "auto") as
          | "ltr"
          | "rtl"
          | "auto"
      }
      scheduler={
        (extractValue.asOptionalString(props.scheduler, "concurrent") ?? "concurrent") as
          | "concurrent"
          | "fifo"
      }
      maxQueuedPerTrace={extractValue.asOptionalNumber(props.maxQueuedPerTrace, 64)}
      applyDefaultContentPadding={applyDefaultContentPadding}
      header={renderChild(AppHeader, {})}
      footer={renderChild(Footer, {})}
      footerSticky={footerSticky}
      navPanel={renderChild(NavPanel, {})}
      navPanelDef={NavPanel}
      logoContentDef={logoContentDef}
      renderChild={renderChild}
      registerComponentApi={registerComponentApi}
    >
      {renderChild(restChildren, contentLayoutContext)}
      <SearchIndexCollector Pages={Pages} NavPanel={NavPanel} renderChild={renderChild} />
    </AppComponent>
  );
}

export const appRenderer = wrapComponent(COMP, AppNode, AppMd, {
  customRender: (
    _props,
    { node, extractValue, renderChild, classes, lookupEventHandler, registerComponentApi },
  ) => {
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
});

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { BrowserRouter, useInRouterContext } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppHeaderMd } from "../AppHeader/AppHeader";
import { FooterMd } from "../Footer/Footer";
import { PagesMd } from "../Pages/Pages";

export const appRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: AppMd as ComponentMetadata,
  themeContributors: [AppHeaderMd as ComponentMetadata, FooterMd as ComponentMetadata, PagesMd as ComponentMetadata],
  layoutOrientation: "vertical",
  renderer: ({ adapter }) => {
    const extracted = extractRuntimeAppComponents(adapter.node.children);
    const { appHeader, footer, pages, restChildren } = extracted;
    const navPanel = extracted.navPanel ??
      (pages ? findRuntimeNavPanelInPages(pages) : undefined);
    const logoContentDef = adapter.prop("logoTemplate");
    const scrollWholePage = adapter.booleanProp("scrollWholePage", defaultProps.scrollWholePage);
    const contentLayoutContext = !scrollWholePage
      ? { type: "Stack" as const, orientation: "vertical" as const }
      : undefined;
    const layout = adapter.stringProp("layout") as any;
    const horizontalBandClass =
      layout === "horizontal" || layout === "horizontal-sticky"
        ? "xmlui-runtime-horizontal-app-band"
        : undefined;
    const i18nConfigSignatureRef = useRef<string>();
    const i18nConfigSignature = runtimeI18nConfigSignature(
      adapter.stringProp("locale"),
      adapter.prop("localeBundles"),
    );
    if (adapter.scope.i18n && i18nConfigSignatureRef.current !== i18nConfigSignature) {
      i18nConfigSignatureRef.current = i18nConfigSignature;
      adapter.scope.i18n.setConfig({
        locale: adapter.stringProp("locale"),
        bundles: adapter.prop("localeBundles"),
      });
    }

    const renderChild = (
      child?: XmluiNode | XmluiNode[],
      layoutContext?: Record<string, unknown>,
    ) => {
      if (!child) {
        return undefined;
      }
      const childWithLayoutContext = applyRuntimeLayoutContext(child, layoutContext);
      return Array.isArray(childWithLayoutContext)
        ? adapter.context.renderChildren(childWithLayoutContext, adapter.scope)
        : childWithLayoutContext.kind === "element"
          ? adapter.context.renderElement(childWithLayoutContext, adapter.scope)
          : adapter.context.renderChildren([childWithLayoutContext], adapter.scope);
    };

    return (
      <RuntimeAppProviders>
      <AppComponent
        {...adapter.rootAttrs()}
        scrollWholePage={scrollWholePage}
        fitContent={adapter.booleanProp("fitContent", defaultProps.fitContent)}
        noScrollbarGutters={adapter.booleanProp("noScrollbarGutters", defaultProps.noScrollbarGutters)}
        classes={{
          [COMPONENT_PART_KEY]: [adapter.className, horizontalBandClass]
            .filter(Boolean)
            .join(" "),
        }}
        layout={layout}
        loggedInUser={adapter.prop("loggedInUser")}
        onReady={adapter.event("ready") as any}
        onMessageReceived={adapter.event("messageReceived") as any}
        onKeyDown={adapter.event("keyDown") as any}
        onKeyUp={adapter.event("keyUp") as any}
        onWillNavigate={adapter.event("willNavigate") as any}
        onDidNavigate={adapter.event("didNavigate") as any}
        onError={adapter.event("error") as any}
        name={adapter.stringProp("name")}
        logo={adapter.stringProp("logo")}
        logoDark={adapter.stringProp("logo-dark")}
        logoLight={adapter.stringProp("logo-light")}
        defaultTone={adapter.stringProp("defaultTone")}
        defaultTheme={adapter.stringProp("defaultTheme")}
        autoDetectTone={adapter.booleanProp("autoDetectTone", defaultProps.autoDetectTone)}
        persistTheme={adapter.booleanProp("persistTheme", defaultProps.persistTheme)}
        themeStorageKey={adapter.stringProp("themeStorageKey", defaultProps.themeStorageKey)}
        toneStorageKey={adapter.stringProp("toneStorageKey", defaultProps.toneStorageKey)}
        locale={adapter.stringProp("locale")}
        localeBundles={adapter.prop("localeBundles")}
        auditPolicy={adapter.prop("auditPolicy")}
        direction={adapter.stringProp("direction", "auto") as any}
        scheduler={adapter.stringProp("scheduler") as any}
        maxQueuedPerTrace={adapter.numberProp("maxQueuedPerTrace", 64)}
        applyDefaultContentPadding={!pages && adapter.prop("padding") === undefined}
        header={renderChild(appHeader, {})}
        footer={renderChild(footer, {})}
        navPanel={renderChild(navPanel, {})}
        navPanelDef={navPanel as any}
        logoContentDef={logoContentDef as any}
        renderChild={renderChild as any}
        registerComponentApi={(api: Record<string, unknown>) => adapter.registerApi(api)}
      >
        {renderChild(restChildren, contentLayoutContext)}
      </AppComponent>
      </RuntimeAppProviders>
    );
  },
});

function RuntimeAppProviders({ children }: { children: React.ReactNode }) {
  const isInRouterContext = useInRouterContext();
  const app = <HelmetProvider>{children}</HelmetProvider>;
  return isInRouterContext ? app : <BrowserRouter>{app}</BrowserRouter>;
}

function runtimeI18nConfigSignature(locale: string | undefined, localeBundles: unknown): string {
  try {
    return JSON.stringify([locale, localeBundles]);
  } catch {
    return `${locale ?? ""}:${String(localeBundles)}`;
  }
}

function applyRuntimeLayoutContext(
  child: XmluiNode | XmluiNode[],
  layoutContext?: Record<string, unknown>,
): XmluiNode | XmluiNode[] {
  if (!layoutContext) {
    return child;
  }
  if (Array.isArray(child)) {
    return child.map((item) => applyRuntimeLayoutContext(item, layoutContext) as XmluiNode);
  }
  if (child.kind !== "element") {
    return child;
  }
  if (isTransparentLayoutWrapper(child)) {
    return {
      ...child,
      children: child.children.map((item) =>
        applyRuntimeLayoutContext(item, layoutContext) as XmluiNode,
      ),
    };
  }
  return {
    ...child,
    props: {
      ...child.props,
      ...toRuntimeLayoutProps(layoutContext),
    },
  };
}

function toRuntimeLayoutProps(layoutContext: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(layoutContext)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, typeof value === "string" ? value : String(value)]),
  );
}

function isRuntimeShellChild(
  child: XmluiNode,
  appHeader: XmluiElement | undefined,
  footer: XmluiElement | undefined,
  navPanel: XmluiElement | undefined,
): boolean {
  return child === appHeader || child === footer || child === navPanel;
}

function isTransparentLayoutWrapper(child: XmluiElement): boolean {
  return child.type === "Theme" || child.type === "Fragment";
}

function extractRuntimeAppComponents(children: XmluiNode[]): {
  appHeader?: XmluiElement;
  footer?: XmluiElement;
  navPanel?: XmluiElement;
  pages?: XmluiElement;
  restChildren: XmluiNode[];
} {
  const result: {
    appHeader?: XmluiElement;
    footer?: XmluiElement;
    navPanel?: XmluiElement;
    pages?: XmluiElement;
    restChildren: XmluiNode[];
  } = { restChildren: [] };

  for (const child of children) {
    if (child.kind !== "element") {
      result.restChildren.push(child);
      continue;
    }
    if (child.type === "Theme") {
      extractRuntimeFromThemeWrapper(child, result);
      continue;
    }
    extractRuntimeDirectChild(child, result);
  }

  return result;
}

function extractRuntimeFromThemeWrapper(
  themeNode: XmluiElement,
  result: ReturnType<typeof extractRuntimeAppComponents>,
) {
  const otherChildren: XmluiNode[] = [];
  for (const child of themeNode.children) {
    if (child.kind === "element" && isTransparentRuntimeFragment(child)) {
      for (const fragmentChild of child.children) {
        extractRuntimeThemeChild(themeNode, fragmentChild, result, otherChildren);
      }
      continue;
    }
    extractRuntimeThemeChild(themeNode, child, result, otherChildren);
  }
  if (otherChildren.length > 0) {
    result.restChildren.push({ ...themeNode, children: otherChildren });
  }
}

function extractRuntimeThemeChild(
  themeNode: XmluiElement,
  child: XmluiNode,
  result: ReturnType<typeof extractRuntimeAppComponents>,
  otherChildren: XmluiNode[],
) {
  if (child.kind === "element" && child.type === "AppHeader") {
    if (result.appHeader) {
      otherChildren.push(child);
    } else {
      result.appHeader = createRuntimeShellThemeWrapper(themeNode, child);
    }
  } else if (child.kind === "element" && child.type === "Footer") {
    if (result.footer) {
      otherChildren.push(child);
    } else {
      result.footer = createRuntimeShellThemeWrapper(themeNode, child);
    }
  } else if (child.kind === "element" && child.type === "NavPanel") {
    if (result.navPanel) {
      otherChildren.push(child);
    } else {
      result.navPanel = createRuntimeShellThemeWrapper(themeNode, child);
    }
  } else if (child.kind === "element" && child.type === "Pages") {
    const wrappedPages = createRuntimeShellThemeWrapper(themeNode, child);
    result.pages ??= wrappedPages;
    result.restChildren.push(wrappedPages);
  } else {
    otherChildren.push(child);
  }
}

function createRuntimeShellThemeWrapper(themeNode: XmluiElement, child: XmluiElement): XmluiElement {
  const props = { ...themeNode.props };
  const parsedProps = themeNode.parsed?.props ? { ...themeNode.parsed.props } : undefined;
  for (const key of Object.keys(props)) {
    if (key.endsWith("-App")) {
      delete props[key];
      delete parsedProps?.[key];
    }
  }
  return {
    ...themeNode,
    props,
    parsed: themeNode.parsed ? { ...themeNode.parsed, props: parsedProps } : themeNode.parsed,
    children: [child],
  };
}

function extractRuntimeDirectChild(
  child: XmluiElement,
  result: ReturnType<typeof extractRuntimeAppComponents>,
) {
  if (isTransparentRuntimeFragment(child)) {
    child.children.forEach((fragmentChild) => {
      if (fragmentChild.kind === "element") {
        extractRuntimeDirectChild(fragmentChild, result);
      } else {
        result.restChildren.push(fragmentChild);
      }
    });
    return;
  }

  switch (child.type) {
    case "AppHeader":
      if (result.appHeader) {
        result.restChildren.push(child);
      } else {
        result.appHeader = child;
      }
      break;
    case "Footer":
      if (result.footer) {
        result.restChildren.push(child);
      } else {
        result.footer = child;
      }
      break;
    case "NavPanel":
      if (result.navPanel) {
        result.restChildren.push(child);
      } else {
        result.navPanel = child;
      }
      break;
    case "Pages":
      result.pages = child;
      result.restChildren.push(child);
      break;
    default:
      result.restChildren.push(child);
  }
}

function isTransparentRuntimeFragment(child: XmluiElement): boolean {
  return (
    child.type === "Fragment" &&
    Object.keys(child.vars).length === 0 &&
    Object.keys(child.globals).length === 0 &&
    Object.keys(child.events).length === 0 &&
    Object.keys(child.methods).length === 0 &&
    child.props.when === undefined
  );
}

function findRuntimeNavPanelInPages(pages: XmluiElement): XmluiElement | undefined {
  for (const page of pages.children) {
    if (page.kind !== "element" || page.type !== "Page") {
      continue;
    }
    const navPanel = page.children.find(
      (child): child is XmluiElement => child.kind === "element" && child.type === "NavPanel",
    );
    if (navPanel) {
      return navPanel;
    }
  }
  return undefined;
}
