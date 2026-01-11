import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";
import { createXmlUiParser } from "../parsers/xmlui-parser/parser";
import { nodeToComponentDef } from "../parsers/xmlui-parser/transform";
import { DiagnosticCategory, ErrCodes } from "../parsers/xmlui-parser/diagnostics";
import type { GetText, Error as ParseError } from "../parsers/xmlui-parser/parser";
import type { ParserError } from "../parsers/xmlui-parser/ParserError";
import { SyntaxKind } from "../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../parsers/xmlui-parser/syntax-node";
import type { ScriptParserErrorMessage } from "../abstractions/scripting/ScriptParserError";
import type { ModuleErrors } from "./script-runner/ScriptingSourceTree";

interface ErrorForDisplay extends ParseError {
  contextStartLine: number;
  contextSource: string;
  errPosLine: number;
  errPosCol: number;
  scriptContext?: "inline" | "script-tag";
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
    const component = nodeToComponentDef(node, getText, fileId, source);
    const transformResult = { component, errors: [] };
    return transformResult;
  } catch (e) {
    const erroneousCompoundComponentName = getCompoundCompName(node, getText);
    const rawLine = typeof (e as any)?.line === "number" ? (e as any).line : 0;
    const rawCol = typeof (e as any)?.column === "number" ? (e as any).column : 0;
    const message = (e as ParserError).message ?? "";
    let errLine = rawLine;
    let errCol = rawCol;
    if (!errLine && !errCol && message) {
      const match = /\[(\d+)\s*:\s*(\d+)\]\s*$/.exec(message);
      if (match) {
        errLine = Number(match[1]);
        errCol = Number(match[2]);
      }
    }
    const singleErr: ErrorForDisplay = {
      message,
      errPosCol: errCol,
      errPosLine: errLine,
      scriptContext: (e as any)?.scriptContext,
      code: ErrCodes.expEq,
      category: DiagnosticCategory.Error,
      pos: 0,
      end: 0,
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
      const hint = getFriendlyErrorHint(e.message, e.contextSource, e.scriptContext);
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
      const hintComponent: ComponentDef | undefined = hint
        ? {
            type: "Text",
            props: {
              value: `Hint: ${hint}`,
              color: "$color-info",
            },
          }
        : undefined;
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
        children: hintComponent ? [errMsgComponenet, hintComponent] : [errMsgComponenet],
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

function getScriptErrorCode(message: string): string | undefined {
  const match = /\bW\d{3}\b/.exec(message);
  return match?.[0];
}

function getScriptHintForCode(
  code: string,
  context: "inline" | "script-tag" | "code-behind",
): string | undefined {
  let prefix = "Script parse error.";
  if (context === "inline") {
    prefix = "Inline script parse error in a binding expression.";
  } else if (context === "script-tag") {
    prefix = "Script tag parse error.";
  } else if (context === "code-behind") {
    prefix = "Code-behind script parse error.";
  }

  // Syntax errors - missing delimiters
  if (code === "W001") return `${prefix} An expression is expected.`;
  if (code === "W003") return `${prefix} An identifier (variable or function name) is expected.`;
  if (code === "W004") return `${prefix} Check for a missing closing brace }.`;
  if (code === "W005") return `${prefix} Check for a missing closing bracket ].`;
  if (code === "W006") return `${prefix} Check for a missing closing parenthesis ).`;
  if (code === "W008") return `${prefix} A colon : is expected (object properties need key: value).`;
  if (code === "W009") return `${prefix} An equals sign = is expected.`;
  if (code === "W012") return `${prefix} An opening brace { is expected.`;
  if (code === "W014") return `${prefix} An opening parenthesis ( is expected.`;

  // Unexpected token
  if (code === "W002") return `${prefix} Unexpected token found. Check for typos or missing operators.`;

  // Structure errors
  if (code === "W007") return `${prefix} Invalid object property name. Property names must be strings or identifiers.`;
  if (code === "W010") return `${prefix} Invalid argument list. Check function call syntax.`;
  if (code === "W017") return `${prefix} Invalid sequence expression. Check comma placement.`;
  if (code === "W018") return `${prefix} Invalid object literal. Check object syntax { key: value }.`;

  // Control flow errors
  if (code === "W011") return `${prefix} For loop variable must be initialized (e.g., let i = 0).`;
  if (code === "W013") return `${prefix} A 'catch' or 'finally' block is required after 'try'.`;
  if (code === "W015") return `${prefix} 'case' or 'default' expected in switch statement.`;
  if (code === "W016") return `${prefix} Only one 'default' case is allowed per switch statement.`;

  // Module/import errors (code-behind only)
  if (code === "W019") return `${prefix} This identifier is already imported.`;
  if (code === "W020") return `${prefix} This function name is already defined in the module.`;
  if (code === "W021") return `${prefix} This identifier is already exported from the module.`;
  if (code === "W022") return `${prefix} Cannot find the specified module. Check the import path.`;
  if (code === "W023") return `${prefix} The module does not export this identifier.`;
  if (code === "W024") return `${prefix} The keyword 'function' is expected.`;
  if (code === "W025") return `${prefix} The keyword 'from' is expected in import statement.`;
  if (code === "W026") return `${prefix} A string literal is expected (use quotes).`;
  if (code === "W027") return `${prefix} Cannot declare 'var' in an imported module (use exported functions instead).`;
  if (code === "W028") return `${prefix} Invalid statement in module. Modules can only contain imports, exports, and function declarations.`;
  if (code === "W029") return `${prefix} Imported modules can only contain exported functions.`;
  if (code === "W030") return `${prefix} Nested declarations cannot be exported. Only top-level functions can be exported.`;

  // Special restrictions
  if (code === "W031") return `${prefix} Variable names cannot start with $ (reserved for context variables).`;

  return undefined;
}

function getFriendlyErrorHint(
  message: string,
  contextSource: string,
  scriptContext: "inline" | "script-tag" | undefined,
): string | undefined {
  const code = getScriptErrorCode(message);
  if (!code) {
    return undefined;
  }
  const context =
    scriptContext ?? (/<script\b/i.test(contextSource) ? "script-tag" : "inline");
  return getScriptHintForCode(code, context);
}

/** returns a component definition containing the errors.
 * It is a component and a compound component definition at the same time,
 * so that it can be used to render the errors for a compound component as well*/
function createScriptErrorComponent(
  error: ScriptParserErrorMessage,
  fileName: number | string,
): ComponentDef {
  const hint = getScriptHintForCode(error.code, "code-behind");
  const hintComponent: ComponentDef | undefined = hint
    ? {
        type: "Text",
        props: {
          value: `Hint: ${hint}`,
          color: "$color-info",
        },
      }
    : undefined;
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
          ...(hintComponent ? [hintComponent] : []),
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
      const hint = getScriptHintForCode(err.code, "code-behind");
      const hintComponent: ComponentDef | undefined = hint
        ? {
            type: "Text",
            props: {
              value: `Hint: ${hint}`,
              color: "$color-info",
            },
          }
        : undefined;
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
          ...(hintComponent ? [hintComponent] : []),
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

function addDisplayFieldsToErrors(errors: ParseError[], source: string): ErrorForDisplay[] {
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
