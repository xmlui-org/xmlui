import { describe, expect, it } from "vitest";
import { handleHoverCore } from "../../../src/language-server/services/hover";
import { createXmlUiParser } from "../../../src/parsers/xmlui-parser";
import { mockMetadataProvider } from "../mockData";

describe("Hover", () => {
  it("documents component description", () => {
    const docs = hoverAtPoundSign("<Butt#on />").value;
    const expected = mockMetadataProvider.getComponent("Button").getMetadata().description;

    expect(docs).toContain(expected);
  });

  it("documents prop description", () => {
    const docs = hoverAtPoundSign("<Button lab#el='Hello' />").value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("label").description;

    expect(docs).toContain(expected);
  });

  it("documents event description", () => {
    const docs = hoverAtPoundSign("<Button onCl#ick='Hello' />").value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("onClick").description;

    expect(docs).toContain(expected);
  });

  it("documents implicit prop description", () => {
    const docs = hoverAtPoundSign("<Button dat#a='Hello' />").value;
    const expected = mockMetadataProvider.getComponent("Button").getAttr("data").description;

    expect(docs).toContain(expected);
  });

  it("documents layout prop description", () => {
    const docs = hoverAtPoundSign("<Button wid#th='Hello' />").value;
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
  const parser = createXmlUiParser(source);

  const { node } = parser.parse();

  return handleHoverCore(
    { getText: parser.getText, node, metaByComp: mockMetadataProvider },
    position,
  );
}
