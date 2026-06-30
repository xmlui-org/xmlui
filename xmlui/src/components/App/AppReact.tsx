import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import {
  collectComponentThemeDefaults,
  mergeThemeVariableLayers,
  resolveThemeReferences,
  resolveThemeVariable,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
} from "../../styling/theme";
import type { XmluiAdapterRendererProps } from "../../runtime/rendering/adapter";
import type { XmluiNode } from "../../compiler/ir";
import { createRuntimeScope } from "../../runtime/state";
import { useComponentThemeClass, useThemeVariables } from "../../runtime/rendering/theme";
import { evaluateExpressionOrText } from "../../runtime/rendering/bindings";
import { useBindingRevision } from "../../runtime/rendering/reactive";
import { useScrollbarWidth } from "../../components-core/utils/css-utils";
import { ProfileMenuProvider } from "../ProfileMenu/ProfileMenuContext";
import { ThemedIcon } from "../Icon/Icon";
import { AppHeaderMd } from "../AppHeader/AppHeader";
import appHeaderStyles from "../AppHeader/AppHeader.module.scss";
import { AppHeaderComponent } from "../AppHeader/AppHeaderReact";
import { AppLayoutContext, type AppLayoutType, type IAppLayoutContext } from "./AppLayoutContext";
import { AppMd } from "./App";
import { AppShellProvider } from "./AppShellContext";
import { defaultProps } from "./App.defaults";
import styles from "./App.module.scss";

const CONTENT_THEME_VARS = {
  backgroundColor: "backgroundColor-content-App",
  borderLeft: "borderLeft-content-App",
  maxWidth: "maxWidth-content-App",
  maxWidthWithToc: "maxWidth-content-App--withToc",
} as const;

const NARROW_SCREEN_QUERY = "(max-width: 991px)";

