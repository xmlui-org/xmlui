/**
 * Utility functions for the Overview component.
 * Pure helpers (context passed as arguments) so they can be registered as app-context
 * globals and used from any component, including custom Overview implementations.
 */

export type LinkInfo = { to?: string; label?: string; description?: string; children?: LinkInfo[]; icon?: string };
export type NavSection = { items?: LinkInfo[] };
export type NavSections = Record<string, NavSection>;
export type MediaSize = { sizeIndex: number };

/**
 * Recursively find the first item in items (and their children) that matches the predicate.
 */
export function findNavItem<T extends { children?: T[] }>(
  items: T[] | undefined,
  predicate: (item: T) => boolean,
): T | null {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (predicate(item)) return item;
    const nestedMatch = findNavItem(item?.children as T[] | undefined, predicate);
    if (nestedMatch) return nestedMatch;
  }
  return null;
}

/**
 * Get the nav group (section) that contains the given linkInfo.
 */
export function getNavGroup(linkInfo: LinkInfo | undefined, navSections: NavSections | undefined): LinkInfo | null {
  const navRoots = Object.values(navSections || {}).flatMap((section) => section?.items || []);
  if (linkInfo?.to) {
    const byTo = findNavItem(navRoots, (item) => (item as LinkInfo)?.to === linkInfo.to);
    if (byTo) return byTo as LinkInfo;
  }
  return findNavItem(navRoots, (item) => (item as LinkInfo)?.label === linkInfo?.label) as LinkInfo | null;
}

/**
 * Get top-level children for the current link: either the nav group's children or linkInfo.children.
 */
export function getTopLevelChildren(linkInfo: LinkInfo | undefined, navSections: NavSections | undefined): LinkInfo[] {
  const navGroup = getNavGroup(linkInfo, navSections);
  return navGroup?.children || linkInfo?.children || [];
}

/**
 * Get page description from nav group or linkInfo.
 */
export function getPageDescription(linkInfo: LinkInfo | undefined, navSections: NavSections | undefined): string | undefined {
  const navGroup = getNavGroup(linkInfo, navSections);
  return navGroup?.description || linkInfo?.description;
}

/**
 * Get root-level links (items with a `to` property) for the current page.
 */
export function getRootLinks(linkInfo: LinkInfo | undefined, navSections: NavSections | undefined): LinkInfo[] {
  return getTopLevelChildren(linkInfo, navSections).filter((item) => item?.to);
}

/**
 * Card width as percentage based on media size index.
 */
export function getCardWidth(mediaSize: MediaSize | undefined): string {
  if (!mediaSize) return "100%";
  if (mediaSize.sizeIndex > 4) return "33.3%";
  if (mediaSize.sizeIndex > 2) return "50%";
  return "100%";
}

/**
 * Resolve icon for a card item: item.icon or lookup in navSections by to/label.
 */
export function getCardIcon(item: LinkInfo | undefined, navSections: NavSections | undefined): string {
  if (item?.icon) return item.icon;
  const navRoots = Object.values(navSections || {}).flatMap((section) => section?.items || []);
  const navItem = findNavItem(navRoots as LinkInfo[], (candidate) => {
    const c = candidate as LinkInfo;
    if (item?.to && c?.to) return c.to === item.to;
    return c?.label === item?.label;
  });
  return (navItem as LinkInfo | null)?.icon || "";
}
