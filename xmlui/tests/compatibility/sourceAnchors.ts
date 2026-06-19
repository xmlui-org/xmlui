export type CompatibilityAnchor = {
  readonly id: string;
  readonly oldSource: string;
  readonly rewriteSource: string;
  readonly note: string;
};

export const compatibilityAnchors: CompatibilityAnchor[] = [
  {
    id: "counter-local-mutation",
    oldSource: "/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button.spec.ts",
    rewriteSource: "xmlui/tests/e2e/counter-local.spec.ts",
    note: "Button click handlers must mutate XMLUI state and re-render bound text.",
  },
  {
    id: "global-mutation-from-component",
    oldSource: "/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.spec.ts",
    rewriteSource: "xmlui/tests/e2e/counter-globals.spec.ts",
    note: "Global variables must be visible and mutable across component boundaries.",
  },
  {
    id: "async-handler-mutation",
    oldSource: "/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md",
    rewriteSource: "xmlui/tests/e2e/async-handlers.spec.ts",
    note: "Event handlers run asynchronously while still mutating XMLUI state predictably.",
  },
  {
    id: "managed-fetch-data-update",
    oldSource: "/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource/DataSource.spec.ts",
    rewriteSource: "xmlui/tests/e2e/data-operations.spec.ts",
    note: "Managed data operations update rendered state after mocked API responses.",
  },
  {
    id: "extension-event-mutation",
    oldSource: "/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneExtensionManager.ts",
    rewriteSource: "xmlui/tests/e2e/extensions.spec.ts",
    note: "Extension components can raise events that mutate XMLUI state.",
  },
];