export function App({ adapter }: XmluiAdapterRendererProps) {
  const themeVariables = useThemeVariables();
  const mergedThemeVariables = mergeThemeVariableLayers([
    collectComponentThemeDefaults(AppMd),
    themeVariables,
    appThemeVariableProps(adapter.props),
  ]);

  const rootAttrs = adapter.rootAttrs();
  const rootStyle = appShellStyle(rootAttrs.style as CSSProperties | undefined);
  const testId = adapter.stringProp("testId");
  const fitContent = adapter.booleanProp("fitContent", defaultProps.fitContent);
  const noScrollbarGutters = adapter.booleanProp(
    "noScrollbarGutters",
    defaultProps.noScrollbarGutters,
  );
  const scrollbarWidth = useScrollbarWidth();
  const headerSize = useMeasuredBlockSize<HTMLDivElement>();
  const footerSize = useMeasuredBlockSize<HTMLDivElement>();
  const loggedInUser = adapter.prop("loggedInUser", null);
  const appProps = adapter.props;
  const appChildScope = useMemo(
    () =>
      createRuntimeScope({
        store: adapter.scope.store,
        parent: adapter.scope,
        props: adapter.scope.props,
        contextValues: appProps,
        references: adapter.scope.references,
        slots: adapter.scope.slots,
        routing: adapter.scope.routing,
        toast: adapter.scope.toast,
        i18n: adapter.scope.i18n,
        emitEvent: adapter.scope.emitEvent,
        extensionFunctions: adapter.scope.extensionFunctions,
      }),
    [adapter.scope, appProps],
  );
  const childAdapter = useMemo(
    () => ({
      ...adapter,
      scope: appChildScope,
      renderChildren: (children = adapter.node.children) =>
        adapter.context.renderChildren(children, appChildScope),
      renderTemplate: (name: string, fallbackChildren?: XmluiNode[]) =>
        adapter.context.renderChildren(
          templateChildren(adapter.node.children, name) ?? fallbackChildren ?? [],
          appChildScope,
        ),
    }),
    [adapter, appChildScope],
  );
  const layout = normalizeLayout(adapter.stringProp("layout"));
  const generatedAppHeaderThemeClass = useComponentThemeClass(
    "AppHeader",
    AppHeaderMd as ComponentMetadata,
  );
  const routeSnapshot = useRouteSnapshot(adapter);
  const scrollWholePage = adapter.booleanProp("scrollWholePage", defaultProps.scrollWholePage);
  const showDrawerToggle = useVisibleNavPanel(adapter);
  const isNarrowScreen = useNarrowScreen();
  const [navPanelCollapsed, setNavPanelCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [subNavPanelSlot, setSubNavPanelSlot] = useState<HTMLElement | null>(null);
  const slots = useMemo(
    () => partitionAppChildren(adapter.node.children),
    [adapter.node.children],
  );
  const shouldRenderGeneratedCondensedHeader = Boolean(
    layout.isCondensed && !slots.header && showDrawerToggle,
  );
  const hasShellHeader = Boolean(slots.header || shouldRenderGeneratedCondensedHeader);
  const isVerticalFullHeader = layout.value === "vertical-full-header";
  const shouldUseDrawerNavPanel = Boolean(isNarrowScreen && hasShellHeader && slots.navPanel);
  const hasSideNavPanel = Boolean(
    slots.navPanel &&
    !shouldUseDrawerNavPanel &&
    layout.value !== "desktop" &&
    !isVerticalFullHeader &&
    getAppLayoutOrientation(layout.value) === "vertical",
  );
  const useTocContentWidth = shouldUseTocContentWidth(
    mergedThemeVariables,
    routeSnapshot.pathname,
  );
  const appLogoContent = hasTemplate(adapter.node.children, "logoTemplate")
    ? childAdapter.renderTemplate("logoTemplate")
    : undefined;
  const readyFiredRef = useRef(false);
  const appLayoutContext = useMemo(() => ({
    layout: layout.value as AppLayoutType,
    navPanelVisible: showDrawerToggle && !shouldUseDrawerNavPanel,
    navPanelCollapsed,
    setNavPanelCollapsed,
    toggleNavPanelCollapsed: () => setNavPanelCollapsed((current) => !current),
    drawerVisible,
    showDrawer: () => setDrawerVisible(true),
    hideDrawer: () => setDrawerVisible(false),
    toggleDrawer: () => setDrawerVisible((current) => !current),
    hasRegisteredNavPanel: showDrawerToggle,
    hasRegisteredHeader: adapter.node.children.some(
      (child) => child.kind === "element" && child.type === "AppHeader",
    ),
    logo: adapter.stringProp("logo"),
    logoDark: adapter.stringProp("logoDark"),
    logoLight: adapter.stringProp("logoLight"),
    logoContentDef: appLogoContent,
    registerSubNavPanelSlot: setSubNavPanelSlot,
    subNavPanelSlot,
    scrollWholePage,
    isNarrowScreen: shouldUseDrawerNavPanel,
  }), [
    adapter,
    drawerVisible,
    layout.value,
    appLogoContent,
    navPanelCollapsed,
    scrollWholePage,
    showDrawerToggle,
    shouldUseDrawerNavPanel,
    subNavPanelSlot,
  ]);

  useEffect(() => {
    if (!shouldUseDrawerNavPanel && drawerVisible) {
      setDrawerVisible(false);
    }
  }, [drawerVisible, shouldUseDrawerNavPanel]);

  useEffect(() => {
    if (drawerVisible) {
      setDrawerMounted(true);
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setDrawerMounted(false), 300);
    return () => window.clearTimeout(timeoutId);
  }, [drawerVisible]);

  adapter.scope.i18n?.setConfig({
    locale: adapter.stringProp("locale"),
    bundles: adapter.prop("localeBundles"),
  });

  useEffect(() => {
    const name = adapter.stringProp("name");
    if (name) {
      document.title = name;
    }
  }, [adapter]);

  useEffect(() => {
    if (readyFiredRef.current) {
      return;
    }
    readyFiredRef.current = true;
    void adapter.event("ready")();
  }, [adapter]);

  useEffect(() => {
    adapter.scope.routing?.setNavigationHandlers({
      onWillNavigate: (to, queryParams) => adapter.event("willNavigate")(to, queryParams),
      onDidNavigate: (to, queryParams) => adapter.event("didNavigate")(to, queryParams),
    });
    return () => {
      adapter.scope.routing?.setNavigationHandlers({});
    };
  }, [adapter]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      void adapter.event("messageReceived")(event.data, event);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [adapter]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      void adapter.event("keyDown")(event);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      void adapter.event("keyUp")(event);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [adapter]);

  return (
    <ProfileMenuProvider loggedInUser={normalizeLoggedInUser(loggedInUser)}>
      <AppShellProvider
        showDrawerToggle={shouldUseDrawerNavPanel && showDrawerToggle}
        toggleDrawer={() => setDrawerVisible((current) => !current)}
      >
        <AppLayoutContext.Provider value={appLayoutContext}>
          {shouldUseDrawerNavPanel && slots.navPanel && (drawerVisible || drawerMounted)
            ? renderMobileDrawer(
              childAdapter,
              appLayoutContext,
              mergedThemeVariables,
              slots.navPanel,
              drawerVisible,
              () => setDrawerVisible(false),
            )
            : null}
          <div
            {...rootAttrs}
            data-testid={testId}
            data-xmlui-app-fit-content={fitContent ? "true" : undefined}
            className={[
              rootAttrs.className,
              styles.appContainer,
              layout.cssModuleClass,
              layout.isSticky && styles.sticky,
              ...layout.classNames,
              scrollWholePage && !fitContent && styles.scrollWholePage,
              scrollWholePage && !fitContent && "scrollWholePage",
              noScrollbarGutters && styles.noScrollbarGutters,
              noScrollbarGutters && "noScrollbarGutters",
              fitContent && styles.fitContent,
              shouldUseDrawerNavPanel && styles.mobile,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...rootStyle,
              ...themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(mergedThemeVariables)),
              ...appBaselineStyle(mergedThemeVariables),
              ...appContainerStyle(fitContent, layout.value, shouldUseDrawerNavPanel),
              "--app-header-height": headerSize.height > 0
                ? `${headerSize.height}px`
                : undefined,
              "--app-footer-height": isVerticalFullHeader && slots.footer && footerSize.height > 0
                ? `${footerSize.height}px`
                : "0px",
              "--scrollbar-width": noScrollbarGutters ? "0px" : `${scrollbarWidth}px`,
              ...appShellStyle(adapter.style),
            } as CSSProperties}
          >
            {isVerticalFullHeader && !shouldUseDrawerNavPanel ? (
              <>
                {slots.header ? (
                  <div
                    data-xmlui-component="App"
                    data-xmlui-part="header"
                    ref={headerSize.ref}
                    className={[styles.headerWrapper, styles.sticky].filter(Boolean).join(" ")}
                    style={headerShellStyle(mergedThemeVariables)}
                  >
                    {childAdapter.renderChildren([slots.header])}
                  </div>
                ) : null}
                <div data-xmlui-component="App" data-xmlui-part="mainContentRow" className={styles.mainContentRow}>
                  {slots.navPanel ? (
                    <aside
                      data-xmlui-component="App"
                      data-xmlui-part="navPanel"
                      className={[
                        styles.navPanelWrapper,
                        navPanelCollapsed && styles.navPanelWrapperCollapsed,
                      ].filter(Boolean).join(" ")}
                      style={sideNavPanelShellStyle(mergedThemeVariables, navPanelCollapsed)}
                    >
                      {childAdapter.renderChildren([slots.navPanel])}
                    </aside>
                  ) : null}
                  <main
                    data-xmlui-component="App"
                    data-xmlui-part="content"
                    className={styles.mainContentArea}
                    style={contentAreaStyle(
                      mergedThemeVariables,
                      fitContent,
                      scrollWholePage,
                      getAppLayoutOrientation(layout.value),
                      appProps,
                      false,
                    )}
                  >
                    <div
                      data-xmlui-component="App"
                      data-xmlui-part="pages"
                      className={styles.pagesContainer}
                    >
                      {renderPageContent(
                        childAdapter,
                        mergedThemeVariables,
                        appProps,
                        slots.content,
                        useTocContentWidth,
                        false,
                      )}
                    </div>
                  </main>
                </div>
                {slots.footer ? (
                  <div
                    data-xmlui-component="App"
                    data-xmlui-part="footer"
                    ref={footerSize.ref}
                    className={[styles.footerWrapper, styles.sticky].filter(Boolean).join(" ")}
                    style={footerShellStyle()}
                  >
                    {childAdapter.renderChildren([slots.footer])}
                  </div>
                ) : null}
              </>
            ) : hasSideNavPanel ? (
              <>
                <aside
                  data-xmlui-component="App"
                  data-xmlui-part="navPanel"
                  className={[
                    styles.navPanelWrapper,
                    navPanelCollapsed && styles.navPanelWrapperCollapsed,
                  ].filter(Boolean).join(" ")}
                  style={sideNavPanelShellStyle(mergedThemeVariables, navPanelCollapsed)}
                >
                  {slots.navPanel ? childAdapter.renderChildren([slots.navPanel]) : null}
                </aside>
                <main
                  data-xmlui-component="App"
                  data-xmlui-part="content"
                  className={styles.mainContentArea}
                  style={contentAreaStyle(
                    mergedThemeVariables,
                    fitContent,
                    scrollWholePage,
                    getAppLayoutOrientation(layout.value),
                    appProps,
                    false,
                  )}
                >
                  {slots.header ? (
                    <div
                      data-xmlui-component="App"
                      data-xmlui-part="header"
                      ref={headerSize.ref}
                      className={[
                        styles.headerWrapper,
                        layout.isSticky && styles.sticky,
                      ].filter(Boolean).join(" ")}
                      style={headerShellStyle(mergedThemeVariables)}
                    >
                      {childAdapter.renderChildren([slots.header])}
                    </div>
                  ) : null}
                  <div
                    data-xmlui-component="App"
                    data-xmlui-part="pages"
                    className={styles.pagesContainer}
                  >
                    {renderPageContent(
                      childAdapter,
                      mergedThemeVariables,
                      appProps,
                      slots.content,
                      useTocContentWidth,
                      false,
                    )}
                  </div>
                  {slots.footer ? (
                    <div
                      data-xmlui-component="App"
                      data-xmlui-part="footer"
                      className={[
                        styles.footerWrapper,
                        layout.isSticky && styles.sticky,
                      ].filter(Boolean).join(" ")}
                      style={footerShellStyle()}
                    >
                      {childAdapter.renderChildren([slots.footer])}
                    </div>
                  ) : null}
                </main>
              </>
            ) : (
              <>
            {hasShellHeader ? (
              <div
                data-xmlui-component="App"
                data-xmlui-part="header"
                ref={headerSize.ref}
                className={[
                  styles.headerWrapper,
                  layout.isSticky && styles.sticky,
                ].filter(Boolean).join(" ")}
                style={headerShellStyle(mergedThemeVariables)}
              >
                {slots.header
                  ? childAdapter.renderChildren([slots.header])
                  : renderGeneratedCondensedHeader(
                    hasTemplate(adapter.node.children, "logoTemplate") ? appLogoContent : undefined,
                    layout.isCondensed && slots.navPanel && !shouldUseDrawerNavPanel
                      ? <div style={{ minWidth: 0 }}>{childAdapter.renderChildren([slots.navPanel])}</div>
                      : undefined,
                    shouldUseDrawerNavPanel && showDrawerToggle,
                    () => setDrawerVisible((current) => !current),
                    generatedAppHeaderThemeClass,
                  )}
              </div>
            ) : null}
            {layout.isCondensed && slots.header && slots.navPanel && subNavPanelSlot
              && !shouldUseDrawerNavPanel
              ? createPortal(childAdapter.renderChildren([slots.navPanel]), subNavPanelSlot)
              : null}
            {slots.navPanel &&
            !shouldUseDrawerNavPanel &&
            layout.value !== "desktop" &&
            !layout.isCondensed &&
            getAppLayoutOrientation(layout.value) === "horizontal" ? (
              <div
                data-xmlui-component="App"
                data-xmlui-part="navPanel"
                className={styles.navPanelWrapper}
                style={navPanelShellStyle(mergedThemeVariables, layout.isSticky)}
              >
                {childAdapter.renderChildren([slots.navPanel])}
              </div>
            ) : null}
            {renderMainContent(
                childAdapter,
                mergedThemeVariables,
                fitContent,
                scrollWholePage,
                shouldUseDrawerNavPanel ? "horizontal" : getAppLayoutOrientation(layout.value),
                layout.value,
                shouldUseDrawerNavPanel,
                appProps,
                slots.content,
                useTocContentWidth,
              )}
            {slots.footer ? (
              <div
                data-xmlui-component="App"
                data-xmlui-part="footer"
                className={[
                  styles.footerWrapper,
                  layout.isSticky && styles.sticky,
                ].filter(Boolean).join(" ")}
                style={footerShellStyle()}
              >
                {childAdapter.renderChildren([slots.footer])}
              </div>
            ) : null}
              </>
            )}
          </div>
        </AppLayoutContext.Provider>
      </AppShellProvider>
    </ProfileMenuProvider>
  );
}

