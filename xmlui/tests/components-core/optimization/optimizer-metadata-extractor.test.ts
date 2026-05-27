import { describe, it, expect } from "vitest";
import { extractOptimizerMetadataFromSource } from "../../../src/components-core/optimization/static-extractor";

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
      optimization: {
        childInjectedVars: ['$item', '$index'],
      },
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$index"],
    });
  });

  it("handles trailing commas", () => {
    const source = `
      optimization: {
        childInjectedVars: ["$item", "$index",],
      },
    `;
    expect(extractOptimizerMetadataFromSource(source)).toMatchObject({
      childInjectedVars: ["$item", "$index"],
    });
  });
});
