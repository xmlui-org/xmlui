import { describe, expect, it } from "vitest";
import { handleCompletion, handleCompletionResolve } from "../../src/language-server/services/completion";
import { createXmlUiParser } from "../../src/parsers/xmlui-parser";
import { mockMetadata, mockMetadataProvider } from "./mockData";
import { CompletionItem, CompletionItemKind, MarkupContent } from "vscode-languageserver";
import { layoutOptionKeys } from "../../src/components-core/descriptorHelper";
import { capitalizeFirstLetter } from "../../src/components-core/utils/misc";

describe('Completion', () => {
  it("lists all component names after '<'", () => {
    const suggestions = completeAtPoundSign("<#").map(({label}) => label);
    const expected = Object.keys(mockMetadata);

    expectToContainExactly(suggestions, expected);
  });

  it("lists all attribute names inside attribute key", () => {
    const attrNames = completeAtPoundSign("<Button a#b />").map(({label}) => label);
    const expected = Object.keys(mockMetadata.Button.props);
    expected.push(...Object.keys(mockMetadata.Button.events).map(key => "on" + capitalizeFirstLetter(key)));
    expected.push("inspect")
    expected.push("data")
    expected.push("when")
    expected.push(...layoutOptionKeys)
    expectToContainExactly(attrNames, expected);
  });

  it("resolves component name", () => {
    const item = completeAtPoundSign("<Butto# />").find(({label}) => label === "Button");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "Button", kind: CompletionItemKind.Constructor };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.description)
    expect(docs).toContain(mockMetadata.Button.events.click.description)
    expect(docs).toContain(mockMetadata.Button.props.label.description)
  });

  it("resolves prop", () => {
    const item = completeAtPoundSign("<Button labe#l />").find(({label}) => label === "label");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "label", kind: CompletionItemKind.Property };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.props.label.description)
  });

  it("resolves event", () => {
    const item = completeAtPoundSign("<Button onClic#k />").find(({label}) => label === "onClick");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "onClick", kind: CompletionItemKind.Event };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.events.click.description)
  });

  it("resolves implicit prop", () => {
    const item = completeAtPoundSign("<Button dat#a />").find(({label}) => label === "data");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;
    const dataDescription = mockMetadataProvider.getComponent("Button").getAttr("data").description;

    const expected: CompletionItem = { label: "data", kind: CompletionItemKind.Property };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(dataDescription)
  });

  it("resolves layout prop", () => {
    const item = completeAtPoundSign("<Button widt#h />").find(({label}) => label === "width");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;
    const widthDescription = mockMetadataProvider.getComponent("Button").getAttr("width").description;

    const expected: CompletionItem = { label: "width", kind: CompletionItemKind.Property };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(widthDescription)
  });
});


function completeAtPoundSign(source: string) {
  const cursorIndicator = "#";
  const position = source.indexOf(cursorIndicator);
  if (position === -1) {
    throw new Error(`No '${cursorIndicator}' found in the tested source to denote the position of the cursor.`);
  }
  source = source.replace(cursorIndicator, "");
  const parser = createXmlUiParser(source)

  const parseResult = parser.parse()

  return handleCompletion({getText: parser.getText, parseResult, metaByComp: mockMetadataProvider}, position)
}

function expectToContainExactly<T>(actual: T[], expected: T[]) {
  expect(actual).toHaveLength(expected.length);
  expect(new Set(actual)).toEqual(new Set(expected));
}