function renderPageContent(
  adapter: XmluiAdapterRendererProps["adapter"],
  mergedThemeVariables: Record<string, unknown>,
  appProps: Record<string, unknown>,
  children: XmluiNode[],
  useTocContentWidth: boolean,
  isDesktop: boolean,
) {
  return (
    <div
      data-xmlui-component="App"
      data-xmlui-part="pageContent"
      className={[
        styles.pageContentContainer,
        shouldApplyDefaultContentPadding(children, appProps) && styles.withDefaultContentPadding,
        useTocContentWidth && styles.withToc,
      ].filter(Boolean).join(" ")}
      style={pageContentStyle(mergedThemeVariables, appProps, useTocContentWidth, isDesktop)}
    >
      {adapter.renderChildren(children)}
    </div>
  );
}

function renderMainContent(
  adapter: XmluiAdapterRendererProps["adapter"],
  mergedThemeVariables: Record<string, unknown>,
  fitContent: boolean,
  scrollWholePage: boolean,
  layoutOrientation: "horizontal" | "vertical",
  layoutValue: string,
  useMobileShell: boolean,
  appProps: Record<string, unknown>,
  children: XmluiNode[],
  useTocContentWidth: boolean,
) {
  const isDesktop = layoutValue === "desktop";
  return (
    <main
      data-xmlui-component="App"
      data-xmlui-part="content"
      className={styles.pagesContainer}
      style={contentAreaStyle(
        mergedThemeVariables,
        fitContent,
        scrollWholePage,
        layoutOrientation,
        appProps,
        isDesktop,
        useMobileShell,
      )}
    >
      {renderPageContent(adapter, mergedThemeVariables, appProps, children, useTocContentWidth, isDesktop)}
    </main>
  );
}

