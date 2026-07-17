import styles from "./NavPanel.module.scss";

import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dComponent } from "../metadata-helpers";
import { defaultProps } from "./NavPanel.defaults";
import { NavPanel, buildLinkMap, buildNavHierarchy } from "./NavPanelReact";
import { useMemo } from "react";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

const COMP = "NavPanel";

type AppNavItem = {
  to?: string;
  label?: string;
  icon?: string;
  description?: string;
  children?: AppNavItem[];
  target?: string;
  active?: boolean;
  noIndicator?: boolean;
  initiallyExpanded?: boolean;
  iconAlignment?: string;
  mobileOnly?: boolean;
};

type AppNavData = {
  items?: AppNavItem[];
};

export type AppNavSections = Record<string, unknown>;
const MOBILE_ONLY_WHEN = "{mediaSize.sizeIndex <= 2}";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function withMobileOnly(
  node: ComponentDef | undefined,
  item: AppNavItem,
  uidPrefix: string,
  idx: number,
) {
  if (!node) return undefined;
  if (!item.mobileOnly) return node;
  return {
    type: "Fragment",
    uid: `${uidPrefix}-mobile-only-${idx}`,
    when: MOBILE_ONLY_WHEN,
    children: [node],
  } as ComponentDef;
}

function toNavComponentDef(
  item: AppNavItem,
  uidPrefix: string,
  idx: number,
): ComponentDef | undefined {
  const hasChildren = Array.isArray(item.children);
  if (hasChildren) {
    if (!item.label) return undefined;
    const groupNode: ComponentDef = {
      type: "NavGroup",
      uid: `${uidPrefix}-group-${idx}`,
      props: {
        label: item.label,
        to: item.to,
        icon: item.icon,
        initiallyExpanded: item.initiallyExpanded,
        iconAlignment: item.iconAlignment,
      },
      children: item.children
        ?.map((child, childIdx) => toNavComponentDef(child, `${uidPrefix}-group-${idx}`, childIdx))
        .filter(Boolean) as ComponentDef[],
    };
    return withMobileOnly(groupNode, item, uidPrefix, idx);
  }

  if (!item.label || !item.to) return undefined;
  const linkNode: ComponentDef = {
    type: "NavLink",
    uid: `${uidPrefix}-link-${idx}`,
    props: {
      label: item.label,
      to: item.to,
      icon: item.icon,
      target: item.target,
      active: item.active,
      noIndicator: item.noIndicator,
      iconAlignment: item.iconAlignment,
    },
  };
  return withMobileOnly(linkNode, item, uidPrefix, idx);
}

function normalizeSectionData(rawSection: unknown): AppNavData | undefined {
  if (Array.isArray(rawSection)) {
    return { items: rawSection as AppNavItem[] };
  }
  if (!isPlainObject(rawSection)) {
    return undefined;
  }
  const section = rawSection as AppNavData;
  if (!Array.isArray(section.items)) {
    return undefined;
  }
  return section;
}

// Expands compound (user-defined) components used inside the NavPanel by
// inlining their children, so that nav-specific placeholders (like
// IncludeNavSection) are resolved before rendering.
function expandCompoundNavChildren(
  children: ComponentDef[] | undefined,
): ComponentDef[] | undefined {
  if (!children) return children;

  const result: ComponentDef[] = [];

  children.forEach((child) => {
    if (!child || typeof child !== "object") {
      return;
    }
    result.push(child);
  });

  return result;
}

function buildSectionNavChildren(rawSection: unknown, uidPrefix: string): ComponentDef[] {
  const section = normalizeSectionData(rawSection);
  if (!section) return [];
  const children: ComponentDef[] = [];

  const items = Array.isArray(section.items) ? section.items : [];
  children.push(
    ...(items
      .map((item, idx) => toNavComponentDef(item, `${uidPrefix}-main`, idx))
      .filter(Boolean) as ComponentDef[]),
  );

  return children;
}

function resolveNavSectionChildren(
  children: ComponentDef[] | undefined,
  appNavSections: AppNavSections | undefined,
  extractValue: any,
  uidPrefix = "nav-section",
): ComponentDef[] | undefined {
  if (!children) return children;
  const resolvedChildren: ComponentDef[] = [];

  children.forEach((child, idx) => {
    if (!child || typeof child !== "object") return;

    if (child.type === "IncludeNavSection") {
      const sectionId =
        extractValue.asOptionalString?.(child.props?.sectionId) ??
        extractValue(child.props?.sectionId);
      const sectionData = sectionId && appNavSections ? appNavSections[sectionId] : undefined;
      const expanded = buildSectionNavChildren(sectionData, `${uidPrefix}-${sectionId || idx}`);
      resolvedChildren.push(...expanded);
      return;
    }

    if (child.children && child.children.length > 0) {
      const nested = resolveNavSectionChildren(
        child.children as ComponentDef[],
        appNavSections,
        extractValue,
        `${uidPrefix}-${idx}`,
      );
      resolvedChildren.push({ ...child, children: nested });
      return;
    }

    resolvedChildren.push(child);
  });

  return resolvedChildren;
}

