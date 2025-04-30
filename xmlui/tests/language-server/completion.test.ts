import { describe, expect, it } from "vitest";
import { handleCompletion } from "../../src/language-server/services/completion";
import { createXmlUiParser } from "../../src/parsers/xmlui-parser";
import { mockMetadata, mockMetadataProvider } from "./mockData";
import { CompletionItemKind } from "vscode-languageserver";
import { layoutOptionKeys } from "../../src/components-core/descriptorHelper";
import { capitalizeFirstLetter } from "../../src/components-core/utils/misc";

describe('Completion', () => {
  it("lists all component names after '<'", () => {
    const suggestions = completeAtPoundSign("<#").map(({label}) => label);
    const expected = Object.keys(mockMetadata);
    expect(new Set(suggestions)).toEqual(new Set(expected));
  });

  it("lists all attribute names inside attribute key", () => {
    const attrNames = completeAtPoundSign("<Button a#b />").map(({label}) => label);
    const expected = Object.keys(mockMetadata.Button.props);
    expected.push(...Object.keys(mockMetadata.Button.events).map(key => "on" + capitalizeFirstLetter(key)));
    expected.push("inspect")
    expected.push("data")
    expected.push(...layoutOptionKeys)
    expect(new Set(attrNames)).toEqual(new Set(expected));
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