function renderMobileDrawer(
  adapter: XmluiAdapterRendererProps["adapter"],
  appLayoutContext: IAppLayoutContext,
  mergedThemeVariables: Record<string, unknown>,
  navPanel: XmluiNode,
  open: boolean,
  closeDrawer: () => void,
) {
  const drawerLayoutContext: IAppLayoutContext = {
    ...appLayoutContext,
    layout: "vertical",
    navPanelVisible: true,
    drawerVisible: open,
    isNarrowScreen: true,
  };

  return (
    <div
      aria-hidden={open ? undefined : "true"}
      className={styles.mobileDrawer}
      data-state={open ? "open" : "closed"}
      data-xmlui-component="App"
      data-xmlui-part="drawer"
      style={themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(mergedThemeVariables))}
    >
      <button
        aria-hidden="true"
        className={styles.mobileDrawerOverlay}
        onClick={closeDrawer}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-label="Navigation menu"
        className={styles.mobileDrawerPanel}
        onClickCapture={(event) => {
          if ((event.target as Element | null)?.closest("a[href]")) {
            closeDrawer();
          }
        }}
        role="dialog"
      >
        <button
          aria-label="Close navigation menu"
          className={styles.mobileDrawerClose}
          onClick={closeDrawer}
          type="button"
        >
          <ThemedIcon name="close" />
        </button>
        <AppLayoutContext.Provider value={drawerLayoutContext}>
          {adapter.renderChildren([navPanel])}
        </AppLayoutContext.Provider>
      </aside>
    </div>
  );
}

