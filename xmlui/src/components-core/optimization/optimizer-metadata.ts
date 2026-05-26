/**
 * Single source of truth for component metadata fields required by `computeUsesForTree`
 * (lexical scoping optimizer):
 *   • `events[name].injectedVars` — variables injected into a specific event handler's scope.
 *   • `childInjectedVars`         — variables injected into the scope of rendered children.
 *   • `unstableChildInjectedVars` — unstable (identity-changing) child-scope variables.
 *
 * **Why a central registry?**
 * Component `.tsx` files import React/SCSS/DOM globals, making them un-importable from the
 * pure Node.js Vite plugin. Both runtime (`StandaloneApp`) and build-time paths need a
 * transform-free registry. Component `.tsx` files IMPORT from here to prevent drift.
 *
 * **Adding a new built-in component that injects $-prefixed vars:**
 *   1. Add an entry here. Use `withInjectedContext` to reduce boilerplate:
 *      ```typescript
 *      MyComp: withInjectedContext({
 *        childInjectedVars: ["$item"],
 *        eventsInheritChildVars: ["select", "hover"],
 *      }),
 *      ```
 *   2. In the `.tsx` component metadata, spread `fromOptimizerMetadata("YourComp")`.
 *      For events, reference `OPTIMIZER_METADATA.YourComp.events.X.injectedVars` directly
 *      inside the corresponding event metadata.
 *
 * **Extension Packages:** Runtime registration API is pending. Until then, extension
 * components over-subscribe (graceful degradation, correctness preserved).
 */
import type { ComponentMetadata } from "../../abstractions/ComponentDefs";

export function withInjectedContext(opts: {
  isImplicitContainerByDefault?: boolean;
  childInjectedVars?: readonly string[];
  unstableChildInjectedVars?: readonly string[];
  eventsInheritChildVars?: readonly string[];
  perEventVars?: Readonly<Record<string, readonly string[]>>;
}): Partial<ComponentMetadata> {
  const events: Record<string, { injectedVars: readonly string[] }> = {};

  for (const name of opts.eventsInheritChildVars ?? [])
    events[name] = { injectedVars: opts.childInjectedVars ?? [] };

  for (const [name, vars] of Object.entries(opts.perEventVars ?? {}))
    events[name] = { injectedVars: vars };

  return {
    ...(opts.isImplicitContainerByDefault && { isImplicitContainerByDefault: true }),
    ...(opts.childInjectedVars            && { childInjectedVars: opts.childInjectedVars }),
    ...(opts.unstableChildInjectedVars    && { unstableChildInjectedVars: opts.unstableChildInjectedVars }),
    ...(Object.keys(events).length        && { events }),
  };
}