export const NavPanelMd = createMetadata({
  status: "stable",
  description:
    "`NavPanel` defines the navigation structure within an App, serving as a container " +
    "for NavLink and NavGroup components that create your application's primary " +
    "navigation menu. Its appearance and behavior automatically adapt based on the " +
    "App's layout configuration.",
  parts: {
    logo: {
      description: "The logo area within the NavPanel component.",
    },
    content: {
      description: "The content area within the NavPanel component.",
    },
    footer: {
      description:
        "Optional footer area at the bottom of the NavPanel (e.g. for theme switcher or layout toggle). Shown only when footerTemplate is set.",
    },
  },
  props: {
    logoTemplate: dComponent(
      `This property defines the logo template to display in the navigation panel with the ` +
        `\`vertical\` and \`vertical-sticky\` layout.`,
    ),
    footerTemplate: dComponent(
      `Optional template for a footer at the bottom of the NavPanel. When set, the footer is shown ` +
        `below the scrollable nav content (e.g. for theme switcher or sidebar toggle, similar to Nextra).`,
    ),
    inDrawer: {
      description: `This property determines if the navigation panel is displayed in a drawer.`,
      valueType: "boolean",
      defaultValue: defaultProps.inDrawer,
    },
    scrollStyle: {
      description:
        `This property determines the scrollbar style. Options: "normal" uses the browser's default ` +
        `scrollbar; "overlay" displays a themed scrollbar that is always visible; "whenMouseOver" shows the ` +
        `scrollbar only when hovering over the scroll container; "whenScrolling" displays the scrollbar ` +
        `only while scrolling is active and fades out after 400ms of inactivity. ` +
        `On mobile/touch devices, this property is ignored and the browser's native scrollbar is always used.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      isStrictEnum: true,
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        `When enabled, displays gradient fade indicators at the top and bottom edges of the navigation ` +
        `panel when scrollable content extends beyond the visible area. The fade effect provides a visual cue ` +
        `to users that additional content is available by scrolling. The indicators automatically appear and ` +
        `disappear based on the scroll position. This property only works with "overlay", "whenMouseOver", and ` +
        `"whenScrolling" scroll styles. On mobile/touch devices, this property has no effect.`,
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
    },
    syncWithContent: {
      description:
        `When enabled, any page navigation automatically scrolls the corresponding navigation ` +
        `item within the NavPanel into view, keeping the active link visible.`,
      valueType: "boolean",
      defaultValue: defaultProps.syncWithContent,
    },
    syncScrollBehavior: {
      description:
        `Controls the scroll animation when \`syncWithContent\` is enabled. Use \`"smooth"\` for an ` +
        `animated scroll or \`"instant"\` to jump immediately to the active item without animation.`,
      valueType: "string",
      availableValues: ["smooth", "instant"],
      isStrictEnum: true,
      defaultValue: defaultProps.syncScrollBehavior,
    },
    syncScrollPosition: {
      description:
        `Controls the vertical alignment of the active navigation item within the NavPanel when ` +
        `\`syncWithContent\` scrolls it into view. \`"center"\` places the item in the middle of the ` +
        `visible area; \`"nearest"\` scrolls the minimum amount needed; \`"start"\` aligns it to the ` +
        `top; \`"end"\` aligns it to the bottom.`,
      valueType: "string",
      availableValues: ["center", "nearest", "start", "end"],
      isStrictEnum: true,
      defaultValue: defaultProps.syncScrollPosition,
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  limitThemeVarsToComponent: true,
  defaultThemeVars: {
    [`horizontalAlignment-logo-${COMP}`]: "center",
    [`backgroundColor-${COMP}`]: "$backgroundColor",
    [`backgroundColor-${COMP}-horizontal`]: "$backgroundColor-AppHeader",
    [`border-${COMP}`]: "0px solid $borderColor",
    [`borderRight-${COMP}-vertical`]: "1px solid $borderColor",
    [`paddingVertical-${COMP}`]: "$space-5",
    [`paddingHorizontal-${COMP}`]: "0",
    [`paddingVertical-logo-${COMP}`]: "$space-4",
    [`paddingHorizontal-logo-${COMP}`]: "$space-4",
    [`marginBottom-logo-${COMP}`]: "$space-4",
    [`boxShadow-${COMP}-vertical`]: "4px 0 4px 0 rgb(0 0 0 / 10%)",
    [`padding-footer-${COMP}`]: "$space-2",
    [`paddingHorizontal-footer-${COMP}`]: "$space-4",
    [`paddingVertical-footer-${COMP}`]: "$space-2",
  },
});

function NavPanelWithBuiltNavHierarchy({
  node,
  renderChild,
  classes,
  layoutContext,
  extractValue,
  appContext,
}) {
  const effectiveChildren = useMemo(() => {
    return resolveNavSectionChildren(
      node.children as ComponentDef[] | undefined,
      appContext?.appGlobals?.navSections as AppNavSections | undefined,
      extractValue,
    );
  }, [appContext?.appGlobals?.navSections, extractValue, node.children]);

  const expandedChildren = useMemo(() => {
    return (
      expandCompoundNavChildren(
        effectiveChildren as ComponentDef[] | undefined,
      ) || effectiveChildren
    );
  }, [effectiveChildren]);

  const navLinks = useMemo(() => {
    return buildNavHierarchy(
      expandedChildren,
      extractValue,
      undefined,
      [],
    );
  }, [expandedChildren, extractValue]);

  const scrollStyle = extractValue.asOptionalString(
    node.props.scrollStyle,
    defaultProps.scrollStyle,
  );
  const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);
  const syncWithContent = extractValue.asOptionalBoolean(node.props.syncWithContent);
  const syncScrollBehavior = extractValue.asOptionalString(
    node.props.syncScrollBehavior,
    defaultProps.syncScrollBehavior,
  ) as ScrollBehavior | undefined;
  const syncScrollPosition = extractValue.asOptionalString(
    node.props.syncScrollPosition,
    defaultProps.syncScrollPosition,
  ) as ScrollLogicalPosition | undefined;
  const footerContent = node.props.footerTemplate
    ? renderChild(node.props.footerTemplate)
    : undefined;

  return (
    <NavPanel
      logoContent={renderChild(node.props.logoTemplate)}
      footerContent={footerContent}
      className={layoutContext?.themeClassName}
      classes={classes}
      inDrawer={layoutContext?.inDrawer}
      renderChild={renderChild}
      navLinks={navLinks}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
      syncWithContent={syncWithContent}
      syncScrollBehavior={syncScrollBehavior}
      syncScrollPosition={syncScrollPosition}
    >
      {renderChild(expandedChildren)}
    </NavPanel>
  );
}

export const navPanelRenderer = wrapComponent(COMP, NavPanel, NavPanelMd, {
  customRender: (_props, context) => (
    <NavPanelWithBuiltNavHierarchy
      node={context.node as any}
      renderChild={context.renderChild}
      classes={context.classes}
      layoutContext={context.layoutContext}
      extractValue={context.extractValue}
      appContext={context.appContext}
    />
  ),
});

import type { ComponentMetadata } from "../../component-core/metadata/types";
import type { XmluiElement, XmluiNode } from "../../compiler/ir";
import { useXmluiAppContext } from "../../runtime/appContext";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";
import { evaluateProps } from "../../runtime/rendering/bindings";
import type { RuntimeScope } from "../../runtime/state";
import { AppHeaderMd } from "../AppHeader/AppHeader";

const runtimeTemplateNames = new Set(["logoTemplate", "footerTemplate"]);

function runtimeNavElement(
  type: "NavGroup" | "NavLink",
  props: Record<string, unknown>,
  sourceNode: XmluiElement,
  children: XmluiNode[] = [],
): XmluiElement {
  return {
    kind: "element",
    type,
    props: props as Record<string, string>,
    vars: {},
    globals: {},
    events: {},
    methods: {},
    children,
    range: sourceNode.range,
  };
}

function toRuntimeNavNode(
  item: AppNavItem,
  sourceNode: XmluiElement,
  uidPrefix: string,
  idx: number,
): XmluiElement | undefined {
  if (Array.isArray(item.children)) {
    if (!item.label) return undefined;
    const children = item.children
      .map((child, childIdx) => toRuntimeNavNode(child, sourceNode, `${uidPrefix}-group-${idx}`, childIdx))
      .filter(Boolean) as XmluiNode[];
    return runtimeNavElement(
      "NavGroup",
      {
        label: item.label,
        to: item.to,
        icon: item.icon,
        initiallyExpanded: item.initiallyExpanded,
        iconAlignment: item.iconAlignment,
      },
      sourceNode,
      children,
    );
  }

  if (!item.label || !item.to) return undefined;
  return runtimeNavElement(
    "NavLink",
    {
      label: item.label,
      to: item.to,
      icon: item.icon,
      target: item.target,
      active: item.active,
      noIndicator: item.noIndicator,
      iconAlignment: item.iconAlignment,
    },
    sourceNode,
  );
}

function buildRuntimeSectionNavNodes(
  rawSection: unknown,
  sourceNode: XmluiElement,
  uidPrefix: string,
): XmluiNode[] {
  const section = normalizeSectionData(rawSection);
  if (!section) return [];
  return section.items
    ?.map((item, idx) => toRuntimeNavNode(item, sourceNode, `${uidPrefix}-main`, idx))
    .filter(Boolean) as XmluiNode[];
}

function resolveRuntimeNavSectionNodes(
  children: XmluiNode[],
  appNavSections: AppNavSections | undefined,
  uidPrefix = "nav-section",
): XmluiNode[] {
  const resolvedChildren: XmluiNode[] = [];

  children.forEach((child, idx) => {
    if (child.kind !== "element") {
      resolvedChildren.push(child);
      return;
    }

    if (child.type === "IncludeNavSection") {
      const sectionId = child.props.sectionId;
      const sectionData = sectionId && appNavSections ? appNavSections[sectionId] : undefined;
      resolvedChildren.push(...buildRuntimeSectionNavNodes(sectionData, child, `${uidPrefix}-${sectionId || idx}`));
      return;
    }

    if (child.children.length > 0) {
      resolvedChildren.push({
        ...child,
        children: resolveRuntimeNavSectionNodes(child.children, appNavSections, `${uidPrefix}-${idx}`),
      });
      return;
    }

    resolvedChildren.push(child);
  });

  return resolvedChildren;
}

export function getRuntimeNavPanelContentNodes(node: XmluiElement): XmluiNode[] {
  return node.children.filter((child) => !isRuntimeTemplateProperty(child));
}

export function resolveRuntimeNavPanelContentNodes(
  children: XmluiNode[],
  appNavSections: AppNavSections | undefined,
): XmluiNode[] {
  return resolveRuntimeNavSectionNodes(children, appNavSections);
}

export function buildRuntimeNavPanelLinkMap(
  navPanelNode: XmluiElement | undefined,
  appNavSections: AppNavSections | undefined,
  scope: RuntimeScope,
) {
  if (!navPanelNode) {
    return new Map();
  }
  const navChildren = resolveRuntimeNavPanelContentNodes(
    getRuntimeNavPanelContentNodes(navPanelNode),
    appNavSections,
  );
  return buildLinkMap(buildRuntimeNavHierarchy(navChildren, scope));
}

function buildRuntimeNavHierarchy(
  children: XmluiNode[] | undefined,
  scope: RuntimeScope,
): NavHierarchyNode[] {
  const hierarchy = buildRuntimeNavHierarchyInner(children, scope);
  setRuntimeNavigationProperties(hierarchy);
  return hierarchy;
}

function buildRuntimeNavHierarchyInner(
  children: XmluiNode[] | undefined,
  scope: RuntimeScope,
  parent?: NavHierarchyNode,
  pathSegments: NavHierarchyNode[] = [],
): NavHierarchyNode[] {
  if (!children) return [];

  const hierarchy: NavHierarchyNode[] = [];
  children.forEach((child) => {
    if (child.kind !== "element") return;

    if (child.type === "NavLink") {
      const props = evaluateProps(child.props as Record<string, string>, child.parsed?.props, scope);
      const label = optionalString(props.label) ?? textChildLabel(child);
      const to = optionalString(props.to);
      const icon = optionalString(props.icon);
      if (label && to) {
        hierarchy.push({
          type: "NavLink",
          label,
          to,
          icon,
          parent,
          pathSegments: [...pathSegments],
        });
      }
      return;
    }

    if (child.type === "NavGroup") {
      const props = evaluateProps(child.props as Record<string, string>, child.parsed?.props, scope);
      const label = optionalString(props.label);
      const to = optionalString(props.to);
      const icon = optionalString(props.icon);
      if (label) {
        const groupNode: NavHierarchyNode = {
          type: "NavGroup",
          label,
          to,
          icon,
          parent,
          pathSegments: [...pathSegments],
          children: [],
        };
        groupNode.children = buildRuntimeNavHierarchyInner(
          child.children,
          scope,
          groupNode,
          [...pathSegments, groupNode],
        );
        hierarchy.push(groupNode);
      } else if (child.children.length > 0) {
        hierarchy.push(...buildRuntimeNavHierarchyInner(child.children, scope, parent, pathSegments));
      }
      return;
    }

    if (child.children.length > 0) {
      hierarchy.push(...buildRuntimeNavHierarchyInner(child.children, scope, parent, pathSegments));
    }
  });

  return hierarchy;
}

function setRuntimeNavigationProperties(hierarchy: NavHierarchyNode[]) {
  const allNavLinks: NavHierarchyNode[] = [];

  function collectNavLinks(nodes: NavHierarchyNode[]) {
    nodes.forEach((node) => {
      if (node.type === "NavLink") {
        allNavLinks.push(node);
      }
      if (node.children) {
        collectNavLinks(node.children);
      }
    });
  }

  collectNavLinks(hierarchy);
  allNavLinks.forEach((link, index) => {
    if (index > 0) {
      link.prevLink = allNavLinks[index - 1];
    }
    if (index < allNavLinks.length - 1) {
      link.nextLink = allNavLinks[index + 1];
    }
  });

  function setFirstLastProperties(nodes: NavHierarchyNode[]) {
    const navLinks = nodes.filter((node) => node.type === "NavLink");
    if (navLinks.length > 0) {
      navLinks[0].firstLink = true;
      navLinks[navLinks.length - 1].lastLink = true;
    }
    nodes.forEach((node) => {
      if (node.children) {
        setFirstLastProperties(node.children);
      }
    });
  }

  setFirstLastProperties(hierarchy);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function textChildLabel(node: XmluiElement): string | undefined {
  if (node.children.length !== 1 || node.children[0].kind !== "text") {
    return undefined;
  }
  const value = node.children[0].value.trim();
  return value.length > 0 ? value : undefined;
}

export const navPanelRuntimeRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: NavPanelMd as ComponentMetadata,
  themeContributors: [AppHeaderMd as ComponentMetadata],
  renderer: ({ adapter }) => {
    const appContext = useXmluiAppContext();
    const children = getRuntimeNavPanelContentNodes(adapter.node);
    const navChildren = resolveRuntimeNavPanelContentNodes(
      children,
      appContext.appGlobals?.navSections as AppNavSections | undefined,
    );
    const navLinks = useMemo(() => {
      return buildRuntimeNavHierarchy(navChildren, adapter.scope);
    }, [adapter.scope, navChildren]);
    const hasLogoTemplate = hasRuntimeTemplate(adapter.node.children, "logoTemplate");
    const hasFooterTemplate = hasRuntimeTemplate(adapter.node.children, "footerTemplate");
    return (
      <NavPanel
        {...adapter.rootAttrs()}
        logoContent={hasLogoTemplate ? adapter.renderTemplate("logoTemplate") : undefined}
        footerContent={hasFooterTemplate ? adapter.renderTemplate("footerTemplate") : undefined}
        inDrawer={adapter.booleanProp("inDrawer", defaultProps.inDrawer)}
        renderChild={(child: any) => {
          if (!child) {
            return undefined;
          }
          return Array.isArray(child)
            ? adapter.context.renderChildren(child, adapter.scope)
            : adapter.context.renderElement(child, adapter.scope);
        }}
        scrollStyle={adapter.stringProp("scrollStyle", defaultProps.scrollStyle) as any}
        showScrollerFade={adapter.booleanProp("showScrollerFade", defaultProps.showScrollerFade)}
        syncWithContent={adapter.booleanProp("syncWithContent", defaultProps.syncWithContent)}
        syncScrollBehavior={adapter.stringProp("syncScrollBehavior", defaultProps.syncScrollBehavior) as any}
        syncScrollPosition={adapter.stringProp("syncScrollPosition", defaultProps.syncScrollPosition) as any}
        navLinks={navLinks}
        classes={{ [COMPONENT_PART_KEY]: adapter.className }}
      >
        {adapter.context.renderChildren(navChildren, adapter.scope)}
      </NavPanel>
    );
  },
});

function isRuntimeTemplateProperty(node: XmluiNode): boolean {
  return node.kind === "element" &&
    node.type === "property" &&
    typeof node.props.name === "string" &&
    runtimeTemplateNames.has(node.props.name);
}

function hasRuntimeTemplate(children: XmluiNode[], name: string): boolean {
  return children.some((child) =>
    child.kind === "element" &&
    child.type === "property" &&
    child.props.name === name
  );
}
