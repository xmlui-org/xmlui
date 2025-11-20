import styles from "./App2.module.scss";
import drawerStyles from "./Sheet.module.scss";

import { type ComponentDef } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { createMetadata, dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "../App/AppLayoutContext";
import { App2 as App2Component, defaultProps } from "./App2Native";
import type { CSSProperties } from "react";
import { useRef } from "react";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { SearchIndexCollector } from "./SearchIndexCollector";

// --- Define a structure to represent navigation hierarchy
interface NavHierarchyNode {
  type: string;
  label: string;
  path?: string;
  children?: NavHierarchyNode[];
}

const COMP = "App2";

export const App2Md = createMetadata({
  status: "stable",
  description:
    "The `App` component is the root container that defines your application's overall " +
    "structure and layout. It provides a complete UI framework with built-in navigation, " +
    "header, footer, and content areas that work together seamlessly.",
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
    },
    messageReceived: {
      description: `This event fires when the \`${COMP}\` component receives a message from another window or iframe via the window.postMessage API.`,
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
  const footerSticky = Footer?.props?.sticky ?? true;

  return (
    <App2Component
      scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage, true)}
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
      {renderChild(restChildren)}
      <SearchIndexCollector Pages={Pages} renderChild={renderChild} />
    </App2Component>
  );
}

// --- Navigation Helper Functions ---

/**
 * Parse a string into hierarchy labels, handling escaped pipe characters.
 */
