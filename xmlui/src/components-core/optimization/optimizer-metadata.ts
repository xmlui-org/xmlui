/**
 * Single source of truth for the metadata fields that `computeUsesForTree`
 * (lexical scoping optimizer) needs to know about each built-in XMLUI component:
 *
 *   • `events[name].injectedVars`  — variables the runtime injects into a
 *                                    specific event handler's scope.
 *   • `childInjectedVars`          — variables this component injects into
 *                                    the scope of its rendered children.
 *
 * **Why this file is the single source of truth, not the component .tsx files:**
 *
 * Component .tsx files transitively import SCSS / React / `import.meta.env`,
 * which makes them un-importable from the Vite plugin's pure Node.js context.
 * So both consumers — the runtime (`StandaloneApp`) and the build-time path
 * (`xmlui-parser`) — need a transform-free registry.
 *
 * To prevent drift, each component's `.tsx` file IMPORTS its entries from this
 * registry rather than redeclaring them. So this file is genuinely the only
 * place where these strings live.
 *
 * **Adding a new built-in component that injects $-prefixed vars:**
 *   1. Add an entry here.
 *   2. In the component's `.tsx` metadata, spread `fromOptimizerMetadata("YourComp")`
 *      (it projects the relevant top-level scalar fields: `isImplicitContainerByDefault`,
 *      `childInjectedVars`, `unstableChildInjectedVars`).
 *      For event-level `injectedVars`, reference `OPTIMIZER_METADATA.YourComp.events.X.injectedVars`
 *      directly inside the corresponding event metadata.
 *
 * **Extension Packages:** see §11.5 of the code-review doc — a runtime
 * registration API may be added later; until then extension components
 * over-subscribe (graceful degradation, correctness preserved).
 */
import type { ComponentMetadata } from "../../abstractions/ComponentDefs";

export const OPTIMIZER_METADATA = {
  // --- Global / Root components providing unstable state
  App: {
    unstableChildInjectedVars: ["$pathname", "$routeParams", "$queryParams", "$linkInfo"],
  },

  // --- Data-fetching components: per-event injected variables (Iteration 1)
  DataLoader: {
    events: {
      fetch: {
        injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
      },
    },
  },
  DataSource: {
    events: {
      fetch: {
        injectedVars: ["$url", "$method", "$queryParams", "$requestBody", "$requestHeaders", "$pageParams"],
      },
    },
  },
  APICall: {
    events: {
      mockExecute: {
        injectedVars: ["$pathParams", "$queryParams", "$requestBody", "$cookies", "$requestHeaders", "$param", "$params"],
      },
    },
  },

  // --- Containers / iterators: child-scope injected variables (Iteration 2)
  List: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$isSelected", "$group"],
  },
  Items: { childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast"] },
  Table: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$cell", "$colIndex", "$row", "$rowIndex", "$isSelected"],
    events: {
      contextMenu: {
        injectedVars: ["$item", "$row", "$rowIndex", "$itemIndex"],
      },
    },
  },
  TileGrid: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemIndex", "$isFirst", "$isLast", "$selected"],
    events: {
      contextMenu: {
        injectedVars: ["$item", "$itemIndex"],
      },
    },
  },
  Tree: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item"],
    events: {
      contextMenu: {
        injectedVars: ["$item"],
      },
    },
  },
  Select: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item", "$itemContext", "$group", "$selectedValue", "$inTrigger"],
  },
  AutoComplete: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$item"],
  },
  Markdown: {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$anchorId", "$anchorHref"],
  },
  DataGrid: {
    isImplicitContainerByDefault: true,
  },
  ModalDialog: { isImplicitContainerByDefault: true, childInjectedVars: ["$param", "$params"] },
  ContextMenu: { childInjectedVars: ["$context"] },
  Queue: {
    childInjectedVars: ["$completedItems", "$queuedItems"],
    events: {
      willProcess: { injectedVars: ["$completedItems", "$queuedItems"] },
      process: { injectedVars: ["$completedItems", "$queuedItems"] },
      didProcess: { injectedVars: ["$completedItems", "$queuedItems"] },
      processError: { injectedVars: ["$completedItems", "$queuedItems"] },
      complete: { injectedVars: ["$completedItems", "$queuedItems"] },
    },
  },
  Column:      { childInjectedVars: ["$item", "$cell", "$itemIndex", "$colIndex", "$row", "$rowIndex", "$value", "$setValue"] },
  Form:        {
    isImplicitContainerByDefault: true,
    childInjectedVars: ["$data"],
    events: {
      willSubmit: { injectedVars: ["$data"] },
      submit: { injectedVars: ["$data"] },
      submitFailed: { injectedVars: ["$data"] },
      cancel: { injectedVars: ["$data"] },
      reset: { injectedVars: ["$data"] },
      success: { injectedVars: ["$data"] }
    }
  },
  FormItem:    { childInjectedVars: ["$value", "$setValue", "$validationResult"] },
  FormSegment: { childInjectedVars: ["$segmentData", "$segmentValidationIssues", "$hasSegmentValidationIssue"] },
  Tabs:        { isImplicitContainerByDefault: true, childInjectedVars: ["$header"] },
  TabItem:     { childInjectedVars: ["$header"] },
  Stepper:     { isImplicitContainerByDefault: true },
  Drawer:      { isImplicitContainerByDefault: true },
  RadioGroup:  { childInjectedVars: ["$checked", "$setChecked"] },
  Checkbox:    { childInjectedVars: ["$checked", "$setChecked"] },
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
 * into the component's metadata object. Replaces the manual two-line
 * projection (`isImplicitContainerByDefault: OPTIMIZER_METADATA.X...,
 * childInjectedVars: OPTIMIZER_METADATA.X...`) that used to live in every
 * built-in `.tsx`. The type parameter ensures the component name is a known
 * key in `OPTIMIZER_METADATA`.
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
