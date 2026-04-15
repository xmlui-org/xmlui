import React, { forwardRef, type ReactNode, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import styles from "./NavPanel.module.scss";
import { ThemedScroller as Scroller, type ScrollStyle } from "../ScrollViewer/ScrollViewer";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import type { ComponentDef } from "../../abstractions/ComponentDefs";
import { ThemedLogo as Logo } from "../Logo/Logo";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { getAppLayoutOrientation } from "../App/AppNative";
import { useLinkInfoContext } from "../App/LinkInfoContext";
import { Part } from "../Part/Part";

export const PART_NAV_PANEL_FOOTER = "footer";

// Define navigation hierarchy node structure
export interface NavHierarchyNode {
  /** The type of navigation node - either a clickable link or a grouping container */
  type: "NavLink" | "NavGroup";

  /** The display label/text for this navigation item */
  label: string;

  /** The URL/route path for navigation (present for NavLink and optional for NavGroup) */
  to?: string;

  /** Child navigation nodes nested under this node (only present for NavGroup types) */
  children?: NavHierarchyNode[];

  /** Optional icon name associated with this navigation item */
  icon?: string;

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
  lookupCompoundComponent?: (name: string) => ComponentDef | undefined,
  visitedComponents: Set<string> = new Set(),
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
        const icon =
          extractValue.asOptionalString?.(child.props?.icon) || extractValue(child.props?.icon);

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
            icon: typeof icon === "string" ? icon : undefined,
            parent: parent,
            pathSegments: [...pathSegments],
          };
          hierarchy.push(node);
        }
      } else if (child.type === "NavGroup") {
        const label =
          extractValue.asOptionalString?.(child.props?.label) || extractValue(child.props?.label);
        const to =
          extractValue.asOptionalString?.(child.props?.to) || extractValue(child.props?.to);
        const icon =
          extractValue.asOptionalString?.(child.props?.icon) || extractValue(child.props?.icon);

        // NavGroups only need a label, no "to" value required
        if (label) {
          const groupNode: NavHierarchyNode = {
            type: "NavGroup",
            label: label,
            to: to,
            icon: typeof icon === "string" ? icon : undefined,
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
            lookupCompoundComponent,
            visitedComponents,
          );
          hierarchy.push(groupNode);
        } else if (child.children && child.children.length > 0) {
          // If no label but has children, process them at the current level with same parent and path
          hierarchy.push(
            ...buildNavHierarchy(
              child.children,
              extractValue,
              parent,
              pathSegments,
              lookupCompoundComponent,
              visitedComponents,
            ),
          );
        }
      } else if (child.children && child.children.length > 0) {
        //console.log("CN", child.children);
        // Process any children that might contain NavGroup and NavLink components recursively
        const nestedNodes = buildNavHierarchy(
          child.children,
          extractValue,
          parent,
          pathSegments,
          lookupCompoundComponent,
          visitedComponents,
        );
        if (nestedNodes.length > 0) {
          hierarchy.push(...nestedNodes);
        }
      } else if (lookupCompoundComponent) {
        // Check if this is a compound component
        const compoundComponent = lookupCompoundComponent(child.type);
        if (compoundComponent?.children) {
          // Cycle detection: skip if we've already visited this component
          if (visitedComponents.has(child.type)) {
            return hierarchy;
          }
          // Add current component to visited set for cycle detection
          visitedComponents.add(child.type);

          // Process the compound component's children
          const compoundNodes = buildNavHierarchy(
            compoundComponent.children,
            extractValue,
            parent,
            pathSegments,
            lookupCompoundComponent,
            visitedComponents,
          );
          if (compoundNodes.length > 0) {
            hierarchy.push(...compoundNodes);
          }
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

// Function to build a map of navigation nodes by their "to" property
export function buildLinkMap(
  navLinks: NavHierarchyNode[] | undefined,
): Map<string, NavHierarchyNode> {
  const linkMap = new Map<string, NavHierarchyNode>();

  if (!navLinks) return linkMap;

  function processNodes(nodes: NavHierarchyNode[]) {
    nodes.forEach((node) => {
      if (node.to) {
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
  showScrollerFade: true,
  syncWithContent: false,
  syncScrollBehavior: "smooth" as ScrollBehavior,
  syncScrollPosition: "center" as ScrollLogicalPosition,
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
  footerContent,
  children,
  className,
  classes,
  style,
  scrollStyle = defaultProps.scrollStyle,
  showScrollerFade = defaultProps.showScrollerFade,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  footerContent?: ReactNode;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
}) {
  const hasFooter = !!footerContent;
  return (
    <NavPanelContext.Provider value={contextValue}>
      <div
        {...rest}
        className={classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className, { [styles.hasFooter]: hasFooter })}
        style={style}
      >
        <div className={classnames(styles.logoWrapper, styles.inDrawer)}>
          {logoContent || <Logo />}
        </div>
        <Scroller
          className={styles.wrapperInner}
          style={style}
          scrollStyle={scrollStyle}
          showScrollerFade={showScrollerFade}
        >
          {children}
        </Scroller>
        {hasFooter && (
          <div className={styles.footer} data-part="footer">
            {footerContent}
          </div>
        )}
      </div>
    </NavPanelContext.Provider>
  );
}

type Props = {
  children: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  footerContent?: ReactNode;
  inDrawer?: boolean;
  renderChild: RenderChildFn;
  showScrollerFade?: boolean;
  navLinks?: NavHierarchyNode[];
  scrollStyle?: ScrollStyle;
  syncWithContent?: boolean;
  syncScrollBehavior?: ScrollBehavior;
  syncScrollPosition?: ScrollLogicalPosition;
};

export const NavPanel = forwardRef(function NavPanel(
  {
    children,
    style,
    logoContent,
    footerContent,
    className,
    classes,
    inDrawer = defaultProps.inDrawer,
    renderChild,
    navLinks,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    syncWithContent = defaultProps.syncWithContent,
    syncScrollBehavior = defaultProps.syncScrollBehavior,
    syncScrollPosition = defaultProps.syncScrollPosition,
    ...rest
  }: Props,
  forwardedRef: React.ForwardedRef<any>,
) {
  const appLayoutContext = useAppLayoutContext();
  const linkInfoContext = useLinkInfoContext();
  const localRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  // True when the current navigation was initiated by a click inside the NavPanel.
  // In that case the user already sees the clicked link, so we skip scrolling.
  const clickedInsideRef = useRef(false);

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [forwardedRef],
  );

  // Scroll the active NavLink into view when the route changes
  useEffect(() => {
    if (!syncWithContent || !localRef.current) return;

    // If the navigation was triggered by clicking inside the NavPanel the user
    // already sees the link — skip scrolling to avoid it jumping under the cursor.
    if (clickedInsideRef.current) {
      clickedInsideRef.current = false;
      return;
    }

    const panel = localRef.current;
    let scrolled = false;

    // Scrolls the leaf active link if it is not inside a collapsed NavGroup.
    // Returns true if scrolling was performed.
    //
    // Nav hierarchy: a NavGroup header also renders a NavLink with `to` that gets
    // `xmlui-navlink-active` on a prefix match. That header link has `aria-expanded`
    // on it (passed from ExpandableNavGroup). Leaf NavLinks never have `aria-expanded`.
    // We skip header links so we always scroll to the deepest/leaf active link.
    const findAndScrollToActiveLink = (): boolean => {
      const candidates = Array.from(panel.querySelectorAll(".xmlui-navlink-active"));
      // Find the leaf link: exclude NavGroup-header links (they have aria-expanded)
      const leafLink = candidates.find((el) => el.getAttribute("aria-expanded") === null);
      if (!leafLink) return false;
      // If the link is inside a still-collapsed NavGroup content (aria-hidden="true"),
      // the expansion animation hasn't finished yet — defer until transitionend.
      let el: Element | null = leafLink.parentElement;
      while (el && el !== panel) {
        if (el.getAttribute("aria-hidden") === "true") return false;
        el = el.parentElement;
      }
      leafLink.scrollIntoView({ block: syncScrollPosition, behavior: syncScrollBehavior });
      return true;
    };

    // Try immediately — works when the active link is in an already-expanded group
    if (findAndScrollToActiveLink()) {
      scrolled = true;
      return;
    }

    // Otherwise wait for the NavGroup CSS grid expansion (grid-template-rows, 0.3s)
    // to complete before scrolling to the leaf link.
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (scrolled || e.propertyName !== "grid-template-rows") return;
      if (findAndScrollToActiveLink()) {
        scrolled = true;
        panel.removeEventListener("transitionend", handleTransitionEnd);
      }
    };

    panel.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      panel.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [syncWithContent, syncScrollBehavior, syncScrollPosition, location.pathname]);
  const horizontal = getAppLayoutOrientation(appLayoutContext?.layout) === "horizontal";
  const showLogo =
    appLayoutContext?.layout === "vertical" || appLayoutContext?.layout === "vertical-sticky";
  const isCondensed = appLayoutContext?.layout?.startsWith("condensed");
  const vertical = appLayoutContext?.layout?.startsWith("vertical");
  const collapsed = !!appLayoutContext?.navPanelCollapsed && vertical;
  const safeLogoContent = logoContent || renderChild(appLayoutContext?.logoContentDef);
  // Footer only in vertical layouts: vertical, vertical-sticky, vertical-full-header
  const hasFooter = !!footerContent && vertical;

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
      <DrawerNavPanel
        {...rest}
        style={style}
        logoContent={safeLogoContent}
        footerContent={hasFooter ? footerContent : undefined}
        className={className}
        classes={classes}
        scrollStyle={scrollStyle}
        showScrollerFade={showScrollerFade}
      >
        {children}
      </DrawerNavPanel>
    );
  }

  const wrapperEl = (
    <div
      {...rest}
      ref={mergedRef}
      onMouseDown={() => { clickedInsideRef.current = true; }}
      className={classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className, {
        [styles.horizontal]: horizontal,
        [styles.vertical]: vertical,
        [styles.condensed]: isCondensed,
        [styles.hasFooter]: hasFooter,
        [styles.collapsed]: collapsed,
        [styles.overlayScroll]: scrollStyle !== "normal",
      })}
      style={style}
    >
      {showLogo && (
        <div className={classnames(styles.logoWrapper)}>{safeLogoContent || <Logo />}</div>
      )}
      <Scroller
        className={styles.wrapperInner}
        style={style}
        scrollStyle={scrollStyle}
        showScrollerFade={showScrollerFade}
      >
        {children}
      </Scroller>
      {hasFooter && (
        <Part partId={PART_NAV_PANEL_FOOTER}>
          <div
            className={classnames(styles.footer, {
              [styles.footerCollapsed]: collapsed,
            })}
          >
            {footerContent}
          </div>
        </Part>
      )}
    </div>
  );

  return wrapperEl;
});
