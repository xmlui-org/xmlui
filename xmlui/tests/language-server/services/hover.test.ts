import { describe, expect, it } from "vitest";
import { handleHover } from "../../../src/language-server/services/hover";
import { Project } from "../../../src/language-server/base/project";
import { mockMetadataProvider } from "../mockData";
import type { MarkupContent } from "vscode-languageserver";

describe("Hover", () => {
  it("documents component description", () => {
    const hoverResult = hoverAtPoundSign("<Butt#on />");
    const docs = (hoverResult.contents as MarkupContent).value;
    const expected = mockMetadataProvider.getComponent("Button").getMetadata().description;

    expect(docs).toContain(expected);
  });

  it("documents prop description", () => {
    const hoverResult = hoverAtPoundSign("<Button lab#el='Hello' />");
    const docs = (hoverResult.contents as MarkupContent).value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("label").description;

    expect(docs).toContain(expected);
  });

  it("documents event description", () => {
    const hoverResult = hoverAtPoundSign("<Button onCl#ick='Hello' />");
    const docs = (hoverResult.contents as MarkupContent).value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("onClick").description;

    expect(docs).toContain(expected);
  });

  it("documents implicit prop description", () => {
    const hoverResult = hoverAtPoundSign("<Button dat#a='Hello' />");
    const docs = (hoverResult.contents as MarkupContent).value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("data").description;

    expect(docs).toContain(expected);
  });

  it("documents layout prop description", () => {
    const hoverResult = hoverAtPoundSign("<Button wid#th='Hello' />");
    const docs = (hoverResult.contents as MarkupContent).value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("width").description;

    expect(docs).toContain(expected);
  });
});

function hoverAtPoundSign(source: string) {
  const cursorIndicator = "#";
  const position = source.indexOf(cursorIndicator);
  if (position === -1) {
    throw new Error(
      `No '${cursorIndicator}' found in the tested source to denote the position of the cursor.`,
    );
  }
  source = source.replace(cursorIndicator, "");
  const uri = "file://test.xmlui";
  const project = Project.fromFileContets({ [uri]: source }, mockMetadataProvider);
  const document = project.documents.get(uri);
  const charPosition = document.positionAt(position);
  return handleHover(project, uri, charPosition);
}