function renderGeneratedCondensedHeader(
  logoContent: ReturnType<XmluiAdapterRendererProps["adapter"]["renderTemplate"]> | undefined,
  navPanelContent: ReactNode | undefined,
  showDrawerToggle: boolean,
  toggleDrawer: () => void,
  themeClass: ReturnType<typeof useComponentThemeClass>,
) {
  return (
    <AppHeaderComponent
      className={themeClass.className}
      drawerToggle={showDrawerToggle ? (
        <button
          aria-label="Open navigation menu"
          className={appHeaderStyles.hamburgerButton}
          data-part-id="hamburger"
          onClick={toggleDrawer}
          type="button"
        >
          <ThemedIcon name="hamburger" />
        </button>
      ) : undefined}
      logoContent={logoContent}
      style={themeClass.style}
    >
      {navPanelContent}
    </AppHeaderComponent>
  );
}

type AppChildSlots = {
  header?: XmluiNode;
  navPanel?: XmluiNode;
  footer?: XmluiNode;
  content: XmluiNode[];
};

function partitionAppChildren(children: XmluiNode[]): AppChildSlots {
  const slots: AppChildSlots = { content: [] };
  for (const child of children) {
    if (child.kind === "element" && child.type === "AppHeader" && !slots.header) {
      slots.header = child;
    } else if (child.kind === "element" && child.type === "NavPanel" && !slots.navPanel) {
      slots.navPanel = child;
    } else if (child.kind === "element" && child.type === "Footer" && !slots.footer) {
      slots.footer = child;
    } else if (child.kind === "element" && child.type === "property" && child.props.name === "logoTemplate") {
      continue;
    } else if (child.kind === "element" && child.type === "NavPanel") {
      continue;
    } else {
      slots.content.push(child);
    }
  }
  return slots;
}

