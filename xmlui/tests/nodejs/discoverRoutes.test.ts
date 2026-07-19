import { afterEach, describe, expect, it } from "vitest";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { discoverRoutes } from "../../src/nodejs/discoverRoutes";

const tempRoots: string[] = [];

async function makeProject(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), "xmlui-routes-"));
  tempRoots.push(root);
  for (const [relPath, content] of Object.entries(files)) {
    const filePath = path.join(root, relPath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }
  return root;
}

describe("discoverRoutes", () => {
  afterEach(async () => {
    while (tempRoots.length > 0) {
      await rm(tempRoots.pop()!, { recursive: true, force: true });
    }
  });

  it("parses Main.xmlui as an entrypoint when inline components are present", async () => {
    const root = await makeProject({
      "src/Main.xmlui": [
        '<Component name="InlineHeader">',
        '  <Text value="inline" />',
        "</Component>",
        "<App>",
        "  <InlineHeader />",
        "  <Pages>",
        '    <Page url="/inline" />',
        "  </Pages>",
        "</App>",
      ].join("\n"),
    });
    const cwd = process.cwd();
    process.chdir(root);
    try {
      const routes = await discoverRoutes();

      expect(routes.allRoutes()).toContain("/");
      expect(routes.allRoutes()).toContain("/inline");
    } finally {
      process.chdir(cwd);
    }
  });

});
