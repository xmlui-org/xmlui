import styles from "./App.module.scss";

import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "./AppLayoutContext";
import { App } from "./AppNative";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PageMd } from "../Pages/Pages";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { IndexerContext } from "./IndexerContext";
import { createPortal } from "react-dom";
import { useAppContext } from "../../components-core/AppContext";
import { useSearchContextUpdater } from "./SearchContext";

import ReactDOMServer from 'react-dom/server';

// --- Define a structure to represent navigation hierarchy
interface NavHierarchyNode {
  type: string;
  label: string;
  path?: string;
  children?: NavHierarchyNode[];
}

const COMP = "App";

export const AppMd = createMetadata({
  status: "stable",
  description:
    `The \`${COMP}\` component provides a UI frame for XMLUI apps. According to predefined (and ` +
    `run-time configurable) structure templates, \`${COMP}\` allows you to display your ` +
    `preferred layout.`,
  props: {
    layout: {
      description:
        `This property sets the layout template of the app. This setting determines the position ` +
        `and size of the app parts (such as header, navigation bar, footer, etc.) and the app's ` +
        `scroll behavior.`,
      availableValues: appLayoutMd,
    },
    loggedInUser: {
      description: `Stores information about the currently logged in user.`,
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
      description: "Optional application name (visible in the browser tab)",
      valueType: "string",
    },
    scrollWholePage: {
      description:
        `This boolean property specifies whether the whole page should scroll (\`true\`) or just ` +
        `the content area (\`false\`). The default value is \`true\`.`,
      valueType: "boolean",
      defaultValue: true,
    },
    noScrollbarGutters: {
      description:
        "This boolean property specifies whether the scrollbar gutters should be hidden.",
      valueType: "boolean",
      defaultValue: false,
    },
    defaultTone: {
      description: 'This property sets the app\'s default tone ("light" or "dark").',
      valueType: "string",
      defaultValue: "light",
      availableValues: ["light", "dark"],
    },
    defaultTheme: {
      description: "This property sets the app's default theme.",
      valueType: "string",
      defaultValue: "xmlui",
    },
  },
  events: {
    ready: d(`This event fires when the \`${COMP}\` component finishes rendering on the page.`),
  },
  themeVars: parseScssVar(styles.themeVars),
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
    [`width-navPanel-${COMP}`]: "$space-64",
    [`backgroundColor-navPanel-${COMP}`]: "$backgroundColor",
    [`maxWidth-content-${COMP}`]: "$maxWidth-content",
    [`boxShadow-header-${COMP}`]: "$boxShadow-spread",
    [`boxShadow-navPanel-${COMP}`]: "$boxShadow-spread",
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

function AppNode({ node, extractValue, renderChild, style, lookupEventHandler }) {
  // --- Use ref to track if we've already processed the navigation to avoid duplicates in strict mode
  const processedNavRef = useRef(false);

  // --- Memoize the layout type to avoid unnecessary re-extraction
  const layoutType = useMemo(
    () => extractValue(node.props.layout),
    [node.props.layout, extractValue],
  );

  // --- Memoize helper functions that are used in multiple places

  // --- Parse a string into hierarchy labels, handling escaped pipe characters
  const parseHierarchyLabels = useMemo(() => {
    // Cache to hold previously computed results
    const cache = new Map<string, string[]>();

    return (labelText: string): string[] => {
      // Return cached result if we've seen this input before
      if (cache.has(labelText)) {
        return cache.get(labelText)!;
      }

      const result: string[] = [];
      let currentLabel = "";
      let escaped = false;

      for (let i = 0; i < labelText.length; i++) {
        const char = labelText[i];

        if (escaped) {
          // --- If this character was escaped, just add it literally
          currentLabel += char;
          escaped = false;
        } else if (char === "\\") {
          // --- Start of an escape sequence
          escaped = true;
        } else if (char === "|") {
          // --- Unescaped pipe indicates hierarchy separator
          result.push(currentLabel.trim());
          currentLabel = "";
        } else {
          // --- Regular character
          currentLabel += char;
        }
      }

      // --- Don't forget to add the last segment
      if (currentLabel.length > 0) {
        result.push(currentLabel.trim());
      }

      // Cache the result
      cache.set(labelText, result);

      return result;
    };
  }, []);

  // --- Helper function to check if a label exists in the navigation hierarchy
  const labelExistsInHierarchy = useMemo(() => {
    // Cache for previously checked labels within a hierarchy
    const cache = new Map<string, boolean>();

    return (searchLabel: string, hierarchy: any[]): boolean => {
      // Create a cache key (could be improved with a better serialization of hierarchy)
      const cacheKey = searchLabel + "_" + hierarchy.length;

      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      const result = hierarchy.some((node) => {
        if (node.label === searchLabel) {
          return true;
        }

        if (node.children && node.children.length > 0) {
          return labelExistsInHierarchy(searchLabel, node.children);
        }

        return false;
      });

      cache.set(cacheKey, result);
      return result;
    };
  }, []);

  // --- Helper function to find or create NavGroups in the hierarchy
  const findOrCreateNavGroup = useMemo(() => {
    return (navItems: any[], groupLabel: string): any => {
      // --- Check if a NavGroup with this label already exists
      const existingGroup = navItems.find(
        (item) => item.type === "NavGroup" && item.props?.label === groupLabel,
      );

      if (existingGroup) {
        return existingGroup;
      }

      // --- Create a new NavGroup and add it to the array
      const newGroup = {
        type: "NavGroup",
        props: {
          label: groupLabel,
        },
        children: [],
      };

      navItems.push(newGroup);
      return newGroup;
    };
  }, []);

  const { AppHeader, Footer, NavPanel, Pages, restChildren } = useMemo(() => {
    let AppHeader: ComponentDef;
    let Footer: ComponentDef;
    let NavPanel: ComponentDef;
    let Pages: ComponentDef;
    const restChildren: any[] = [];
    node.children?.forEach((rootChild) => {
      let transformedChild = { ...rootChild };
      if (rootChild.type === "Theme") {
        transformedChild.children = rootChild.children?.filter((child) => {
          if (child.type === "AppHeader") {
            AppHeader = {
              ...rootChild,
              children: [child],
            };
            return false;
          } else if (child.type === "Footer") {
            Footer = {
              ...rootChild,
              children: [child],
            };
            return false;
          } else if (child.type === "NavPanel") {
            NavPanel = {
              ...rootChild,
              children: [child],
            };
            return false;
          }
          return true;
        });
        if (!transformedChild.children.length) {
          transformedChild = null;
        }
      }
      if (rootChild.type === "AppHeader") {
        AppHeader = rootChild;
      } else if (rootChild.type === "Footer") {
        Footer = rootChild;
      } else if (rootChild.type === "NavPanel") {
        NavPanel = rootChild;
      } else if (rootChild.type === "Pages") {
        Pages = rootChild;
        restChildren.push(transformedChild);
      } else if (transformedChild !== null) {
        restChildren.push(transformedChild);
      }
    });

    // --- Check if there is any extra NavPanel in Pages
    const extraNavs = extractNavPanelFromPages(
      Pages,
      NavPanel,
      processedNavRef,
      extractValue,
      parseHierarchyLabels,
      labelExistsInHierarchy,
      findOrCreateNavGroup,
    );

    // --- If we found extra navigation items
    if (extraNavs?.length) {
      if (NavPanel) {
        // --- Create a new NavPanel with combined children instead of mutating the existing one
        NavPanel = {
          ...NavPanel,
          children: NavPanel.children ? [...NavPanel.children, ...extraNavs] : extraNavs,
        };
      } else {
        // --- Create a new NavPanel component definition if none exists
        NavPanel = {
          type: "NavPanel",
          props: {},
          children: extraNavs,
        };
      }
    }

    return {
      AppHeader,
      Footer,
      NavPanel,
      Pages,
      restChildren,
    };
  }, [
    node.children,
    extractValue,
    parseHierarchyLabels,
    labelExistsInHierarchy,
    findOrCreateNavGroup,
  ]);

  // --- Memoize all app props to prevent unnecessary re-renders
  const appProps = useMemo(
    () => ({
      scrollWholePage: extractValue.asOptionalBoolean(node.props.scrollWholePage, true),
      noScrollbarGutters: extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false),
      style,
      layout: layoutType,
      loggedInUser: extractValue(node.props.loggedInUser),
      onReady: lookupEventHandler("ready"),
      name: extractValue(node.props.name),
      logo: extractValue(node.props.logo),
      logoDark: extractValue(node.props["logo-dark"]),
      logoLight: extractValue(node.props["logo-light"]),
      defaultTone: extractValue(node.props.defaultTone),
      defaultTheme: extractValue(node.props.defaultTheme),
    }),
    [
      extractValue,
      layoutType,
      lookupEventHandler,
      node.props.loggedInUser,
      node.props.noScrollbarGutters,
      node.props.scrollWholePage,
      node.props.name,
      node.props.logo,
      node.props["logo-dark"],
      node.props["logo-light"],
      node.props.defaultTone,
      node.props.defaultTheme,
      style,
    ],
  );

  // Memoize the rendered children to prevent unnecessary re-renders
  const renderedHeader = useMemo(() => renderChild(AppHeader), [AppHeader, renderChild]);
  const renderedFooter = useMemo(() => renderChild(Footer), [Footer, renderChild]);
  const renderedNavPanel = useMemo(() => renderChild(NavPanel), [NavPanel, renderChild]);
  const renderedContent = useMemo(() => renderChild(restChildren), [restChildren, renderChild]);

  return (
    <App
      {...appProps}
      header={renderedHeader}
      footer={renderedFooter}
      navPanel={renderedNavPanel}
      navPanelDef={NavPanel}
      logoContentDef={node.props.logoTemplate}
      renderChild={renderChild}
    >
      {renderedContent}
      <SearchIndexCollector Pages={Pages} renderChild={renderChild} />
    </App>
  );
}

const HIDDEN_STYLE = {
  display: "none",
  position: "absolute",
  isolation: "isolate",
  pointerEvents: "none",
};

function SearchIndexCollector({ Pages, renderChild }) {
  const appContext = useAppContext();
  const indexerContextValue = useMemo(() => {
    return {
      indexing: true,
    };
  }, []);

  let memoedChildren = useMemo(()=>Pages?.children.map((child, i) =>
    child.type === "Page" &&
    !child.props?.url?.includes("*") &&
    !child.props?.url?.includes(":") ? (
      <PageIndexer Page={child} renderChild={renderChild} key={i} />
    ) : null,
  ), [Pages?.children, renderChild]);

  if(!appContext.appGlobals?.searchIndexEnabled){
    return null;
  }

  return (
    <IndexerContext.Provider value={indexerContextValue}>
      {createPortal(
        <div style={HIDDEN_STYLE}>
          {memoedChildren}
        </div>,
        document.body,
      )}
    </IndexerContext.Provider>
  );
}

function PageIndexer({
  Page,
  renderChild,
}: {
  Page: ComponentDef<typeof PageMd>;
  renderChild: RenderChildFn;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageUrl = Page.props?.url || "";
  const [collected, setCollected] = useState(false);
  const searchContextUpdater = useSearchContextUpdater();

  const [inProgress, startTransition] = useTransition();

  console.log("Starting indexing for page:", pageUrl, "in progress:", inProgress);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if(hydrated){
      // console.log("Indexing page:", pageUrl);
      // console.log("Content:", contentRef.current?.textContent || "No content");

      // 1. Clone the div to avoid modifying the original
      const clone = contentRef.current.cloneNode(true);

      // 2. Find and remove <style> and <script> elements from the clone
      const elementsToRemove = clone.querySelectorAll('style, script');
      elementsToRemove.forEach(el => el.remove());

      // 3. Get the textContent from the cleaned clone
      //    textContent is generally preferred for raw text.
      //    Using .trim() to remove leading/trailing whitespace and .replace(/\s+/g, ' ') to normalize multiple spaces.
      const textContent =  (clone.textContent || "").trim().replace(/\s+/g, ' ');

      const entry = {
        title: contentRef.current?.querySelector("h1")?.innerText || "",
        content: textContent,
        path: pageUrl
      }

      searchContextUpdater(entry);
      startTransition(() => {
        setCollected(true);
      });
    }
  }, [hydrated, pageUrl, searchContextUpdater]);

  if(!hydrated){
    return null;
  }

  if (collected) {
    return null;
  }

  return (
    <div ref={contentRef}>
      {renderChild(Page.children)}
    </div>
  );
}

