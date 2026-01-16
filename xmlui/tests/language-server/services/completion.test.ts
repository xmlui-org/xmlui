import { describe, expect, it } from "vitest";
import {
  handleCompletion,
  handleCompletionResolve,
} from "../../../src/language-server/services/completion";
import { mockMetadata, mockMetadataProvider } from "../mockData";
import type { CompletionItem, MarkupContent } from "vscode-languageserver";
import { CompletionItemKind } from "vscode-languageserver";
import { layoutOptionKeys } from "../../../src/components-core/descriptorHelper";
import { capitalizeFirstLetter } from "../../../src/components-core/utils/misc";
import { createXmlUiParser } from "../../../src/parsers/xmlui-parser";
import { TextDocument } from "../../../src/language-server/base/text-document";
import { Project } from "../../../src/language-server/base/project";

describe("Completion", () => {
  it("lists all component names after '<'", () => {
    const suggestions = completeAtPoundSign("<#").map(({ label }) => label);
    const expected = Object.keys(mockMetadata);

    expectToContainExactly(suggestions, expected);
  });

  it("lists all attribute names inside attribute key", () => {
    const attrNames = completeAtPoundSign("<Button a#b />").map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("lists all attribute names after last attribute key", () => {
    const attrNames = completeAtPoundSign("<Button ab# />").map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("lists all attribute names after component name", () => {
    const attrNames = completeAtPoundSign("<Button #/>").map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("lists all attribute names after attribute", () => {
    const attrNames = completeAtPoundSign('<Button label="hi" #/>').map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("list only matching closing tag name", () => {
    const completionLabels = completeAtPoundSign("<Button>ha</#>").map(({ label }) => label);
    expectToContainExactly(completionLabels, ["Button"]);
  });

  it("list all attribute names with missing '>' token", () => {
    const attrNames = completeAtPoundSign("<Button #</Button>").map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("list all attribute names between tag name and eof", () => {
    const attrNames = completeAtPoundSign("<Button #").map(({ label }) => label);
    expectToContainExactly(attrNames, allButtonProps);
  });

  it("don't list anything after matching closing tag name", { todo: true }, () => {
    const completionLabels = completeAtPoundSign("<Button>ha</Button #>").map(({ label }) => label);
    expect(completionLabels).toBeNull();
  });

  it("resolves component name", () => {
    const item = completeAtPoundSign("<Butto# />").find(({ label }) => label === "Button");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "Button", kind: CompletionItemKind.Constructor };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.description);
    expect(docs).toContain(mockMetadata.Button.events.click.description);
    expect(docs).toContain(mockMetadata.Button.props.label.description);
  });

  it("resolves closing component name", () => {
    const item = completeAtPoundSign("<Button><#").find(({ label }) => label === "/Button");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    expect(docs).toContain(mockMetadata.Button.description);
    expect(docs).toContain(mockMetadata.Button.events.click.description);
    expect(docs).toContain(mockMetadata.Button.props.label.description);
  });

  it("resolves prop", () => {
    const item = completeAtPoundSign("<Button labe#l />").find(({ label }) => label === "label");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "label", kind: CompletionItemKind.Property };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.props.label.description);
  });

  it("resolves event", () => {
    const item = completeAtPoundSign("<Button onClic#k />").find(
      ({ label }) => label === "onClick",
    );
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;

    const expected: CompletionItem = { label: "onClick", kind: CompletionItemKind.Event };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(mockMetadata.Button.events.click.description);
  });

  it("resolves implicit prop", () => {
    const item = completeAtPoundSign("<Button dat#a />").find(({ label }) => label === "data");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;
    const dataDescription = mockMetadataProvider.getComponent("Button").getAttr("data").description;

    const expected: CompletionItem = { label: "data", kind: CompletionItemKind.Property };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(dataDescription);
  });

  it("resolves layout prop", () => {
    const item = completeAtPoundSign("<Button widt#h />").find(({ label }) => label === "width");
    const resolvedItem = handleCompletionResolve({ item, metaByComp: mockMetadataProvider });
    const docs = (resolvedItem.documentation as MarkupContent).value;
    const widthDescription = mockMetadataProvider
      .getComponent("Button")
      .getAttr("width").description;

    const expected: CompletionItem = { label: "width", kind: CompletionItemKind.Unit };

    expect(resolvedItem).toMatchObject(expected);
    expect(docs).toContain(widthDescription);
  });

  it("closing element 1st after opening tag & element creation", () => {
    const suggestions = completeAtPoundSign("<Button><#").map(({ label }) => label);
    expect(suggestions).toStrictEqual(["/Button", ...Object.keys(mockMetadata)]);
  });

  it("closing element 1st after opening tag & element creation, cursor not at end", () => {
    const suggestions = completeAtPoundSign("<Button><#A").map(({ label }) => label);
    expect(suggestions).toStrictEqual(["/Button", ...Object.keys(mockMetadata)]);
  });

  it("closing element 1st after opening tag & element creation, malformed attr", () => {
    const suggestions = completeAtPoundSign("<Button attr=><#").map(({ label }) => label);
    expect(suggestions).toStrictEqual(["/Button", ...Object.keys(mockMetadata)]);
  });

  it("closing element 1st after opening tag & element creation, malformed attr list", () => {
    const suggestions = completeAtPoundSign("<Button attr=' :><#").map(({ label }) => label);
    expect(suggestions).toStrictEqual(["/Button", ...Object.keys(mockMetadata)]);
  });

  it("suggest all components if no identifier provided", () => {
    const suggestions = completeAtPoundSign("<><#").map(({ label }) => label);
    expect(suggestions).toStrictEqual(Object.keys(mockMetadata));
  });

  it("places closing tag after accepting code completion of opened component", () => {
    const item = completeAtPoundSign("<Button><#").find(({ label }) => label === "/Button");

    const expected: CompletionItem = {
      kind: CompletionItemKind.Constructor,
      data: { metadataAccessInfo: { componentName: "Button" } },
      label: "/Button",
      textEdit: {
        newText: "/Button>",
        range: {
          start: { line: 0, character: "<Button><".length },
          end: { line: 0, character: "<Button><".length },
        },
      },
    };

    expect(item).toMatchObject(expected);
  });

  it("don't suggest closing tag if completion item is not the one that has an opened tag", () => {
    const items = completeAtPoundSign("<Button><#").filter(({ label }) => label !== "/Button");
    for (const item of items) {
      expect(item.textEdit).toBeUndefined();
    }
  });
});

function completeAtPoundSign(source: string) {
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
  const charPosition = document.cursor.positionAt(position);
  return handleCompletion(project, uri, charPosition);
}

function expectToContainExactly<T>(actual: T[], expected: T[]) {
  expect(actual).toHaveLength(expected.length);
  expect(new Set(actual)).toEqual(new Set(expected));
}

const allButtonProps = Object.keys(mockMetadata.Button.props);
allButtonProps.push(
  ...Object.keys(mockMetadata.Button.events).map((key) => "on" + capitalizeFirstLetter(key)),
);
allButtonProps.push("inspect");
allButtonProps.push("data");
allButtonProps.push("when");
allButtonProps.push(...layoutOptionKeys);