function hasTemplate(children: XmluiNode[], name: string): boolean {
  return children.some((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
}

function templateChildren(children: XmluiNode[], name: string): XmluiNode[] | undefined {
  const property = children.find((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
  return property?.kind === "element" ? property.children : undefined;
}

function shouldApplyDefaultContentPadding(
  children: XmluiNode[],
  props: Record<string, unknown>,
): boolean {
  return !children.some((child) => child.kind === "element" && child.type === "Pages") &&
    props.padding === undefined;
}

function headerShellStyle(themeVariables: Record<string, unknown>): CSSProperties {
  return {
    flexShrink: 0,
    boxShadow: themeValue(themeVariables, "boxShadow-header-App"),
    zIndex: 2,
  };
}

function navPanelShellStyle(
  themeVariables: Record<string, unknown>,
  isSticky: boolean,
): CSSProperties {
  return {
    flexShrink: 0,
    position: "sticky",
    top: isSticky
      ? "var(--app-header-height, var(--xmlui-height-AppHeader, var(--xmlui-space-14)))"
      : 0,
    zIndex: isSticky ? 1 : undefined,
    backgroundColor: themeValue(themeVariables, "backgroundColor-navPanel-App"),
    borderBottom: "var(--xmlui-borderBottom-AppHeader, 1px solid var(--xmlui-borderColor))",
    boxShadow: themeValue(themeVariables, "boxShadow-navPanel-App"),
    padding: 0,
  };
}

function sideNavPanelShellStyle(
  themeVariables: Record<string, unknown>,
  collapsed: boolean,
): CSSProperties {
  const width = themeValue(
    themeVariables,
    collapsed ? "width-navPanel-collapsed-App" : "width-navPanel-App",
  );
  return {
    flexShrink: 0,
    width,
    minWidth: width,
    borderRight: themeValue(themeVariables, "borderRight-navPanelWrapper-App"),
    boxShadow: themeValue(themeVariables, "boxShadow-navPanel-App"),
    overflow: "hidden",
  };
}

function footerShellStyle(): CSSProperties {
  return {
    flexShrink: 0,
  };
}

function appShellStyle(style: CSSProperties | undefined): CSSProperties | undefined {
  if (!style) {
    return undefined;
  }
  const { alignItems, justifyContent, ...rest } = style;
  return rest;
}

function normalizeLoggedInUser(value: unknown) {
  return value && typeof value === "object" ? value as Record<string, string> : null;
}

function appContainerStyle(
  fitContent: boolean,
  layoutValue: string,
  useMobileShell: boolean,
): CSSProperties {
  return {
    width: "100%",
    minHeight: fitContent ? undefined : "100vh",
    height: fitContent ? undefined : "100%",
    position: "relative",
    display: "flex",
    flexDirection: !useMobileShell &&
      (layoutValue === "vertical" || layoutValue === "vertical-sticky")
      ? "row"
      : "column",
    isolation: "isolate",
  };
}

function appBaselineStyle(themeVariables: Record<string, unknown>): CSSProperties {
  return {
    backgroundColor: themeValue(themeVariables, "backgroundColor"),
    color: themeValue(themeVariables, "textColor") ?? themeValue(themeVariables, "textColor-primary"),
    fontFamily: themeValue(themeVariables, "fontFamily"),
    fontFeatureSettings: themeValue(themeVariables, "font-feature-settings"),
    fontSize: themeValue(themeVariables, "fontSize"),
    fontWeight: themeValue(themeVariables, "fontWeight"),
    letterSpacing: themeValue(themeVariables, "letterSpacing"),
    lineHeight: themeValue(themeVariables, "lineHeight"),
  };
}

function contentAreaStyle(
  themeVariables: Record<string, unknown>,
  fitContent: boolean,
  scrollWholePage: boolean,
  layoutOrientation: "horizontal" | "vertical",
  props: Record<string, unknown>,
  isDesktop: boolean,
  useMobileShell = false,
): CSSProperties {
  const useMobileNaturalScroll = useMobileShell && scrollWholePage;
  return {
    position: "relative",
    minWidth: 0,
    minHeight: isDesktop || useMobileNaturalScroll
      ? 0
      : fitContent || (scrollWholePage && layoutOrientation === "horizontal") ? undefined : 0,
    flex: useMobileNaturalScroll ? "1 0 auto" : 1,
    display: "flex",
    flexDirection: "column",
    overflow: useMobileShell
      ? scrollWholePage ? "initial" : "auto"
      : isDesktop
      ? "hidden"
      : layoutOrientation === "horizontal"
      ? scrollWholePage ? "initial" : "auto"
      : undefined,
    backgroundColor: appContentValue(themeVariables, props, CONTENT_THEME_VARS.backgroundColor),
    borderLeft: appContentValue(themeVariables, props, CONTENT_THEME_VARS.borderLeft),
  };
}

function pageContentStyle(
  themeVariables: Record<string, unknown>,
  props: Record<string, unknown>,
  useTocContentWidth: boolean,
  isDesktop: boolean,
): CSSProperties {
  if (isDesktop) {
    return {
      maxWidth: "none",
      width: "100%",
      margin: 0,
      minHeight: 0,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
      scrollbarGutter: "auto",
    };
  }

  return {
    maxWidth: appContentValue(
      themeVariables,
      props,
      useTocContentWidth ? CONTENT_THEME_VARS.maxWidthWithToc : CONTENT_THEME_VARS.maxWidth,
    ),
    width: "100%",
    margin: "0 auto",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  };
}

function useMeasuredBlockSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      setHeight(0);
      return;
    }

    const update = () => {
      setHeight(element.getBoundingClientRect().height);
    };
    update();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, height };
}

function useNarrowScreen() {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(NARROW_SCREEN_QUERY).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(NARROW_SCREEN_QUERY);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener?.("change", update);
    return () => {
      mediaQuery.removeEventListener?.("change", update);
    };
  }, []);

  return matches;
}

