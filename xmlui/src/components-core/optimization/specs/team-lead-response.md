# Response to Metadata Comments

Hi, thanks for the feedback! Both of your suggestions are spot on. In fact, they are so aligned with our goals that they are **already implemented in the current architecture**. 

Here are the details and where you can find them in the codebase:

### 1. Handling `contextVars` as `childInjectedVars`

> *"Perhaps the contextVars members should be automatically handled as if they were added to childInjectedVars."*

This is exactly how it works right now. The optimizer automatically merges the keys from `metadata.contextVars` with `childInjectedVars` during the AST traversal. This acts as a safety-net (especially for extension packages in Standalone mode).

You can see this in `xmlui/src/components-core/optimization/computedUses.ts` (around line 473):

```typescript
  const childInjected = [
    ...(metadata?.childInjectedVars ?? []),
    ...(metadata?.unstableChildInjectedVars ?? []),
    // metadata.contextVars keys ($item, $itemIndex, etc.) document what this
    // component type injects into children (Language Server + runtime metadata).
    ...Object.keys(metadata?.contextVars ?? {}),
  ];
```

*Note: While this fallback exists, `contextVars` is intentionally a subset used for documentation (Language Server). We still require developers to use `optimization.childInjectedVars` for internal, non-documented variables (e.g., `$colIndex`, `$isFirst`) so they don't leak into public autocomplete.*

### Important: The Vite Plugin Gap

It's important to note that this fallback is **less effective for the Vite plugin** compared to the Standalone runtime. 

When the Vite plugin scans extension packages using `static-extractor.ts`, it specifically looks for the `optimization: {}` and `events: {}` blocks to minimize processing overhead. It **ignores** the `contextVars` block.

- **Standalone Mode:** Uses the full metadata objects, so the fallback works perfectly.
- **Vite Plugin Mode:** Extension components scanned from source will **only** see variables declared in `childInjectedVars`. If a variable is only in `contextVars`, the build-time optimizer will treat it as a parent dependency, leading to over-subscription (unnecessary re-renders).

For this reason, our established rule remains: **Always declare injected variables in `optimization.childInjectedVars` for consistent performance across both build-time and runtime paths.**

### Proposed Improvement: Closing the Vite Gap

To further reduce the burden on developers, we could extend `static-extractor.ts` to automatically extract keys from the `contextVars` block as well. 

This change would involve:
1.  Updating the `OptimizerMeta` type in the extractor to include `contextVars`.
2.  Adding a few lines to `extractOptimizerMetadataFromSource` to find the `contextVars` property and pull out its keys.

Once implemented, the `optimization.childInjectedVars` field would truly become optional for any variable already documented in `contextVars`, making the system more ergonomic without sacrificing build-time performance.

---

### 2. Extending `ComponentEventMetadata` with injected variables

> *"It would be better to extend the ComponentEventMetadata type to contain context variables added to a particular event."*

We completely agree. `injectedVars` is **not** kept in the `optimization: {}` block. Instead, it is natively defined as a field within the `ComponentEventMetadata` type, keeping it right next to the event's signature and description as part of its API contract.

You can see the type definition in `xmlui/src/abstractions/ComponentDefs.ts`:

```typescript
export type ComponentEventMetadata = {
  // This field defines the description explaining the property...
  readonly description: string;

  // This field defines the signature of the event handler...
  readonly signature?: string;

  /**
   * Names of variables that XMLUI runtime injects into THIS event's handler scope.
   */
  readonly injectedVars?: readonly string[];
  
  // ...
};
```

This allows us to declare events cleanly like this:

```typescript
export const FormMd = createMetadata({
  // ...
  events: {
    submit: { 
       description: "Fired when the form is submitted.", 
       injectedVars: ["$data"] // Declared directly inside ComponentEventMetadata!
    },
  }
});
```

Let me know if you'd like to discuss the implementation details further!