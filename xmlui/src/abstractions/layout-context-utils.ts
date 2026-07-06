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

/**
 * Returns the nesting depth of a layout context.
 * Returns `-1` when context is `undefined` (no layout boundary has been
 * established yet, i.e., the component is at the root level).
 */
export function getLayoutDepth(context: LayoutContext | undefined): number {
  return context?.depth ?? -1;
}

/**
 * Walks the `parent` chain and returns the first ancestor (inclusive of
 * `context` itself) whose `type` satisfies the predicate, or `undefined`
 * if none match.
 *
 * @param context  - The starting layout context.
 * @param predicate - Returns `true` for the ancestor you are looking for.
 */
export function findAncestorLayout(
  context: LayoutContext | undefined,
  predicate: (ctx: LayoutContext) => boolean,
): LayoutContext | undefined {
  let current = context;
  while (current !== undefined) {
    if (predicate(current)) return current;
    current = current.parent;
  }
  return undefined;
}

/**
 * Returns `true` when `context` or any of its ancestors has a `type` that
 * is included in `types`.
 *
 * @param context - The layout context to inspect.
 * @param types   - One or more layout type names to match against.
 */
export function isInsideLayout(
  context: LayoutContext | undefined,
  ...types: string[]
): boolean {
  const typeSet = new Set(types);
  return findAncestorLayout(context, (ctx) => typeSet.has(ctx.type ?? "")) !== undefined;
}

/**
 * Returns an ordered array of layout `type` strings from the root down to
 * `context`, e.g. `["Stack", "Table", "TableCell"]`.
 * Entries whose `type` is `undefined` are recorded as `""`.
 */
export function getLayoutPath(context: LayoutContext | undefined): string[] {
  const path: string[] = [];
  let current = context;
  while (current !== undefined) {
    path.unshift(current.type ?? "");
    current = current.parent;
  }
  return path;
}

/**
 * Returns a copy of `context` with direct-child-only properties removed.
 * `ignoreLayoutProps`, `wrapChild`, and `extraClassName` are meant for immediate
 * children of a layout container and must not leak through component boundaries
 * when the context is used as a fallback for transparent wrapper components.
 */
export function stripDirectChildProps(
  context: LayoutContext | undefined,
): LayoutContext | undefined {
  if (!context) return undefined;
  const { ignoreLayoutProps, wrapChild, extraClassName, ...rest } = context;
  return rest;
}
