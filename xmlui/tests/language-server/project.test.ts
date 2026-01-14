import { describe, it, expect } from "vitest";
import { Project } from "../../src/language-server/base/project";
import { mockMetadataProvider } from "./mockData";

describe("Project and DocumentStore", () => {
  it("retriesves a document content", () => {
    const proj = createProject({
      "Main.xmlui": `<Button/>`,
    });

    expect(proj.documents.get("Main.xmlui").getText()).toEqual(`<Button/>`);
  });

  it("parses a document", () => {
    const proj = createProject({
      "Main.xmlui": `<Button/>`,
    });

    const { getText, parseResult } = proj.documents.get("Main.xmlui").parse();

    const compNameNode = parseResult.node.children![0].children![1];
    expect(getText(compNameNode)).toEqual("Button");
  });

  it("document cursor computes line-char from offset", () => {
    const content = `<Button>\n</Button>`;
    const proj = createProject({ "Main.xmlui": content });

    const slashCharOffset = content.indexOf("/");
    const pos = proj.documents.get("Main.xmlui").cursor.offsetToDisplayPos(slashCharOffset);

    expect(pos).toEqual({ line: 2, character: 2 });
  });
});

function createProject(files: Record<string, string>) {
  return Project.fromFileContets(files, mockMetadataProvider);
}
