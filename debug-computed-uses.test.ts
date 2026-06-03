import { describe, it, expect } from "vitest";
import { computeUsesForTree } from "./xmlui/src/components-core/optimization/computedUses";
import { extractOptimizerMetadataFromSource } from "./xmlui/src/components-core/optimization/static-extractor";

describe("debug computedUses for Form with regex vars", () => {
  const metadataMap: Record<string, any> = {
    App: { isImplicitContainerByDefault: true },
    Form: { isImplicitContainerByDefault: true, childInjectedVars: ["$data"] },
    FormItem: { 
      optimization: { childInjectedVars: ["$value", "$setValue", "$validationResult"] },
      contextVars: { $value: {}, $setValue: {}, $validationResult: {} }
    },
    Text: {},
  };

  const lookup = (type: string) => metadataMap[type];

  it("Form should include variables used by its children (FormItem)", () => {
    const tree = {
      type: "App",
      vars: { phoneRegex: "'regex1'", zipRegex: "'regex2'" },
      children: [
        {
          type: "Form",
          props: { data: "{ phone: '', zip: '' }" },
          children: [
            {
              type: "FormItem",
              props: { label: "Phone", regex: "{phoneRegex}" }
            },
            {
              type: "FormItem",
              props: { label: "ZIP", regex: "{zipRegex}" }
            }
          ]
        }
      ]
    };

    computeUsesForTree(tree as any, lookup);

    const form = tree.children[0] as any;
    expect(form.computedUses).toContain("phoneRegex");
    expect(form.computedUses).toContain("zipRegex");
  });
});
