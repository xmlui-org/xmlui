import styles from "./App2.module.scss";
import drawerStyles from "./Sheet.module.scss";

import { type ComponentDef } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { createMetadata, dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "../App/AppLayoutContext";
import { App2 as App2Component, defaultProps } from "./App2Native";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { PageMd } from "../Pages/Pages";
import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { IndexerContext } from "./IndexerContext";
import { createPortal } from "react-dom";
import { useAppContext } from "../../components-core/AppContext";
import { useSearchContextSetIndexing, useSearchContextUpdater } from "./SearchContext";

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

  // --- Memoize the layout type to avoid unnecessary re-extraction
  const layoutType = useMemo(
    () => extractValue(node.props.layout),
    [node.props.layout, extractValue],
  );

  // --- Create helper function instances for this component
  const parseHierarchyLabels = useMemo(() => createParseHierarchyLabels(), []);
  const labelExistsInHierarchy = useMemo(() => createLabelExistsInHierarchy(), []);

  // --- Extract app components and enhance NavPanel with page navigation
  const extracted = useMemo(
    () => extractAppComponents(node.children),
    [node.children]
  );

  const enhancedNavPanel = useMemo(
    () => enhanceNavPanelWithPageNav(
      extracted,
      processedNavRef,
      extractValue,
      parseHierarchyLabels,
      labelExistsInHierarchy,
      findOrCreateNavGroup,
    ),
    [extracted, extractValue, parseHierarchyLabels, labelExistsInHierarchy]
  );

  const { AppHeader, Footer, Pages, restChildren } = extracted;
  const NavPanel = enhancedNavPanel;

  const applyDefaultContentPadding= !Pages;

  // Extract sticky property from Footer component
  const footerSticky = useMemo(() => {
    if (!Footer) return true;
    
    // Check if Footer is wrapped in Theme
    let footerNode = Footer;
    if (Footer.type === "Theme" && Footer.children?.length > 0) {
      footerNode = Footer.children.find((child) => child.type === "Footer");
    }
    
    if (footerNode?.type === "Footer" && footerNode.props?.sticky !== undefined) {
      return extractValue.asOptionalBoolean(footerNode.props.sticky, true);
    }
    
    return true;
  }, [Footer, extractValue]);

  // --- Memoize all app props to prevent unnecessary re-renders
  const appProps = useMemo(
    () => ({
      scrollWholePage: extractValue.asOptionalBoolean(node.props.scrollWholePage, true),
      noScrollbarGutters: extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false),
      className,
      layout: layoutType,
      loggedInUser: extractValue(node.props.loggedInUser),
      onReady: lookupEventHandler("ready"),
      onMessageReceived: lookupEventHandler("messageReceived"),
      name: extractValue(node.props.name),
      logo: extractValue(node.props.logo),
      logoDark: extractValue(node.props["logo-dark"]),
      logoLight: extractValue(node.props["logo-light"]),
      defaultTone: extractValue(node.props.defaultTone),
      defaultTheme: extractValue(node.props.defaultTheme),
      autoDetectTone: extractValue.asOptionalBoolean(node.props.autoDetectTone, false),
      applyDefaultContentPadding,
      footerSticky,
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
      node.props.autoDetectTone,
      className,
      applyDefaultContentPadding,
      footerSticky,
    ],
  );

  // Memoize the rendered children to prevent unnecessary re-renders
  const renderedHeader = useMemo(() => renderChild(AppHeader), [AppHeader, renderChild]);
  const renderedFooter = useMemo(() => renderChild(Footer), [Footer, renderChild]);
  const renderedNavPanel = useMemo(() => renderChild(NavPanel), [NavPanel, renderChild]);
  const renderedContent = useMemo(() => renderChild(restChildren), [restChildren, renderChild]);

  return (
    <App2Component
      {...appProps}
      header={renderedHeader}
      footer={renderedFooter}
      footerSticky={footerSticky}
      navPanel={renderedNavPanel}
      navPanelDef={NavPanel}
      logoContentDef={node.props.logoTemplate}
      renderChild={renderChild}
      registerComponentApi={registerComponentApi}
    >
      {renderedContent}
      <SearchIndexCollector Pages={Pages} renderChild={renderChild} />
    </App2Component>
  );
}

