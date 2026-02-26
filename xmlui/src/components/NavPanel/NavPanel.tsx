import styles from "./NavPanel.module.scss";

import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, dComponent } from "../metadata-helpers";
import { NavPanel, defaultProps, buildNavHierarchy } from "./NavPanelNative";
import { useCallback, useMemo } from "react";
import classnames from "classnames";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { useComponentRegistry } from "../ComponentRegistryContext";

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

type AppNavSections = Record<string, unknown>;
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
        `only while scrolling is active and fades out after 400ms of inactivity.`,
      valueType: "string",
      availableValues: ["normal", "overlay", "whenMouseOver", "whenScrolling"],
      defaultValue: defaultProps.scrollStyle,
    },
    showScrollerFade: {
      description:
        `When enabled, displays gradient fade indicators at the top and bottom edges of the navigation ` +
        `panel when scrollable content extends beyond the visible area. The fade effect provides a visual cue ` +
        `to users that additional content is available by scrolling. The indicators automatically appear and ` +
        `disappear based on the scroll position. This property only works with "overlay", "whenMouseOver", and ` +
        `"whenScrolling" scroll styles.`,
      valueType: "boolean",
      defaultValue: defaultProps.showScrollerFade,
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
  className,
  layoutContext,
  extractValue,
  appContext,
}) {
  const componentRegistry = useComponentRegistry();

  const lookupCompoundComponent = useCallback(
    (name: string): ComponentDef | undefined => {
      const entry = componentRegistry.lookupComponentRenderer(name);
      if (!entry?.isCompoundComponent || !entry.compoundComponentDef) {
        return undefined;
      }
      return entry.compoundComponentDef.component as ComponentDef;
    },
    [componentRegistry],
  );

  const effectiveChildren = useMemo(() => {
    return resolveNavSectionChildren(
      node.children as ComponentDef[] | undefined,
      appContext?.appGlobals?.navSections as AppNavSections | undefined,
      extractValue,
    );
  }, [appContext?.appGlobals?.navSections, extractValue, node.children]);

  const navLinks = useMemo(() => {
    return buildNavHierarchy(
      effectiveChildren,
      extractValue,
      undefined,
      [],
      lookupCompoundComponent,
    );
  }, [effectiveChildren, extractValue, lookupCompoundComponent]);

  const scrollStyle = extractValue.asOptionalString(
    node.props.scrollStyle,
    defaultProps.scrollStyle,
  );
  const showScrollerFade = extractValue.asOptionalBoolean(node.props.showScrollerFade);
  const footerContent = node.props.footerTemplate
    ? renderChild(node.props.footerTemplate)
    : undefined;

  return (
    <NavPanel
      logoContent={renderChild(node.props.logoTemplate)}
      footerContent={footerContent}
      className={classnames(layoutContext?.themeClassName, className)}
      inDrawer={layoutContext?.inDrawer}
      renderChild={renderChild}
      navLinks={navLinks}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
    >
      {renderChild(effectiveChildren)}
    </NavPanel>
  );
}

export const navPanelRenderer = createComponentRenderer(
  COMP,
  NavPanelMd,
  ({ node, renderChild, className, layoutContext, extractValue, appContext }) => {
    return (
      <NavPanelWithBuiltNavHierarchy
        node={node}
        renderChild={renderChild}
        className={className}
        layoutContext={layoutContext}
        extractValue={extractValue}
        appContext={appContext}
      />
    );
  },
);
