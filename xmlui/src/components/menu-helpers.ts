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
