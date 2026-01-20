import React, { forwardRef, type ReactNode, useEffect } from "react";
import classnames from "classnames";

import styles from "./NavPanel.module.scss";
import { Scroller, type ScrollStyle } from "../ScrollViewer/Scroller";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { Logo } from "../Logo/LogoNative";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { getAppLayoutOrientation } from "../App/AppNative";
import { useLinkInfoContext } from "../App/LinkInfoContext";

// Define navigation hierarchy node structure
export interface NavHierarchyNode {
  /** The type of navigation node - either a clickable link or a grouping container */
  type: "NavLink" | "NavGroup";

  /** The display label/text for this navigation item */
  label: string;

  /** The URL/route path for navigation (only present for NavLink types) */
  to?: string;

  /** Child navigation nodes nested under this node (only present for NavGroup types) */
  children?: NavHierarchyNode[];

  /** Reference to the immediate parent node in the hierarchy (undefined for root-level nodes) */
  parent?: NavHierarchyNode;

  /** Array of ancestor nodes from root to this node, excluding this node itself (empty for root-level nodes) */
  pathSegments?: NavHierarchyNode[];

  /** Reference to the previous NavLink in the flattened navigation order */
  prevLink?: NavHierarchyNode;

  /** Reference to the next NavLink in the flattened navigation order */
  nextLink?: NavHierarchyNode;

  /** True if this is the first NavLink within its immediate parent container */
  firstLink?: boolean;

  /** True if this is the last NavLink within its immediate parent container */
  lastLink?: boolean;
}

// Function to build navigation hierarchy from component children
export function buildNavHierarchy(
  children: any[] | undefined,
  extractValue: any,
  parent?: NavHierarchyNode,
  pathSegments: NavHierarchyNode[] = [],
): NavHierarchyNode[] {
  if (!children) return [];

  const hierarchy: NavHierarchyNode[] = [];

  // Skip non-object children
  children
    .filter((child) => child && typeof child === "object")
    .forEach((child) => {
      if (child.type === "NavLink") {
        const label =
          extractValue.asOptionalString?.(child.props?.label) || extractValue(child.props?.label);
        const to =
          extractValue.asOptionalString?.(child.props?.to) || extractValue(child.props?.to);

        // Handle case where label might not be in props but in children as text
        let finalLabel = label;
        if (!finalLabel && child.children?.length === 1 && child.children[0].type === "TextNode") {
          finalLabel = extractValue(child.children[0].props?.value);
        }

        // Only include NavLinks that have both label and to values
        if (finalLabel && to) {
          const node: NavHierarchyNode = {
            type: "NavLink",
            label: finalLabel,
            to: to,
            parent: parent,
            pathSegments: [...pathSegments],
          };
          hierarchy.push(node);
        }
      } else if (child.type === "NavGroup") {
        const label =
          extractValue.asOptionalString?.(child.props?.label) || extractValue(child.props?.label);

        // NavGroups only need a label, no "to" value required
        if (label) {
          const groupNode: NavHierarchyNode = {
            type: "NavGroup",
            label: label,
            parent: parent,
            pathSegments: [...pathSegments],
            children: [],
          };

          // Build children with this groupNode as parent and updated path
          const newPathSegments = [...pathSegments, groupNode];
          groupNode.children = buildNavHierarchy(
            child.children,
            extractValue,
            groupNode,
            newPathSegments,
          );
          hierarchy.push(groupNode);
        } else if (child.children && child.children.length > 0) {
          // If no label but has children, process them at the current level with same parent and path
          hierarchy.push(...buildNavHierarchy(child.children, extractValue, parent, pathSegments));
        }
      } else if (child.children && child.children.length > 0) {
        //console.log("CN", child.children);
        // Process any children that might contain NavGroup and NavLink components recursively
        const nestedNodes = buildNavHierarchy(child.children, extractValue, parent, pathSegments);
        if (nestedNodes.length > 0) {
          hierarchy.push(...nestedNodes);
        }
      }
    });

  // Set navigation properties after building the hierarchy
  setNavigationProperties(hierarchy);
  return hierarchy;
}