const HIDDEN_STYLE: CSSProperties = {
  position: "absolute",
  top: "-9999px",
  display: "none",
};

const indexerContextValue = {
  indexing: true,
};

function SearchIndexCollector({ Pages, renderChild }) {
  const appContext = useAppContext();
  const setIndexing = useSearchContextSetIndexing();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true); // Ensure document.body is available

    return () => {
      setIndexing(false);
    };
  }, [setIndexing]);

  // 1. Memoize the list of pages to be indexed
  const pagesToIndex = useMemo(() => {
    return (
      Pages?.children?.filter(
        (child) =>
          child.type === "Page" && // Ensure 'Page' matches your actual component type name
          child.props?.url && // Ensure URL exists
          !child.props.url.includes("*") &&
          !child.props.url.includes(":"),
      ) || []
    );
  }, [Pages?.children]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDoneIndexing, setIsDoneIndexing] = useState(false);
  const [, startTransitionParent] = useTransition(); // Transition for parent updates

  const handlePageIndexed = useCallback(() => {
    startTransitionParent(() => {
      // Transition the update to the next page
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= pagesToIndex.length) {
          // console.log("All pages indexed.");
          setIsDoneIndexing(true); // All pages processed
        }
        return nextIndex;
      });
    });
  }, [pagesToIndex.length]); // Recreate if the total number of pages changes

  if (!appContext.appGlobals?.searchIndexEnabled || isDoneIndexing || !isClient) {
    return null;
  }

  const currentPageToProcess = pagesToIndex[currentIndex];

  if (!currentPageToProcess) {
    // This can happen if pagesToIndex is empty or currentIndex went out of bounds unexpectedly.
    // Setting isDoneIndexing if pagesToIndex is empty initially.
    if (pagesToIndex.length === 0 && currentIndex === 0 && !isDoneIndexing) {
      setIsDoneIndexing(true);
    }
    return null;
  }

  return (
    <IndexerContext.Provider value={indexerContextValue}>
      {createPortal(
        <div style={HIDDEN_STYLE} aria-hidden="true">
          {/* Render only one PageIndexer at a time */}
          <PageIndexer
            Page={currentPageToProcess}
            renderChild={renderChild}
            onIndexed={handlePageIndexed}
            key={currentPageToProcess.props?.url || currentIndex} // Key ensures re-mount
          />
        </div>,
        document.body,
      )}
    </IndexerContext.Provider>
  );
}