function parseHierarchyLabels(labelText: string): string[] {
  const result: string[] = [];
  let currentLabel = "";
  let escaped = false;

  for (let i = 0; i < labelText.length; i++) {
    const char = labelText[i];

    if (escaped) {
      currentLabel += char;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (char === "|") {
      result.push(currentLabel.trim());
      currentLabel = "";
    } else {
      currentLabel += char;
    }
  }

  if (currentLabel.length > 0) {
    result.push(currentLabel.trim());
  }

  return result;
}

// --- Component Extraction Helper Functions ---

interface ExtractedComponents {
  AppHeader?: ComponentDef;
  Footer?: ComponentDef;
  NavPanel?: ComponentDef;
  Pages?: ComponentDef;
  restChildren: ComponentDef[];
}

/**
 * Extract App2 special components (AppHeader, Footer, NavPanel, Pages) from children.
 * Handles Theme wrappers by unwrapping special components while preserving Theme for others.
 */
function extractAppComponents(children: ComponentDef[] | undefined): ExtractedComponents {
  const result: ExtractedComponents = { restChildren: [] };

  if (!children) return result;

  for (const child of children) {
    if (child.type === "Theme") {
      extractFromThemeWrapper(child, result);
    } else {
      extractDirectChild(child, result);
    }
  }

  return result;
}

/**
 * Extract special components from within a Theme wrapper.
 * Special components are unwrapped while other children remain in the Theme.
 */
function extractFromThemeWrapper(
  themeNode: ComponentDef,
  result: ExtractedComponents
): void {
  const otherChildren: ComponentDef[] = [];

  themeNode.children?.forEach((child) => {
    if (child.type === "AppHeader") {
      result.AppHeader = { ...themeNode, children: [child] };
    } else if (child.type === "Footer") {
      result.Footer = { ...themeNode, children: [child] };
    } else if (child.type === "NavPanel") {
      result.NavPanel = { ...themeNode, children: [child] };
    } else {
      otherChildren.push(child);
    }
  });

  // Only add Theme to restChildren if it has remaining children
  if (otherChildren.length > 0) {
    result.restChildren.push({ ...themeNode, children: otherChildren });
  }
}

/**
 * Extract a direct (non-Theme-wrapped) child component.
 */
function extractDirectChild(child: ComponentDef, result: ExtractedComponents): void {
  switch (child.type) {
    case "AppHeader":
      result.AppHeader = child;
      break;
    case "Footer":
      result.Footer = child;
      break;
    case "NavPanel":
      result.NavPanel = child;
      break;
    case "Pages":
      result.Pages = child;
      result.restChildren.push(child);
      break;
    default:
      result.restChildren.push(child);
  }
}

/**
 * Find or create a NavGroup with the given label in the navItems array.
 */
function findOrCreateNavGroup(navItems: any[], groupLabel: string): any {
  const existingGroup = navItems.find(
    (item) => item.type === "NavGroup" && item.props?.label === groupLabel,
  );

  if (existingGroup) {
    return existingGroup;
  }

  const newGroup = {
    type: "NavGroup",
    props: {
      label: groupLabel,
    },
    children: [],
  };

  navItems.push(newGroup);
  return newGroup;
}

/**
 * Check if a label exists in a navigation hierarchy (recursive).
 */
function labelExistsInHierarchy(searchLabel: string, hierarchy: NavHierarchyNode[]): boolean {
  return hierarchy.some((node) => {
    if (node.label === searchLabel) {
      return true;
    }
    if (node.children && node.children.length > 0) {
      return labelExistsInHierarchy(searchLabel, node.children);
    }
    return false;
  });
}

export const app2Renderer = createComponentRenderer(
  COMP,
  App2Md,
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

// --- Navigation Extraction Functions ---

/**
 * Process navigation items recursively and build hierarchy tree.
 * Handles NavLink and NavGroup items, extracting labels and building a tree structure.
 */
function processNavItems(
  items: ComponentDef[],
  parentHierarchy: NavHierarchyNode[],
  extractValue: (value: any) => any,
) {
  items.forEach((navItem) => {
    // --- Process NavLink items
    if (navItem.type === "NavLink") {
      let itemLabel = navItem.props?.label;
      let itemPath = navItem.props?.to;

      if (!itemLabel) {
        if (navItem.children?.length === 1 && navItem.children[0].type === "TextNode") {
          itemLabel = navItem.children[0].props.value;
        }
      }

      if (itemLabel) {
        const labelValue = extractValue(itemLabel);

        // --- Add to hierarchy
        parentHierarchy.push({
          type: "NavLink",
          label: labelValue,
          path: itemPath ? extractValue(itemPath) : undefined,
        });
      }
    }
    // --- Process NavGroup items (which may contain nested NavLink or NavGroup items)
    else if (navItem.type === "NavGroup") {
      let groupLabel = navItem.props?.label;

      if (groupLabel) {
        const labelValue = extractValue(groupLabel);

        // --- Create group node
        const groupNode: NavHierarchyNode = {
          type: "NavGroup",
          label: labelValue,
          children: [],
        };

        // --- Add to parent hierarchy
        parentHierarchy.push(groupNode);

        // --- Recursively process children of the NavGroup
        if (navItem.children && navItem.children.length > 0) {
          processNavItems(navItem.children, groupNode.children, extractValue);
        }
      } else if (navItem.children && navItem.children.length > 0) {
        // --- If no label but has children, still process them under parent
        processNavItems(navItem.children, parentHierarchy, extractValue);
      }
    }
  });
}

/**
 * Extract navigation panel items from Pages component and build hierarchical structure.
 * 
 * Creates NavLink and NavGroup components based on Page navLabel props.
 * Handles multi-level hierarchies using pipe-separated labels (e.g., "Parent|Child").
 * Prevents duplicates and integrates with existing NavPanel structure.
 */
function extractNavPanelFromPages(
  Pages: ComponentDef,
  NavPanel: ComponentDef | undefined,
  extractValue: (value: any) => any,
): ComponentDef[] | null {
  if (!Pages) return null;

  const extraNavs: ComponentDef[] = [];
  const navigationHierarchy: NavHierarchyNode[] = [];

  // --- Build navigation hierarchy from existing NavPanel
  if (NavPanel?.children) {
    processNavItems(NavPanel.children, navigationHierarchy, extractValue);
  }

  // --- Process Pages to create hierarchical navigation structure
  Pages.children?.forEach((page) => {
    if (page.type === "Page" && page.props.navLabel) {
      const label = extractValue(page.props.navLabel);
      const url = extractValue(page.props.url);

      // --- Parse hierarchy labels separated by unescaped pipe characters
      const hierarchyLabels = parseHierarchyLabels(label);

      if (hierarchyLabels.length === 0) {
        return;
      }

      // --- For a single level, just add a NavLink directly
      if (hierarchyLabels.length === 1) {
        if (!labelExistsInHierarchy(hierarchyLabels[0], navigationHierarchy)) {
          extraNavs.push({
            type: "NavLink",
            props: {
              label: hierarchyLabels[0],
              to: url,
            },
          });
        }
        return;
      }

      // --- For multi-level hierarchies, create NavGroups and a final NavLink
      let currentLevel = extraNavs;

      // --- Create NavGroups for all levels except the last one
      for (let i = 0; i < hierarchyLabels.length - 1; i++) {
        const groupLabel = hierarchyLabels[i];
        const navGroup = findOrCreateNavGroup(currentLevel, groupLabel);

        if (!navGroup.children) {
          navGroup.children = [];
        }

        currentLevel = navGroup.children;
      }

      // --- Add the leaf NavLink to the deepest NavGroup
      const leafLabel = hierarchyLabels[hierarchyLabels.length - 1];

      const existingNavLink = currentLevel.find(
        (item) => item.type === "NavLink" && item.props?.label === leafLabel,
      );

      if (!existingNavLink) {
        currentLevel.push({
          type: "NavLink",
          props: {
            label: leafLabel,
            to: url,
          },
        });
      }
    }
  });

  return extraNavs;
}