export const appRenderer = createComponentRenderer(
  COMP,
  AppMd,
  ({ node, extractValue, renderChild, layoutCss, lookupEventHandler }) => {
    return (
      <AppNode
        node={node}
        renderChild={renderChild}
        extractValue={extractValue}
        style={layoutCss}
        lookupEventHandler={lookupEventHandler}
      />
    );
  },
);

// --- Process the entire navigation tree recursively and build hierarchy
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

// --- Extract navigation panel items from Pages component
function extractNavPanelFromPages(
  Pages: ComponentDef,
  NavPanel: ComponentDef | undefined,
  processedNavRef: React.MutableRefObject<boolean>,
  extractValue: (value: any) => any,
  parseHierarchyLabels: (labelText: string) => string[],
  labelExistsInHierarchy: (searchLabel: string, hierarchy: NavHierarchyNode[]) => boolean,
  findOrCreateNavGroup: (navItems: ComponentDef[], groupLabel: string) => ComponentDef,
): ComponentDef[] | null {
  // --- Skip extraction if we've already processed this navigation structure
  // --- This prevents duplicate items when React renders twice in strict mode
  if (!Pages || processedNavRef.current) return null;

  // --- Mark as processed
  processedNavRef.current = true;

  const extraNavs: ComponentDef[] = [];

  // --- Root of navigation hierarchy
  const navigationHierarchy: NavHierarchyNode[] = [];

  // --- Start processing the navigation tree if NavPanel exists
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

      // --- Skip if we have no labels
      if (hierarchyLabels.length === 0) {
        return;
      }

      // --- For a single level, just add a NavLink directly
      if (hierarchyLabels.length === 1) {
        // --- Check if this exact NavLink already exists in the navigation hierarchy
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

        // --- Initialize children array if it doesn't exist
        if (!navGroup.children) {
          navGroup.children = [];
        }

        // --- Move to the next level
        currentLevel = navGroup.children;
      }

      // --- Add the leaf NavLink to the deepest NavGroup
      const leafLabel = hierarchyLabels[hierarchyLabels.length - 1];

      // --- Check if this NavLink already exists at this level
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
