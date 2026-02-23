import type { ReactElement, ReactNode } from "react";
import type { ComponentDef } from "../abstractions/ComponentDefs";

/**
 * Helper function to filter out multiple adjacent MenuSeparator elements.
 * Keeps only one separator when multiple are adjacent.
 */
export function filterAdjacentSeparators(children: ComponentDef[] | undefined): ComponentDef[] {
  if (!children || children.length === 0) {
    return [];
  }

  const filtered: ComponentDef[] = [];
  let previousWasSeparator = false;

  for (const child of children) {
    const isSeparator = child.type === "MenuSeparator";

    // Only add the separator if the previous child was not a separator
    if (isSeparator) {
      if (!previousWasSeparator) {
        filtered.push(child);
      }
      previousWasSeparator = true;
    } else {
      filtered.push(child);
      previousWasSeparator = false;
    }
  }

  return filtered;
}

/**
 * Helper function to filter out multiple adjacent MenuSeparator elements from React children.
 * This operates on rendered React elements (after `when` conditions are evaluated).
 * Keeps only one separator when multiple are adjacent, and removes leading/trailing separators.
 * @param children - React children (can include nulls from conditional rendering)
 * @returns Filtered array of React nodes
 */
export function filterAdjacentSeparatorsFromChildren(children: ReactNode): ReactNode[] {
  if (!children) {
    return [];
  }

  // Convert children to array and filter out null/undefined/false values
  const childArray = Array.isArray(children) ? children : [children];
  const validChildren = childArray.filter((child) => child != null && child !== false);

  if (validChildren.length === 0) {
    return [];
  }

  const filtered: ReactNode[] = [];
  let previousWasSeparator = false;

  for (const child of validChildren) {
    // Check if this child is a separator by looking for role="separator"
    const isSeparator =
      child &&
      typeof child === "object" &&
      "props" in child &&
      (child as ReactElement).props?.role === "separator";

    if (isSeparator) {
      // Only add the separator if:
      // 1. The previous child was not a separator
      // 2. This is not the first item (no leading separators)
      if (!previousWasSeparator && filtered.length > 0) {
        filtered.push(child);
      }
      previousWasSeparator = true;
    } else {
      filtered.push(child);
      previousWasSeparator = false;
    }
  }

  // Remove trailing separator if present
  if (
    filtered.length > 0 &&
    filtered[filtered.length - 1] &&
    typeof filtered[filtered.length - 1] === "object" &&
    "props" in (filtered[filtered.length - 1] as ReactElement) &&
    (filtered[filtered.length - 1] as ReactElement).props?.role === "separator"
  ) {
    filtered.pop();
  }

  return filtered;
}
