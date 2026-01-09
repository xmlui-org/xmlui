import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";
import { DiagnosticCategory, TransformDiag } from "../parsers/xmlui-parser/diagnostics";
import type { GetText } from "../parsers/xmlui-parser/parser";
import type { GeneralDiag, ParserDiag } from "../parsers/xmlui-parser/diagnostics";
import { SyntaxKind } from "../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../parsers/xmlui-parser/syntax-node";
import type { ScriptParserErrorMessage } from "../abstractions/scripting/ScriptParserError";
import type { ModuleErrors } from "./script-runner/ScriptingSourceTree";

interface ErrorForDisplay extends GeneralDiag {
  contextStartLine: number;
  contextSource: string;
  errPosLine: number;
  errPosCol: number;
}

export type ParserResult = {
  component: null | ComponentDef | CompoundComponentDef;
  errors: ErrorForDisplay[];
  erroneousCompoundComponentName?: string;
};
const COLOR_DANGER_100 = "hsl(356, 100%, 91%)";
const COLOR_DANGER_300 = "hsl(356, 100%, 70%)";
const COLOR_PRIMARY = "hsl(204, 30.3%, 13%)";
const COLOR_PRIMARY_LINE_NUMS = "#555b5e";
const RADIUS = "0.5rem";

export function xmlUiMarkupToComponent(source: string, fileId: string | number = 0): ParserResult {
  const { parse, getText } = createXmlUiParser(source);
  const { node, errors } = parse();
  if (errors.length > 0) {
    const errorsForDisplay = addDisplayFieldsToErrors(errors, source);
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    return { component: null, errors: errorsForDisplay, erroneousCompoundComponentName };
  }
  try {
    const component = nodeToComponentDef(node, getText, fileId);
    const transformResult = { component, errors: [] };
    return transformResult;
  } catch (e) {
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    if (e instanceof TransformDiag) {
      const singleErr: ErrorForDisplay = {
        message: e.message,
        errPosCol: 0,
        errPosLine: 0,
        code: e.code,
        pos: e.pos ?? 0,
        end: e.end ?? 0,
        contextPos: 0,
        contextEnd: 0,
        contextSource: "",
        contextStartLine: 0,
      };
      return {
        component: null,
        erroneousCompoundComponentName,
        errors: [singleErr],
      };
    } else {
      throw e;
    }
  }
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
function createErrorMessageComponent(message: string): ComponentDef {
  const comp: ComponentDef = {
    type: "VStack",
    props: { padding: "$padding-normal", gap: 0 },
    children: [
      {
        type: "H1",
        props: {
          value: message,
          padding: "$padding-normal",
          backgroundColor: "$color-error",
          color: "white",
        },
      },
    ],
  };
  return comp;
}

export function errReportMessage(message: string) {
  const comp = createErrorMessageComponent(message) as any;
  comp.component = createErrorMessageComponent(message);
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
function createErrorReportComponent(
  errors: ErrorForDisplay[],
  fileName: number | string,
): ComponentDef {
  const errList = errors
    .sort((a, b) => {
      if (a.pos === undefined && b.pos === undefined) {
        return 0;
      } else if (a.pos === undefined) {
        return 1;
      } else if (b.pos === undefined) {
        return -1;
      } else {
        return a.pos - b.pos;
      }
    })
    .map((e, idx) => {
      // Calculate relative positions within context
      const errorStartInContext = e.pos - e.contextPos;
      const errorEndInContext = e.end - e.contextPos;

      // Split context source into lines and process each line
      const contextLines = e.contextSource.split("\n");
      let currentPos = 0;

      // Calculate padding for line numbers to maintain alignment
      const lastLineNumber = e.contextStartLine + contextLines.length - 1;
      const maxDigits = lastLineNumber.toString().length;

      const contextChildren = [];

      for (let lineIdx = 0; lineIdx < contextLines.length; lineIdx++) {
        const line = contextLines[lineIdx];
        const lineNumber = e.contextStartLine + lineIdx;
        const paddedLineNumber = lineNumber.toString().padStart(maxDigits, "0");
        const linePrefix = `${paddedLineNumber} | `;

        // Check if error spans this line
        const lineStart = currentPos;
        const lineEnd = currentPos + line.length;

        const lineChildren: ComponentDef[] = [
          {
            type: "Theme",
            props: {},
            children: [
              {
                type: "Text",
                props: {
                  value: linePrefix,
                  fontFamily: "monospace",
                  color: COLOR_PRIMARY_LINE_NUMS,
                },
              },
            ],
          },
          ,
        ];

        if (errorStartInContext >= lineStart && errorStartInContext < lineEnd) {
          // Error starts on this line
          const beforeError = line.substring(0, errorStartInContext - lineStart);
          const errorInLine = line.substring(
            errorStartInContext - lineStart,
            Math.min(errorEndInContext - lineStart, line.length),
          );
          const afterError = line.substring(Math.min(errorEndInContext - lineStart, line.length));

          if (beforeError) {
            lineChildren.push({
              type: "Text",
              props: {
                value: beforeError,
                fontFamily: "monospace",
              },
            });
          }

          if (errorInLine) {
            lineChildren.push({
              type: "Text",
              props: {
                value: errorInLine,
                fontFamily: "monospace",
                textDecorationLine: "underline",
                textDecorationColor: "$color-error",
                backgroundColor: COLOR_DANGER_100,
              },
            });
          }

          if (afterError) {
            lineChildren.push({
              type: "Text",
              props: {
                value: afterError,
                fontFamily: "monospace",
              },
            });
          }
        } else if (errorStartInContext < lineStart && errorEndInContext > lineEnd) {
          // Entire line is within error span
          lineChildren.push({
            type: "Text",
            props: {
              value: line,
              fontFamily: "monospace",
              textDecorationLine: "underline",
              textDecorationColor: "$color-error",
              backgroundColor: COLOR_DANGER_100,
            },
          });
        } else if (
          errorStartInContext < lineStart &&
          errorEndInContext >= lineStart &&
          errorEndInContext < lineEnd
        ) {
          // Error ends on this line
          const errorInLine = line.substring(0, errorEndInContext - lineStart);
          const afterError = line.substring(errorEndInContext - lineStart);

          if (errorInLine) {
            lineChildren.push({
              type: "Text",
              props: {
                value: errorInLine,
                fontFamily: "monospace",
                textDecorationLine: "underline",
                textDecorationColor: "$color-error",
                backgroundColor: COLOR_DANGER_100,
              },
            });
          }

          if (afterError) {
            lineChildren.push({
              type: "Text",
              props: {
                value: afterError,
                fontFamily: "monospace",
              },
            });
          }
        } else if (lineEnd === errorStartInContext && errorStartInContext === errorEndInContext) {
          // Zero-length error span - insert visible vertical bar
          lineChildren.push({
            type: "Text",
            props: {
              value: line,
              fontFamily: "monospace",
            },
          });
          lineChildren.push({
            type: "Text",
            props: {
              value: " ",
              preserveLinebreaks: true,
              textDecorationLine: "underline",
              fontFamily: "monospace",
              fontWeight: "bold",
              backgroundColor: COLOR_DANGER_100,
              color: "$color-error",
            },
          });
        } else {
          // No error on this line
          lineChildren.push({
            type: "Text",
            props: {
              value: line,
              fontFamily: "monospace",
            },
          });
        }

        contextChildren.push({
          type: "HStack",
          props: { gap: "0" },
          children: lineChildren,
        });

        currentPos = lineEnd + 1; // +1 for newline character
      }
      const errMsgComponenet: ComponentDef = {
        type: "Text",
        children: [
          {
            type: "Text",
            props: {
              value: `#${idx + 1}: ${fileName} (${e.errPosLine}:${e.errPosCol}):`,
              // color: "hsl(204, 30.3%, 27%)",
            },
          },
          {
            type: "Text",
            props: {
              value: ` ${e.message}`,
              fontWeight: "bold",
            },
          },
        ],
      };
      const context = {
        type: "HStack",
        props: {
          width: "100%",
        },
        children: [
          {
            type: "VStack",
            props: {
              gap: "0",
              padding: "$padding-normal",
              backgroundColor: "$color-surface-variant",
            },
            children: contextChildren,
          },
        ],
      };

      const errComponent: ComponentDef = {
        type: "VStack",
        props: {
          gap: "$gap-none",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: RADIUS,
        },
        children: [errMsgComponenet],
      };
      if (!(e.contextSource === "" && e.pos === 0 && e.end === 0)) {
        errComponent.children.push(context);
      }
      return errComponent;
    });
  const comp: ComponentDef = {
    type: "Theme",
    props: {
      "textColor-primary": COLOR_PRIMARY,
    },
    children: [
      {
        type: "VStack",
        props: {
          padding: "16px 32px 16px 38px",
          gap: 0,
          backgroundColor: COLOR_DANGER_100,
          margin: "10px",
          border: "2px solid " + COLOR_DANGER_300,
          borderRadius: RADIUS,
        },
        children: [
          {
            type: "HStack",
            props: {
              verticalAlignment: "center",
              marginLeft: "-34px",
              padding: "0px 0px 15px 0px",
              gap: "4px",
            },
            children: [
              {
                type: "Icon",
                props: {
                  name: "error",
                  size: "30px",
                  color: "$color-error",
                },
              },
              {
                type: "H2",
                props: {
                  value: `${errList.length} ${errList.length > 1 ? "errors" : "error"} while processing XMLUI markup`,
                  fontWeight: "bold",
                  showAnchor: false,
                },
              },
            ],
          },
          {
            type: "VStack",
            props: {
              padding: "$padding-none",
              gap: "16px",
            },
            children: errList,
          },
        ],
      },
    ],
  };
  return comp;
}

export function errReportComponent(
  errors: ErrorForDisplay[],
  fileName: number | string,
  compoundCompName: string | undefined,
) {
  const comp = createErrorReportComponent(errors, fileName) as any;
  comp.name = compoundCompName;
  comp.component = createErrorReportComponent(errors, fileName);
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
function createScriptErrorComponent(
  error: ScriptParserErrorMessage,
  fileName: number | string,
): ComponentDef {
  const comp: ComponentDef = {
    type: "VStack",
    props: { padding: "$padding-normal", gap: 0 },
    children: [
      {
        type: "H1",
        props: {
          value: `An error found while processing XMLUI code-behind script`,
          padding: "$padding-normal",
          backgroundColor: "$color-error",
          color: "white",
        },
      },
      {
        type: "VStack",
        props: {
          gap: "$gap-tight",
          padding: "$padding-normal",
        },
        children: [
          {
            type: "HStack",
            props: { gap: "0" },
            children: [
              {
                type: "Text",
                props: {
                  value: `${fileName} (${error.line}:${error.column}):\xa0`,
                  color: "$color-info",
                },
              },
              {
                type: "Text",
                props: { value: ` ${error.text}`, fontWeight: "bold" },
              },
            ],
          },
        ],
      },
    ],
  };
  return comp;
}

export function errReportScriptError(error: ScriptParserErrorMessage, fileName: number | string) {
  const comp = createScriptErrorComponent(error, fileName) as any;
  comp.component = createScriptErrorComponent(error, fileName);
  return comp;
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
function createModuleErrorsComponent(
  errors: ModuleErrors,
  fileName: number | string,
): ComponentDef {
  const errList: ComponentDef[] = [];
  let idx = 1;
  Object.keys(errors).map((key) => {
    const e = errors[key];
    for (let err of e) {
      errList.push({
        type: "VStack",
        props: { gap: "0px" },
        children: [
          {
            type: "HStack",
            props: { gap: "0" },
            children: [
              {
                type: "Text",
                props: {
                  value: `#${idx++}: ${fileName} (${err.line}:${err.column}):\xa0`,
                  color: "$color-info",
                },
              },
              {
                type: "Text",
                props: { value: ` ${err.text}`, fontWeight: "bold" },
              },
            ],
          },
        ],
      });
    }
  });
  const comp: ComponentDef = {
    type: "VStack",
    props: { padding: "$padding-normal", gap: 0 },
    children: [
      {
        type: "H1",
        props: {
          value: `${errList.length} ${errList.length > 1 ? "Errors" : "Error"} found while processing XMLUI code-behind script`,
          padding: "$padding-normal",
          backgroundColor: "$color-error",
          color: "white",
        },
      },
      {
        type: "VStack",
        props: {
          gap: "$gap-tight",
          padding: "$padding-normal",
        },
        children: errList,
      },
    ],
  };
  return comp;
}

export function errReportModuleErrors(errors: ModuleErrors, fileName: number | string) {
  const comp = createModuleErrorsComponent(errors, fileName) as any;
  comp.component = createModuleErrorsComponent(errors, fileName);
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

function addDisplayFieldsToErrors(errors: ParserDiag[], source: string): ErrorForDisplay[] {
  const { offsetToPosForDisplay } = createDocumentCursor(source);
  return errors.map((err) => {
    const { line: errPosLine, character: errPosCol } = offsetToPosForDisplay(err.pos);
    const { line: contextStartLine } = offsetToPosForDisplay(err.contextPos);

    return {
      ...err,
      errPosLine,
      errPosCol,
      contextStartLine,
      contextSource: source.substring(err.contextPos, err.contextEnd),
    };
  });
}

type Position = { line: number; character: number };
type DocumentCursor = {
  offsetToPos: (offset: number) => Position;
  offsetToPosForDisplay: (offset: number) => Position;
};

export function createDocumentCursor(text: string): DocumentCursor {
  const newlinePositions = [];
  for (let i = 0; i < text.length; ++i) {
    if (text[i] === "\n") {
      newlinePositions.push(i);
    }
  }

  return {
    offsetToPos,
    offsetToPosForDisplay,
  };

  /**
   * Converts a position in a string to 0 based line and column number.
   * @param offset the 0 based offset into the string
   */
  function offsetToPos(offset: number): Position {
    let left = 0;
    let right = newlinePositions.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);

      if (newlinePositions[mid] < offset) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    let col = left === 0 ? offset : offset - newlinePositions[left - 1] - 1;

    return { line: left, character: col };
  }

  /**
   * Converts a position in a string to base 1 line and column number.
   * @param offset the 0 based offset into the string
   */
  function offsetToPosForDisplay(offset: number): Position {
    let pos = offsetToPos(offset);
    pos.line += 1;
    pos.character += 1;
    return pos;
  }
}
