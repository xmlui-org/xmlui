import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  computeUsesForTree,
  COMPUTED_USES_ENABLED,
} from "../../../src/components-core/optimization/computedUses";
import type { ComponentDef, OptimizerMetadataView } from "../../../src/abstractions/ComponentDefs";

/**
 * Read the generated snapshot as TEXT and parse a pristine copy.
 *
 * We cannot import it: `metadataRegistry` IS the snapshot object, and importing
 * `collectedComponentMetadata` Object.assigns live values over it. A pristine
 * parse is the only way to assert what the Node/Standalone build-time path sees.
 */
function loadPristineSnapshot(): Record<string, OptimizerMetadataView> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const snapshotPath = path.resolve(
    here,
    "../../../src/language-server/xmlui-metadata-generated.js",
  );
  const text = readFileSync(snapshotPath, "utf-8");
  const start = text.indexOf("export default ");
  if (start === -1) throw new Error("snapshot: 'export default' marker not found");
  let json = text.slice(start + "export default ".length).trim();
  if (json.endsWith(";")) json = json.slice(0, -1);
  return JSON.parse(json);
}

const snapshot = loadPristineSnapshot();

describe("generated snapshot carries optimizer fields (build-time path)", () => {
  const cases: Array<[string, string[]]> = [
    ["Table", ["$item", "$itemIndex", "$cell", "$colIndex", "$row", "$rowIndex"]],
    ["Tree", ["$item"]],
    ["Tabs", ["$header"]],
    ["Checkbox", ["$checked", "$setChecked"]],
    ["RadioGroup", ["$checked", "$setChecked"]],
    ["Markdown", ["$anchorId", "$anchorHref"]],
  ];

  it.each(cases)("%s injects its vars via contextVars (build-time path)", (comp, expected) => {
    const entry = snapshot[comp];
    expect(entry, `snapshot missing entry for ${comp}`).toBeDefined();
    const keys = Object.keys(entry.contextVars ?? {});
    for (const v of expected) {
      expect(keys, `${comp}.contextVars keys`).toContain(v);
    }
    // childInjectedVars must be gone for core components
    expect(entry.childInjectedVars ?? []).toEqual([]);
  });

  it("implicit-container flag survives into the snapshot (Table)", () => {
    expect(snapshot.Table?.isImplicitContainerByDefault).toBe(true);
  });
});

describe.skipIf(!COMPUTED_USES_ENABLED)(
  "optimizer narrows injected vars using the pristine snapshot",
  () => {
    const lookup = (t: string): OptimizerMetadataView | undefined => snapshot[t];

    it("Tree-injected $item does not bubble; global g does", () => {
      const root = {
        type: "Stack",
        vars: { dummy: "{0}" },
        children: [
          {
            type: "Tree",
            children: [
              { type: "Text", props: { text: "{$item.label + g}" } },
            ],
          },
        ],
      } as unknown as ComponentDef;

      computeUsesForTree(root, lookup);

      const used = (root as any).computedUses ?? [];
      expect(used).toContain("g");
      expect(used).not.toContain("$item");
    });
  },
);
