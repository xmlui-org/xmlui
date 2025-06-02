import xmlFormat, {type XMLFormatterOptions} from 'xml-formatter';
import type { FormattingOptions, TextEdit, Range, Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

type FormatOptions = Pick<XMLFormatterOptions, "lineSeparator" | "indentation">;

export function format(input: string, { lineSeparator, indentation }: FormatOptions) : string | null {
  try {
    return xmlFormat(input, { lineSeparator, indentation, strictMode: false, });
  } catch(e){
    console.error(e);
    return null;
  }
}

export function handleDocumentFormatting(
  document: TextDocument,
  options: FormattingOptions
): TextEdit[] | null {
  const formatOptions: FormatOptions = {
    indentation: options.insertSpaces ? ' '.repeat(options.tabSize) : '\t',
    lineSeparator: '\n' // Default to LF, could be made configurable
  };

  const content = document.getText();
  const formatted = format(content, formatOptions);

  if (formatted === null) {
    return null;
  }
  // If content is already formatted correctly, return empty array
  if (formatted === content) {
    return [];
  }

  // Calculate the range to replace (entire document)
  const lastCharIdx = content.length === 0 ? 0 : content.length - 1;

  const range: Range = {
    start: { line: 0, character: 0 },
    end: document.positionAt(lastCharIdx)
  };

  return [{
    range,
    newText: formatted
  }];
}
