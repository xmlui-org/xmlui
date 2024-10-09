import { ModuleResolver } from "@abstractions/scripting/modules";
import { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";
import { DiagnosticCategory, ErrCodes } from "../parsers/xmlui-parser/diagnostics";
import type { GetText, Error as ParseError } from "../parsers/xmlui-parser/parser";
import { ParserError } from "../parsers/xmlui-parser/ParserError";
import { SyntaxKind } from "../parsers/xmlui-parser/syntax-kind";
import { Node } from "../parsers/xmlui-parser/syntax-node";

interface ErrorWithLineColInfo extends ParseError {
  line: number;
  col: number;
}

/** Finding any error while parsing / transforming will result
 * in a custom error reporting component being returned with the errors inside it. */
export function componentFromXmlUiMarkupWithErrRendered(
  source: string,
  fileId: string | number = 0,
  fileName: string,
  moduleResolver?: ModuleResolver,
) {
  const { errors, component } = xmlUiMarkupToComponent(source, fileId, moduleResolver);
  if (errors.length === 0) {
    return component;
  }
  return errReportComponent(errors, fileId, fileName);
}

export function xmlUiMarkupToComponent(
  source: string,
  fileId: string | number = 0,
  moduleResolver?: ModuleResolver,
): {
  component: null | ComponentDef | CompoundComponentDef;
  errors: ErrorWithLineColInfo[];
  erroneousCompoundComponentName?: string;
} {
  const { parse, getText } = createXmlUiParser(source);
  const { node, errors } = parse();

  if (errors.length > 0) {
    const newlinePositions = [];
    for (let i = 0; i < source.length; ++i) {
      if (source[i] === "\n") {
        newlinePositions.push(i);
      }
    }
    const errorsWithLines = addPositions(errors, newlinePositions);
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    return { component: null, errors: errorsWithLines, erroneousCompoundComponentName };
  }
  try {
    return { component: nodeToComponentDef(node, getText, fileId, moduleResolver), errors: [] };
  } catch (e) {
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    const singleErr: ErrorWithLineColInfo = {
      message: (e as ParserError).message,
      col: 0,
      line: 0,
      code: ErrCodes.expEq,
      category: DiagnosticCategory.Error,
      pos: 0,
      end: 0,
    };
    return {
      component: null,
      erroneousCompoundComponentName,
      errors: [singleErr],
    };
  }
}

function addPositions(errors: ParseError[], newlinePositions: number[]): ErrorWithLineColInfo[] {
  if (newlinePositions.length === 0) {
    for (let err of errors) {
      (err as ErrorWithLineColInfo).line = 1;
      (err as ErrorWithLineColInfo).col = err.pos + 1;
    }
    return errors as ErrorWithLineColInfo[];
  }

  for (let err of errors) {
    let i = 0;
    for (; i < newlinePositions.length; ++i) {
      const newlinePos = newlinePositions[i];
      if (err.pos < newlinePos) {
        (err as ErrorWithLineColInfo).line = i + 1;
        (err as ErrorWithLineColInfo).col = err.pos - (newlinePositions[i - 1] ?? 0) + 1;
        break;
      }
    }
    const lastNewlinePos = newlinePositions[newlinePositions.length - 1];
    if (err.pos >= lastNewlinePos) {
      (err as ErrorWithLineColInfo).line = newlinePositions.length + 1;
      (err as ErrorWithLineColInfo).col = err.pos - lastNewlinePos + 0;
    }
  }
  return errors as ErrorWithLineColInfo[];
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
export function errReportComponent(
  errors: ErrorWithLineColInfo[],
  fileName: number | string,
  compoundCompName: string | undefined,
) {
  function makeComponent() {
    const errList = errors.map((e) => {
      return {
        type: "VStack",
        children: [
          {
            type: "Text",
            props: { value: `Error at file '${fileName}'` },
          },
          {
            type: "Text",
            props: { value: `line ${e.line}, column ${e.col}:` },
          },
          {
            type: "Text",
            props: { value: `${e.message}` },
          },
        ],
      };
    });
    const comp: ComponentDef = {
      type: "VStack",
      children: [
        { type: "H1", props: { value: "Error while processing xmlui markup." } },
        { type: "VStack", props: { gap: "2rem" }, children: errList },
      ],
    };
    return comp;
  }
  const comp = makeComponent() as any;
  comp.name = compoundCompName;
  comp.component = makeComponent();
  return comp;
}
function getCompoundCompName(node: Node, getText: GetText) {
  const rootTag = node?.children?.[0];
  const rootTagNameTokens = rootTag?.children?.find(
    (c) => c.kind === SyntaxKind.TagNameNode,
  )?.children;
  const rootTagName = rootTagNameTokens?.[rootTagNameTokens.length - 1];

  if (rootTagName === undefined || getText(rootTagName) !== "Component") {
    return undefined;
  }

  const attrs = rootTag.children?.find((c) => c.kind === SyntaxKind.AttributeListNode)?.children;
  const nameAttrTokens = attrs?.find(
    (c) => c.kind === SyntaxKind.AttributeNode && getText(c?.children[0]) === "name",
  )?.children;
  const nameValueToken = nameAttrTokens?.[nameAttrTokens.length - 1];
  if (nameValueToken !== undefined && nameValueToken.kind === SyntaxKind.StringLiteral) {
    const strLit = getText(nameValueToken);
    return strLit.substring(1, strLit.length - 1);
  }
  return undefined;
}