export const OPTIMIZER_METADATA = {
  // --- Global / Root components providing unstable state
  App: withInjectedContext({
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
  }),

  // --- Data-fetching components: per-event injected variables (Iteration 1)
  DataLoader: withInjectedContext({
    perEventVars: {
      fetch: [
        "$url",
        "$method",
        "$queryParams",
        "$requestBody",
        "$requestHeaders",
        "$pageParams",
      ],
    },
  }),
  DataSource: withInjectedContext({
    perEventVars: {
      fetch: [
        "$url",
        "$method",
        "$queryParams",
        "$requestBody",
        "$requestHeaders",
        "$pageParams",
      ],
    },
  }),
  APICall: withInjectedContext({
    perEventVars: {
      mockExecute: [
        "$pathParams",
        "$queryParams",
        "$requestBody",
        "$cookies",
        "$requestHeaders",
        "$param",
        "$params",
      ],
    },
  }),

  // --- Containers / iterators: child-scope injected variables (Iteration 2)
  List: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$isSelected", "$group"],
  }),
  Items: withInjectedContext({ childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast"] }),
  Table: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: [
      "$item",
      "$itemIndex",
      "$cell",
      "$colIndex",
      "$row",
      "$rowIndex",
      "$isSelected",
    ],
    perEventVars: {
      contextMenu: ["$item", "$row", "$rowIndex", "$itemIndex"],
    },
  }),
  TileGrid: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$selected"],
    perEventVars: {
      contextMenu: ["$item", "$itemIndex"],
    },
  }),
  Tree: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item"],
    eventsInheritChildVars: ["contextMenu"],
  }),
  Select: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemContext", "$group", "$selectedValue", "$inTrigger"],
  }),
  AutoComplete: withInjectedContext({
    isImplicitContainerByDefault: true,
    // Keep aligned with the `optionTemplate` renderer's `contextVars` in
    // `xmlui/src/components/AutoComplete/AutoComplete.tsx`
    childInjectedVars: ["$item", "$selectedValue", "$inTrigger"],
  }),
  Markdown: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$anchorId", "$anchorHref"],
  }),
  DataGrid: withInjectedContext({
    isImplicitContainerByDefault: true,
  }),
  ModalDialog: withInjectedContext({ isImplicitContainerByDefault: true, childInjectedVars: ["$param", "$params"] }),
  ContextMenu: withInjectedContext({ childInjectedVars: ["$context"] }),
  Queue: withInjectedContext({
    childInjectedVars: ["$completedItems", "$queuedItems"],
    eventsInheritChildVars: ["willProcess", "process", "didProcess", "processError", "complete"],
  }),
  Column: withInjectedContext({
    childInjectedVars: [
      "$item",
      "$cell",
      "$itemIndex",
      "$colIndex",
      "$row",
      "$rowIndex",
      "$value",
      "$setValue",
    ],
  }),
  Form: withInjectedContext({
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    eventsInheritChildVars: ["willSubmit", "submit", "submitFailed", "cancel", "reset", "success"],
  }),
  FormItem: withInjectedContext({ childInjectedVars: ["$value", "$setValue", "$validationResult"] }),
  FormSegment: withInjectedContext({
    childInjectedVars: ["$segmentData", "$segmentValidationIssues", "$hasSegmentValidationIssue"],
  }),
  Tabs: withInjectedContext({ isImplicitContainerByDefault: true, childInjectedVars: ["$header"] }),
  TabItem: withInjectedContext({ childInjectedVars: ["$header"] }),
  Stepper: withInjectedContext({ isImplicitContainerByDefault: true }),
  Drawer: withInjectedContext({ isImplicitContainerByDefault: true }),
  RadioGroup: withInjectedContext({ childInjectedVars: ["$checked", "$setChecked"] }),
  Checkbox: withInjectedContext({ childInjectedVars: ["$checked", "$setChecked"] }),
  Fallback: withInjectedContext({ childInjectedVars: ["$error"] }),
} as const satisfies Record<string, Partial<ComponentMetadata>>;

/**
 * Lookup function that matches the `metadataLookup` callback signature
 * expected by `computeUsesForTree`. Returns `undefined` for component types
 * that are not in the registry — the optimizer then falls back to its
 * default behavior (no scope extension).
 */
export function lookupOptimizerMetadata(type: string): ComponentMetadata | undefined {
  return (OPTIMIZER_METADATA as Record<string, ComponentMetadata>)[type];
}

/**
 * Top-level optimizer fields that `.tsx` component metadata blocks need to
 * re-export so the runtime/optimizer can read them via `ComponentMetadata`.
 * `events` is intentionally excluded — event-level `injectedVars` are spliced
 * into the component's own `events` block in `.tsx` directly.
 */
const OPTIMIZER_PROJECTED_KEYS = [
  "isImplicitContainerByDefault",
  "childInjectedVars",
  "unstableChildInjectedVars",
] as const;

type OptimizerProjectionKey = (typeof OPTIMIZER_PROJECTED_KEYS)[number];

type OptimizerProjection<K extends keyof typeof OPTIMIZER_METADATA> = Pick<
  (typeof OPTIMIZER_METADATA)[K],
  Extract<keyof (typeof OPTIMIZER_METADATA)[K], OptimizerProjectionKey>
>;

/**
 * Returns the top-level optimizer fields for a component, ready to be spread
 * into the component's metadata object. Replaces manual two-line projections
 * inside components. The type parameter ensures type safety via `OPTIMIZER_METADATA`.
 */
export function fromOptimizerMetadata<K extends keyof typeof OPTIMIZER_METADATA>(
  type: K,
): OptimizerProjection<K> {
  const entry = OPTIMIZER_METADATA[type] as Record<string, unknown>;
  const projection: Record<string, unknown> = {};
  for (const key of OPTIMIZER_PROJECTED_KEYS) {
    if (key in entry) projection[key] = entry[key];
  }
  return projection as OptimizerProjection<K>;
}
