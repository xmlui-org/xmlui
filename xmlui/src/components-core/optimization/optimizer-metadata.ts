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
 *   2. No extra step needed in the `.tsx` file — `mergeOptimizerInjectedVars` inside
 *      `wrapComponent`/`wrapCompound` automatically copies all projected keys
 *      (`childInjectedVars`, `unstableChildInjectedVars`, `isImplicitContainerByDefault`,
 *      and per-event `injectedVars`) into runtime `ComponentMetadata` at registration.
 *      For events, reference `OPTIMIZER_METADATA.YourComp.events.X.injectedVars` directly
 *      inside the corresponding event metadata if you need the value statically.
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
 * Populate a component descriptor's metadata with injected-variable
 * declarations sourced from OPTIMIZER_METADATA. The optimizer is the single
 * source of truth for which variables it keeps alive in container/event
 * scopes; this helper mirrors that information into the runtime descriptor
 * so `validateInjectedVars` (and IDE/docs consumers) see the same set and
 * don't report bogus mismatches.
 *
 * Mutates `metadata` in place. Only fills gaps — never overwrites a value
 * the component has already declared explicitly.
 *
 * Called by `wrapComponent`, `wrapCompound`, and `createComponentRenderer`
 * so that every registration path enriches metadata automatically.
 */
export function mergeOptimizerInjectedVars(type: string, metadata: ComponentMetadata | undefined): void {
  if (!metadata) return;
  const opt = lookupOptimizerMetadata(type);
  if (!opt) return;

  // Copy all three optimizer-projected keys (isImplicitContainerByDefault,
  // childInjectedVars, unstableChildInjectedVars) — component .tsx files
  // do not need to declare these manually.
  if (opt.isImplicitContainerByDefault && !metadata.isImplicitContainerByDefault) {
    (metadata as any).isImplicitContainerByDefault = true;
  }
  if (opt.childInjectedVars && !metadata.childInjectedVars) {
    (metadata as any).childInjectedVars = opt.childInjectedVars;
  }
  if (opt.unstableChildInjectedVars && !metadata.unstableChildInjectedVars) {
    (metadata as any).unstableChildInjectedVars = opt.unstableChildInjectedVars;
  }

  if (opt.events) {
    for (const eventName of Object.keys(opt.events)) {
      const injected = opt.events[eventName]?.injectedVars;
      if (!injected) continue;
      // Only enrich events the component already advertises. If the
      // optimizer declares an event the component doesn't expose, leave it
      // alone — that's an OPTIMIZER_METADATA mistake, not a runtime concern.
      const target = metadata.events?.[eventName];
      if (target && !target.injectedVars) {
        (target as any).injectedVars = injected;
      }
    }
  }
}
