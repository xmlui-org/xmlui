import styles from "./App.module.scss";

import { type ComponentDef, createMetadata, d } from "../../abstractions/ComponentDefs";
import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";

import { dComponent } from "../../components/metadata-helpers";
import { appLayoutMd } from "./AppLayoutContext";
import { App } from "./AppNative";
import { useMemo, useRef } from "react";

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
    "maxWidth‑content‑App":
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
  
  const { AppHeader, Footer, NavPanel, restChildren } = useMemo(() => {
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
    const extraNavs = extractNavPanelFromPages();
    
    // --- Create a new NavPanel with combined children instead of mutating the existing one
    if (extraNavs?.length && NavPanel) {
      NavPanel = {
        ...NavPanel,
        children: NavPanel.children ? [...NavPanel.children, ...extraNavs] : extraNavs
      };
    }

    return {
      AppHeader,
      Footer,
      NavPanel,
      restChildren,
    };

    function extractNavPanelFromPages(): ComponentDef[] | null {
      // --- Skip extraction if we've already processed this navigation structure
      // --- This prevents duplicate items when React renders twice in strict mode
      if (!Pages || processedNavRef.current) return null;
      if (!NavPanel?.children) return null;
      
      // --- Mark as processed
      processedNavRef.current = true;

      const extraNavs: ComponentDef[] = [];
      
      // --- Define a structure to represent navigation hierarchy
      interface NavHierarchyNode {
        type: string;
        label: string;
        path?: string;
        children?: NavHierarchyNode[];
      }
      
      // --- Root of navigation hierarchy
      const navigationHierarchy: NavHierarchyNode[] = [];
      
      // --- Start processing the navigation tree
      processNavItems(NavPanel.children, navigationHierarchy);
      
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
                  to: url
                }
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
          const existingNavLink = currentLevel.find(item => 
            item.type === "NavLink" && 
            item.props?.label === leafLabel
          );
          
          if (!existingNavLink) {
            currentLevel.push({
              type: "NavLink",
              props: {
                label: leafLabel,
                to: url
              }
            });
          }
        }
      });
      
      return extraNavs;
      
      // --- Helper functions moved below the return statement ---
      
      // --- Process the entire navigation tree recursively and build hierarchy
      function processNavItems(items: ComponentDef[], parentHierarchy: NavHierarchyNode[]) {
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
                path: itemPath ? extractValue(itemPath) : undefined
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
                children: []
              };
              
              // --- Add to parent hierarchy
              parentHierarchy.push(groupNode);
              
              // --- Recursively process children of the NavGroup
              if (navItem.children && navItem.children.length > 0) {
                processNavItems(navItem.children, groupNode.children);
              }
            } else if (navItem.children && navItem.children.length > 0) {
              // --- If no label but has children, still process them under parent
              processNavItems(navItem.children, parentHierarchy);
            }
          }
        });
      }

      // --- Helper function to check if a label exists in the navigation hierarchy
      function labelExistsInHierarchy(searchLabel: string, hierarchy: NavHierarchyNode[]): boolean {
        for (const node of hierarchy) {
          if (node.label === searchLabel) {
            return true;
          }
          
          if (node.children && node.children.length > 0) {
            if (labelExistsInHierarchy(searchLabel, node.children)) {
              return true;
            }
          }
        }
        return false;
      }

      // --- Parse a string into hierarchy labels, handling escaped pipe characters
      function parseHierarchyLabels(labelText: string): string[] {
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
        
        return result;
      }
      
      // --- Helper function to find or create NavGroups in the hierarchy
      function findOrCreateNavGroup(
        navItems: ComponentDef[], 
        groupLabel: string
      ): ComponentDef {
        // --- Check if a NavGroup with this label already exists
        const existingGroup = navItems.find(item => 
          item.type === "NavGroup" && 
          item.props?.label === groupLabel
        );
        
        if (existingGroup) {
          return existingGroup;
        }
        
        // --- Create a new NavGroup and add it to the array
        const newGroup: ComponentDef = {
          type: "NavGroup",
          props: {
            label: groupLabel
          },
          children: []
        };
        
        navItems.push(newGroup);
        return newGroup;
      }
    }
  }, [node.children]);

  const layoutType = extractValue(node.props.layout);

  return (
    <App
      scrollWholePage={extractValue.asOptionalBoolean(node.props.scrollWholePage, true)}
      noScrollbarGutters={extractValue.asOptionalBoolean(node.props.noScrollbarGutters, false)}
      style={style}
      layout={layoutType}
      loggedInUser={extractValue(node.props.loggedInUser)}
      onReady={lookupEventHandler("ready")}
      header={renderChild(AppHeader)}
      footer={renderChild(Footer)}
      navPanel={renderChild(NavPanel)}
      navPanelDef={NavPanel}
      logoContentDef={node.props.logoTemplate}
      renderChild={renderChild}
      name={extractValue(node.props.name)}
      logo={extractValue(node.props.logo)}
      logoDark={extractValue(node.props["logo-dark"])}
      logoLight={extractValue(node.props["logo-light"])}
      defaultTone={extractValue(node.props.defaultTone)}
      defaultTheme={extractValue(node.props.defaultTheme)}
    >
      {renderChild(restChildren)}
    </App>
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
