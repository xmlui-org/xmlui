import type { ReactElement, ReactNode } from "react";
import type { ComponentDef } from "../abstractions/ComponentDefs";

/**
 * Checks if a React element is a MenuSeparator.
 * Since children are wrapped in ComponentWrapper, we need to check the node.type prop.
 */
function isSeparatorElement(child: ReactNode): boolean {
  if (!child || typeof child !== "object" || !("props" in child)) {
    return false;
  }

  const element = child as ReactElement;
  
  // Check if this is a ComponentWrapper with node.type === "MenuSeparator"
  if (element.props && typeof element.props === "object" && "node" in element.props) {
    const node = (element.props as any).node as ComponentDef | undefined;
    if (node?.type === "MenuSeparator") {
      return true;
    }
  }

  // Fallback: check if element has role="separator" in its props
  // This catches cases where the separator is already rendered as a DOM element
  if (element.props?.role === "separator") {
    return true;
  }

  return false;
}

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
    const isSeparator = isSeparatorElement(child);

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
  if (filtered.length > 0 && isSeparatorElement(filtered[filtered.length - 1])) {
    filtered.pop();
  }

  return filtered;
}
