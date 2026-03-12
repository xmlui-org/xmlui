import type { LayoutContext } from "./RendererDefs";

/**
 * Creates a new LayoutContext that represents a child layout boundary relative to
 * an optional parent context.
 *
 * - `depth` is set to `parent.depth + 1` (or `0` if there is no parent).
 * - `parent` is linked to the provided parent context.
 * - All other fields come from `fields`.
 *
 * Use this whenever a component establishes a new layout for its children (e.g.,
 * a Stack, a Table, a Card) rather than constructing a plain object literal.
 *
 * @param parent - The enclosing layout context, or `undefined` for a root context.
 * @param fields - Layout-specific fields for this new context level.
 */
export function createChildLayoutContext(
  parent: LayoutContext | undefined,
  fields: Omit<LayoutContext, "depth" | "parent">,
): LayoutContext {
  return {
    ...fields,
    depth: (parent?.depth ?? -1) + 1,
    parent,
  };
}