function useRouteSnapshot(adapter: XmluiAdapterRendererProps["adapter"]) {
  const routing = adapter.scope.routing;
  const fallback = { pathname: "/", search: "", hash: "", queryParams: {}, revision: 0 };
  return useSyncExternalStore(
    (listener) => routing?.subscribe(listener) ?? (() => undefined),
    () => routing?.getSnapshot() ?? fallback,
    () => routing?.getSnapshot() ?? fallback,
  );
}

function shouldUseTocContentWidth(
  themeVariables: Record<string, unknown>,
  pathname: string,
): boolean {
  const tableOfContentsEnabled = themeValue(themeVariables, "tableOfContents") !== "false";
  return (
    tableOfContentsEnabled &&
    (pathname === "/" || pathname === "/blog" || pathname.startsWith("/blog/"))
  );
}

function appContentValue(
  themeVariables: Record<string, unknown>,
  props: Record<string, unknown>,
  name: string,
): string | undefined {
  const propValue = props[name];
  if (propValue !== undefined && propValue !== null && propValue !== "") {
    return String(resolveThemeReferences(propValue));
  }
  return themeValue(themeVariables, name);
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}

function appThemeVariableProps(props: Record<string, unknown>): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    if (/-App(?:-|$)/.test(name)) {
      variables[name] = value;
    }
  }
  return variables;
}

