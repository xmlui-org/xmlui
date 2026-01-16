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

  it("document cursor computes position from offset", () => {
    const content = `ab\r\ncd`;
    const proj = createProject({ "Main.xmlui": content });

    const cursor = proj.documents.get("Main.xmlui").cursor;

    // out of range
    expect(cursor.positionAt(-1)).toEqual({ line: 0, character: 0 });
    expect(cursor.positionAt(-2)).toEqual({ line: 0, character: 0 });

    // in range
    expect(cursor.positionAt(0)).toEqual({ line: 0, character: 0 });
    expect(cursor.positionAt(1)).toEqual({ line: 0, character: 1 });
    expect(cursor.positionAt(2)).toEqual({ line: 0, character: 2 });
    expect(cursor.positionAt(3)).toEqual({ line: 0, character: 3 });
    expect(cursor.positionAt(4)).toEqual({ line: 1, character: 0 });
    expect(cursor.positionAt(5)).toEqual({ line: 1, character: 1 });

    //out of range
    expect(cursor.positionAt(6)).toEqual({ line: 1, character: 2 });
    expect(cursor.positionAt(7)).toEqual({ line: 1, character: 2 });
  });

  it("document cursor computes offset from position", () => {
    const content = `ab\r\ncd`;
    const proj = createProject({ "Main.xmlui": content });

    const cursor = proj.documents.get("Main.xmlui").cursor;

    // out of range
    expect(cursor.offsetAt({ line: -1, character: 0 })).toEqual(0);
    expect(cursor.offsetAt({ line: 0, character: -1 })).toEqual(0);
    // in range
    expect(cursor.offsetAt({ line: 0, character: 0 })).toEqual(0);
    expect(cursor.offsetAt({ line: 0, character: 1 })).toEqual(1);
    expect(cursor.offsetAt({ line: 0, character: 2 })).toEqual(2);
    expect(cursor.offsetAt({ line: 0, character: 3 })).toEqual(3);
    expect(cursor.offsetAt({ line: 1, character: 0 })).toEqual(4);
    expect(cursor.offsetAt({ line: 1, character: 1 })).toEqual(5);

    //out of range
    expect(cursor.offsetAt({ line: 1, character: 2 })).toEqual(6);
    expect(cursor.offsetAt({ line: 2, character: 3 })).toEqual(6);
  });
});

function createProject(files: Record<string, string>) {
  return Project.fromFileContets(files, mockMetadataProvider);
}
