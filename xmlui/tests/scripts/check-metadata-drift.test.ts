import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkMetadataDrift,
  formatMetadataDriftReport,
} from "../../scripts/check-metadata-drift";

function makeFixture(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xmlui-drift-"));
  const componentsDir = path.join(root, "src/components");
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(componentsDir, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  return { root, componentsDir };
}

const collection = `
import { GoodMd } from "./Good/Good";
import { BadMd } from "./Bad/Bad";

export const collectedComponentMetadata = {
  Good: GoodMd,
  Bad: BadMd,
};
`;

describe("checkMetadataDrift", () => {
  it("passes when metadata props are present in a nearby Props type", () => {
    const fixture = makeFixture({
      "collectedComponentMetadata.ts": collection,
      "Good/Good.tsx": `
        export const GoodMd = {};
        type Props = { label?: string; count?: number };
      `,
      "Bad/Bad.tsx": `export const BadMd = {}; type Props = {};`,
    });
    const result = checkMetadataDrift({
      repoRoot: fixture.root,
      componentsDir: fixture.componentsDir,
      metadataRegistry: {
        Good: { props: { label: {}, count: {} } },
      },
    });
    expect(result.issues).toEqual([]);
    expect(formatMetadataDriftReport(result)).toContain("passed");
  });

  it("reports metadata props missing from the component's typed surface", () => {
    const fixture = makeFixture({
      "collectedComponentMetadata.ts": collection,
      "Good/Good.tsx": `export const GoodMd = {}; type Props = {};`,
      "Bad/Bad.tsx": `export const BadMd = {}; type Props = { label?: string };`,
    });
    const result = checkMetadataDrift({
      repoRoot: fixture.root,
      componentsDir: fixture.componentsDir,
      metadataRegistry: {
        Bad: { props: { label: {}, missing: {} } },
      },
    });
    expect(result.issues).toEqual([
      {
        componentName: "Bad",
        metadataExport: "BadMd",
        sourceFile: "src/components/Bad/Bad.tsx",
        missingProps: ["missing"],
      },
    ]);
    expect(formatMetadataDriftReport(result)).toContain("missing");
  });

  it("accepts props handled explicitly by wrapComponent config", () => {
    const fixture = makeFixture({
      "collectedComponentMetadata.ts": collection,
      "Good/Good.tsx": `
        export const GoodMd = {};
        wrapComponent("Good", Good, GoodMd, {
          strings: ["label"],
          rename: { minValue: "min" },
          renderers: { itemTemplate: {} },
        });
      `,
      "Bad/Bad.tsx": `export const BadMd = {};`,
    });
    const result = checkMetadataDrift({
      repoRoot: fixture.root,
      componentsDir: fixture.componentsDir,
      metadataRegistry: {
        Good: { props: { label: {}, minValue: {}, itemTemplate: {} } },
      },
    });
    expect(result.issues).toEqual([]);
  });
});