function useVisibleNavPanel(adapter: XmluiAdapterRendererProps["adapter"]): boolean {
  const dependencies = useMemo(() => adapter.node.children.flatMap((child) => {
    if (child.kind !== "element" || child.type !== "NavPanel") {
      return [];
    }
    const parsedWhen = child.parsed?.props?.when;
    return Array.isArray(parsedWhen) ? [] : parsedWhen?.dependencies ?? [];
  }), [adapter.node.children]);
  useBindingRevision(dependencies, adapter.scope);
  return adapter.node.children.some((child) => {
    if (child.kind !== "element" || child.type !== "NavPanel") {
      return false;
    }
    const when = child.props.when as unknown;
    const parsedWhen = child.parsed?.props?.when;
    if (parsedWhen && !Array.isArray(parsedWhen)) {
      const source = typeof when === "string" ? when : String(when ?? "");
      return Boolean(evaluateExpressionOrText(source, parsedWhen, adapter.scope, "App:NavPanel:when"));
    }
    return when !== false && when !== "false" && when !== "{false}";
  });
}

function normalizeLayout(
  value: string | undefined,
): {
  value: string;
  classNames: string[];
  cssModuleClass: string;
  isCondensed: boolean;
  isSticky: boolean;
} {
  const raw = (value ?? "condensed-sticky")
    .replace(/[\u2011\u2013\u2014]/g, "-")
    .trim();
  const supported = new Set([
    "horizontal",
    "horizontal-sticky",
    "condensed",
    "condensed-sticky",
    "vertical",
    "vertical-sticky",
    "vertical-full-header",
    "desktop",
  ]);
  const normalized = supported.has(raw) ? raw : "condensed-sticky";
  if (raw && !supported.has(raw)) {
    console.warn(`App layout type not supported: ${raw}`);
  }
  const classNames = ["xmlui-App"];
  if (normalized === "desktop") {
    classNames.push("desktop");
  } else if (normalized.startsWith("vertical")) {
    classNames.push("vertical");
  } else {
    classNames.push("horizontal");
  }
  const isCondensed = normalized.includes("condensed");
  if (isCondensed) {
    classNames.push("condensed");
  }
  const isSticky = normalized.includes("sticky");
  if (isSticky) {
    classNames.push("sticky");
  }
  if (normalized === "vertical-full-header") {
    classNames.push("verticalFullHeader");
  }
  const cssModuleClass = normalized === "desktop"
    ? styles.desktop
    : normalized === "vertical-full-header"
      ? styles.verticalFullHeader
      : normalized.startsWith("vertical")
        ? styles.vertical
        : styles.horizontal;
  return { value: normalized, classNames, cssModuleClass, isCondensed, isSticky };
}

export function getAppLayoutOrientation(appLayout?: string) {
  switch (appLayout) {
    case "vertical":
    case "vertical-sticky":
    case "vertical-full-header":
      return "vertical";
    default:
      return "horizontal";
  }
}