function PageIndexer({
  Page,
  renderChild,
  onIndexed,
}: {
  Page: ComponentDef<typeof PageMd>; // Use the defined PageMdProps
  renderChild: RenderChildFn;
  onIndexed: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pageUrl = Page.props?.url || "";
  const navLabel = Page.props?.navLabel || "";
  const searchContextUpdater = useSearchContextUpdater();

  const [isContentRendered, setIsContentRendered] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [isProcessing, startTransition] = useTransition();

  // Effect 1: Schedule the rendering of the Page's children (low priority)
  useEffect(() => {
    // console.log(`PageIndexer (${pageUrl}): Scheduling content render.`);
    startTransition(() => {
      setIsContentRendered(true); // This will trigger rendering of Page.children
    });
  }, [pageUrl]); // Re-run if the Page prop itself changes identity (due to key in parent)

  // Effect 2: Extract content once Page.children is rendered and ref is available (low priority)
  useEffect(() => {
    if (isContentRendered && contentRef.current && !isCollected && !isProcessing) {
      // console.log(`PageIndexer (${pageUrl}): Content rendered, scheduling extraction.`);
      startTransition(() => {
        // console.log(`PageIndexer (${pageUrl}): Starting extraction...`);
        const currentContent = contentRef.current; // Capture ref value
        if (!currentContent) return;

        const clone = currentContent.cloneNode(true) as HTMLDivElement;
        const elementsToRemove = clone.querySelectorAll("style, script");
        elementsToRemove.forEach((el) => el.remove());
        const titleElement = clone.querySelector("h1");
        const title = titleElement
          ? titleElement.innerText
          : navLabel || pageUrl.split("/").pop() || pageUrl;
        titleElement?.remove(); // Remove title element from clone to avoid duplication
        const textContent = (clone.textContent || "").trim().replace(/\s+/g, " ");

        const entry = {
          title: title,
          content: textContent,
          path: pageUrl,
        };

        searchContextUpdater(entry);
        // console.log(`PageIndexer (${pageUrl}): Extraction complete, signaling parent.`);
        onIndexed(); // Signal completion to parent
        setIsCollected(true); // Mark as collected
      });
    }
  }, [
    isContentRendered,
    pageUrl,
    searchContextUpdater,
    onIndexed,
    isCollected,
    isProcessing,
    navLabel,
  ]); // Ensure all dependencies are listed

  // If this PageIndexer instance's work is done, or content not yet rendered, render nothing.
  // The parent (SearchIndexCollector) will unmount this and mount the next one.
  if (isCollected || !isContentRendered) {
    // console.log(`PageIndexer (${pageUrl}): Null render (isCollected: ${isCollected}, isContentRendered: ${isContentRendered})`);
    return null;
  }

  // This part renders when isContentRendered is true and isCollected is false.
  // The content needs to be in the DOM for contentRef.current to be populated.
  // console.log(`PageIndexer (${pageUrl}): Rendering content for ref population.`);
  return <div ref={contentRef}>{renderChild(Page.children)}</div>;
}

// --- Navigation Helper Functions ---

/**
 * Parse a string into hierarchy labels, handling escaped pipe characters.
 * Uses caching to avoid reprocessing the same label text.
 */
function createParseHierarchyLabels() {
  const cache = new Map<string, string[]>();

  return (labelText: string): string[] => {
    if (cache.has(labelText)) {
      return cache.get(labelText)!;
    }

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

    cache.set(labelText, result);
    return result;
  };
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
 * Enhance NavPanel with navigation items extracted from Pages component.
 * Returns the enhanced NavPanel or the original if no enhancement needed.
 */
function enhanceNavPanelWithPageNav(
  extracted: ExtractedComponents,
  processedRef: React.MutableRefObject<boolean>,
  extractValue: any,
  parseHierarchyLabels: ReturnType<typeof createParseHierarchyLabels>,
  labelExistsInHierarchy: ReturnType<typeof createLabelExistsInHierarchy>,
  findOrCreateNavGroup: (navItems: any[], groupLabel: string) => any
): ComponentDef | undefined {
  const { Pages, NavPanel } = extracted;

  // No Pages component or already processed
  if (!Pages) {
    return NavPanel;
  }

  // Extract navigation items from Pages
  const extraNavs = extractNavPanelFromPages(
    Pages,
    NavPanel,
    processedRef,
    extractValue,
    parseHierarchyLabels,
    labelExistsInHierarchy,
    findOrCreateNavGroup,
  );

  // No extra navigation items found
  if (!extraNavs?.length) {
    return NavPanel;
  }

  // Merge extra navigation items with existing NavPanel
  if (NavPanel) {
    return {
      ...NavPanel,
      children: NavPanel.children ? [...NavPanel.children, ...extraNavs] : extraNavs,
    };
  }

  // Create new NavPanel with extracted navigation items
  return {
    type: "NavPanel",
    props: {},
    children: extraNavs,
  };
}

/**
 * Creates a function that checks if a label exists in a navigation hierarchy.
 * Uses caching to avoid redundant searches.
 */
function createLabelExistsInHierarchy() {
  const cache = new Map<string, boolean>();

  return (searchLabel: string, hierarchy: any[]): boolean => {
    const cacheKey = searchLabel + "_" + hierarchy.length;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const labelExistsInHierarchy = createLabelExistsInHierarchy();
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
