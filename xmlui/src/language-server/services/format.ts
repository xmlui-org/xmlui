import xmlFormat, {type XMLFormatterOptions} from 'xml-formatter';
import type { FormattingOptions, TextEdit, Range, Position } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { GetText, Node } from '../../parsers/xmlui-parser';

type FormatOptions = Pick<XMLFormatterOptions, "lineSeparator" | "indentation">;


type FormattingContex = {
  node: Node;
  getText: GetText;
  offsetToPosition: (offset: number) => Position;
  options: FormattingOptions,
};

export function handleDocumentFormatting({
  node,
  getText,
  options,
  offsetToPosition
}: FormattingContex): TextEdit[] | null {

  const formatted = format(node, getText, options);

  // If content is already formatted correctly, return empty array
  const unformattedContent = getText(node);
  if (formatted === unformattedContent) {
    return [];
  }

  const lastCharIdx = unformattedContent.length === 0 ? 0 : unformattedContent.length - 1;
  const entireDocumentRange: Range = {
    start: { line: 0, character: 0 },
    end: offsetToPosition(lastCharIdx)
  };

  return [{
    range: entireDocumentRange,
    newText: formatted
  }];
}

class XmluiFormatter {
  private readonly getText: GetText;
  private indentationToken: string;
  private indentationLevel: number;
  private newlineToken: string = "\n";

  constructor(node: Node, getText: GetText){
    this.getText = getText;
  }

  format(options: FormattingOptions): string {
    this.indentationToken = options.insertSpaces ? " ".repeat(options.tabSize) : "\t";
    return "hi";
  }

  private indent = (level: number): string => {
    return this.indentationToken.repeat(level);
  };
}

export function format(node: Node, getText: GetText, options: FormattingOptions) : string | null {
  const formatter = new XmluiFormatter(node, getText);
  const formattedString = formatter.format(options);
  return formattedString;
}
