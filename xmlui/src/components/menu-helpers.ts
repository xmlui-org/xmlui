import type { ComponentDef } from "../abstractions/ComponentDefs";
import type { ValueExtractor } from "../abstractions/RendererDefs";

/**
 * Filters menu children to remove leading, trailing, and adjacent MenuSeparator elements,
 * taking into account dynamic `when` conditions evaluated via `extractValue`.
 *
 * This correctly handles cases where menu items are conditionally hidden at runtime:
 * separators adjacent to hidden items are removed as if those items were never there.
 *
 * When a `when` expression evaluates to `undefined` or `null` — which can happen when the
 * expression references a context variable (e.g. `$context`) that is not yet in scope at
 * filter time — the item is treated as **visible**.  This prevents incorrectly removing
 * separators around items that will be visible once the full rendering context is available.
 *
 * @param children The list of children to filter
 * @param extractValue The value extractor used to evaluate `when` expressions
 */
export function filterSeparators(
  children: ComponentDef[] | undefined,
  extractValue: ValueExtractor,
): ComponentDef[] {
  if (!children || children.length === 0) {
    return [];
  }

  // Evaluate visibility for each child based on its `when` condition.
  // If `when` evaluates to `undefined` or `null` (e.g. because the expression references
  // a context variable like `$context` that is not yet in scope at filter time), we treat
  // the item as **visible**.  Defaulting to visible is safer: separators around dynamically-
  // shown items are preserved, and the rendered output is correct once the full context is
  // available inside `renderChild`.
  const itemVisibility = children.map((child) => {
    let hiddenByWhen = false;
    if (child.when !== undefined) {
      const whenResult = extractValue(child.when);
      // Treat undefined/null as "can't determine yet → assume visible"
      hiddenByWhen = whenResult !== undefined && whenResult !== null && !whenResult;
    }
    return {
      child,
      isSeparator: child.type === "MenuSeparator",
      isVisible: !hiddenByWhen,
    };
  });

  // Build the filtered list: skip hidden items, collapse adjacent/leading separators
  const filtered: ComponentDef[] = [];
  let lastVisibleWasSeparator = false;

  for (const { child, isSeparator, isVisible } of itemVisibility) {
    if (!isVisible) continue;

    if (isSeparator) {
      if (!lastVisibleWasSeparator) {
        filtered.push(child);
        lastVisibleWasSeparator = true;
      }
      // else: skip duplicate adjacent separator
    } else {
      filtered.push(child);
      lastVisibleWasSeparator = false;
    }
  }

  // Remove trailing separator
  if (filtered.length > 0 && filtered[filtered.length - 1].type === "MenuSeparator") {
    filtered.pop();
  }

  return filtered;
}

/**
 * @deprecated Use {@link filterSeparators} with `extractValue` instead, which correctly
 * handles dynamic `when` conditions on menu items.
 *
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