// Helper function to set navigation properties (prevLink, nextLink, firstLink, lastLink)
function setNavigationProperties(hierarchy: NavHierarchyNode[]) {
  // Collect all NavLinks in traversal order
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

  // Set prevLink and nextLink for all NavLinks
  allNavLinks.forEach((link, index) => {
    if (index > 0) {
      link.prevLink = allNavLinks[index - 1];
    }
    if (index < allNavLinks.length - 1) {
      link.nextLink = allNavLinks[index + 1];
    }
  });

  // Set firstLink and lastLink properties
  function setFirstLastProperties(nodes: NavHierarchyNode[]) {
    const navLinks = nodes.filter((node) => node.type === "NavLink");

    if (navLinks.length > 0) {
      navLinks[0].firstLink = true;
      navLinks[navLinks.length - 1].lastLink = true;
    }

    // Recursively process children
    nodes.forEach((node) => {
      if (node.children) {
        setFirstLastProperties(node.children);
      }
    });
  }

  setFirstLastProperties(hierarchy);
}

// Function to build a map of NavLinks by their "to" property
export function buildLinkMap(
  navLinks: NavHierarchyNode[] | undefined,
): Map<string, NavHierarchyNode> {
  const linkMap = new Map<string, NavHierarchyNode>();

  if (!navLinks) return linkMap;

  function processNodes(nodes: NavHierarchyNode[]) {
    nodes.forEach((node) => {
      if (node.type === "NavLink" && node.to) {
        // If multiple items use the same "to" value, the last wins
        linkMap.set(node.to, node);
      }
      if (node.children) {
        processNodes(node.children);
      }
    });
  }

  processNodes(navLinks);
  return linkMap;
}

// Default props for NavPanel component
export const defaultProps = {
  inDrawer: false,
  scrollStyle: "normal" as ScrollStyle,
};

interface INavPanelContext {
  inDrawer: boolean;
}

export const NavPanelContext = React.createContext<INavPanelContext | null>(null);

const contextValue = {
  inDrawer: true,
};

function DrawerNavPanel({
  logoContent,
  children,
  className,
  style,
  scrollStyle = defaultProps.scrollStyle,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  scrollStyle?: ScrollStyle;
}) {
  return (
    <NavPanelContext.Provider value={contextValue}>
      <div {...rest} className={classnames(styles.wrapper, className)} style={style}>
        <div className={classnames(styles.logoWrapper, styles.inDrawer)}>
          {logoContent || <Logo />}
        </div>
        <Scroller className={styles.wrapperInner} style={style} scrollStyle={scrollStyle}>
          {children}
        </Scroller>
      </div>
    </NavPanelContext.Provider>
  );
}

type Props = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  inDrawer?: boolean;
  renderChild: RenderChildFn;
  navLinks?: NavHierarchyNode[];
  scrollStyle?: ScrollStyle;
};

export const NavPanel = forwardRef(function NavPanel(
  {
    children,
    style,
    logoContent,
    className,
    inDrawer = defaultProps.inDrawer,
    renderChild,
    navLinks,
    scrollStyle = defaultProps.scrollStyle,
    ...rest
  }: Props,
  forwardedRef: React.ForwardedRef<any>,
) {
  const appLayoutContext = useAppLayoutContext();
  const linkInfoContext = useLinkInfoContext();
  const horizontal = getAppLayoutOrientation(appLayoutContext?.layout) === "horizontal";
  const showLogo =
    appLayoutContext?.layout === "vertical" || appLayoutContext?.layout === "vertical-sticky";
  const isCondensed = appLayoutContext?.layout?.startsWith("condensed");
  const vertical = appLayoutContext?.layout?.startsWith("vertical");
  const safeLogoContent = logoContent || renderChild(appLayoutContext?.logoContentDef);

  // Register the linkMap when navLinks change
  const registerLinkMap = linkInfoContext?.registerLinkMap;
  useEffect(() => {
    if (registerLinkMap && navLinks) {
      const linkMap = buildLinkMap(navLinks);
      registerLinkMap(linkMap);
    }
  }, [navLinks, registerLinkMap]);

  if (inDrawer) {
    return (
      <DrawerNavPanel {...rest} style={style} logoContent={safeLogoContent} className={className} scrollStyle={scrollStyle}>
        {children}
      </DrawerNavPanel>
    );
  }

  return (
    <div
      {...rest}
      ref={forwardedRef}
      className={classnames(styles.wrapper, className, {
        [styles.horizontal]: horizontal,
        [styles.vertical]: vertical,
        [styles.condensed]: isCondensed,
      })}
      style={style}
    >
      {showLogo && (
        <div className={classnames(styles.logoWrapper)}>{safeLogoContent || <Logo />}</div>
      )}
      <Scroller className={styles.wrapperInner} style={style} scrollStyle={scrollStyle}>
        {children}
      </Scroller>
    </div>
  );
});
