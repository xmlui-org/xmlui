import { describe, it, expect } from "vitest";
import {
  extractComponentName,
  extractOptimizerMetadataFromSource,
} from "../../../src/components-core/optimization/static-extractor";

describe("extractOptimizerMetadataFromSource", () => {
  it("extracts childInjectedVars from optimization block (single-line array)", () => {
    const source = `
      export const ListMd = createMetadata({
        optimization: {
          childInjectedVars: ["$item", "$itemIndex"],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$itemIndex"],
    });
  });

  it("extracts childInjectedVars from optimization block (multi-line array)", () => {
    const source = `
      export const TableMd = createMetadata({
        optimization: {
          childInjectedVars: [
            "$item",
            "$itemIndex",
            "$row",
          ],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$itemIndex", "$row"],
    });
  });

  it("extracts isImplicitContainerByDefault from optimization block", () => {
    const source = `
      export const FormMd = createMetadata({
        optimization: {
          isImplicitContainerByDefault: true,
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      isImplicitContainerByDefault: true,
    });
  });

  it("extracts unstableChildInjectedVars from optimization block", () => {
    const source = `
      export const AppMd = createMetadata({
        optimization: {
          unstableChildInjectedVars: ["$pathname", "$routeParams"],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      unstableChildInjectedVars: ["$pathname", "$routeParams"],
    });
  });

  it("extracts per-event injectedVars from events block", () => {
    const source = `
      export const FormMd = createMetadata({
        optimization: {
          childInjectedVars: ["$data"],
        },
        events: {
          submit: {
            injectedVars: ["$data"],
            description: "...",
          },
          cancel: {
            injectedVars: ["$data"],
            description: "...",
          },
        },
      });
    `;
    const result = extractOptimizerMetadataFromSource(source);
    expect(result.events?.submit?.injectedVars).toEqual(["$data"]);
    expect(result.events?.cancel?.injectedVars).toEqual(["$data"]);
  });

  it("returns empty object when no optimization block is present", () => {
    const source = `
      export const ButtonMd = createMetadata({
        props: { label: d("The button label") },
      });
    `;
    const result = extractOptimizerMetadataFromSource(source);
    expect(result.childInjectedVars).toBeUndefined();
    expect(result.isImplicitContainerByDefault).toBeUndefined();
  });

  it("handles single-quoted strings in arrays", () => {
    const source = `
      export const ListMd = createMetadata({
        optimization: {
          childInjectedVars: ['$item', '$index'],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$index"],
    });
  });

  it("handles trailing commas", () => {
    const source = `
      export const ListMd = createMetadata({
        optimization: {
          childInjectedVars: ["$item", "$index",],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$index"],
    });
  });

  it("extracts per-event injectedVars regardless of field order (no first-field constraint)", () => {
    const source = `
      export const FormMd = createMetadata({
        events: {
          submit: {
            description: "Form submit event",
            signature: "(data) => void",
            injectedVars: ["$data"],
          },
          cancel: {
            description: "Cancel event",
            parameters: { reason: "Why" },
            injectedVars: ["$data"],
          },
        },
      });
    `;
    const result = extractOptimizerMetadataFromSource(source);
    expect(result.events?.submit?.injectedVars).toEqual(["$data"]);
    expect(result.events?.cancel?.injectedVars).toEqual(["$data"]);
  });

  it("ignores literal occurrences of childInjectedVars inside comments", () => {
    const source = `
      // This comment mentions childInjectedVars: ["$ignored"] which must not be picked up.
      /* Block comment with childInjectedVars: ["$alsoIgnored"] */
      export const FormMd = createMetadata({
        optimization: {
          childInjectedVars: ["$realItem"],
        },
      });
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$realItem"],
    });
  });

  it("ignores non-static childInjectedVars (computed expressions)", () => {
    const source = `
      const SHARED = ["$x"];
      export const FooMd = createMetadata({
        optimization: {
          childInjectedVars: SHARED,
        },
      });
    `;
    const result = extractOptimizerMetadataFromSource(source);
    expect(result.childInjectedVars).toBeUndefined();
  });
});

describe("extractComponentName", () => {
  it("extracts name from wrapComponent('Name', ...)", () => {
    const source = `
      export default wrapComponent("MyButton", { renderer: () => null });
    `;
    expect(extractComponentName(source)).toBe("MyButton");
  });

  it("extracts name from wrapCompound('Name', ...)", () => {
    const source = `
      export default wrapCompound("MyCompound", definition);
    `;
    expect(extractComponentName(source)).toBe("MyCompound");
  });

  it("extracts name from any wrap-prefixed wrapper function", () => {
    const source = `
      export default wrapXmluiComp("MyWidget", widgetDef);
    `;
    expect(extractComponentName(source)).toBe("MyWidget");
  });

  it("extracts name from const COMP = 'Name' declaration", () => {
    const source = `
      const COMP = "LegacyList";
      export const LegacyListMd = createMetadata({});
    `;
    expect(extractComponentName(source)).toBe("LegacyList");
  });

  it("extracts name from const COMP_NAME = 'Name' declaration", () => {
    const source = `
      const COMP_NAME = "AnotherLegacy";
    `;
    expect(extractComponentName(source)).toBe("AnotherLegacy");
  });

  it("returns null when no recognised pattern is present", () => {
    const source = `
      export const SomeMd = createMetadata({});
    `;
    expect(extractComponentName(source)).toBeNull();
  });

  it("ignores wrapComponent occurrences inside string literals", () => {
    const source = `
      const docExample = 'wrapComponent("Fake", ...)';
      export default wrapComponent("Real", def);
    `;
    expect(extractComponentName(source)).toBe("Real");
  });
});
