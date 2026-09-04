import * as T from "../../parsers/scripting/ScriptingNodeTypes";

/**
 * Readable names for XMLScript AST node types.
 *
 * Compiler diagnostics used to quote the raw numeric node type ("Unsupported 103
 * node"), which told an app author nothing about which line of their code to change.
 */
const SCRIPT_NODE_TYPE_NAMES: Record<number, string> = {
  [T.T_BLOCK_STATEMENT]: "block statement",
  [T.T_EMPTY_STATEMENT]: "empty statement",
  [T.T_EXPRESSION_STATEMENT]: "expression statement",
  [T.T_ARROW_EXPRESSION_STATEMENT]: "arrow expression statement",
  [T.T_LET_STATEMENT]: "let declaration",
  [T.T_CONST_STATEMENT]: "const declaration",
  [T.T_VAR_STATEMENT]: "var declaration",
  [T.T_IF_STATEMENT]: "if statement",
  [T.T_RETURN_STATEMENT]: "return statement",
  [T.T_BREAK_STATEMENT]: "break statement",
  [T.T_CONTINUE_STATEMENT]: "continue statement",
  [T.T_WHILE_STATEMENT]: "while statement",
  [T.T_DO_WHILE_STATEMENT]: "do-while statement",
  [T.T_FOR_STATEMENT]: "for statement",
  [T.T_FOR_IN_STATEMENT]: "for-in statement",
  [T.T_FOR_OF_STATEMENT]: "for-of statement",
  [T.T_THROW_STATEMENT]: "throw statement",
  [T.T_TRY_STATEMENT]: "try statement",
  [T.T_SWITCH_STATEMENT]: "switch statement",
  [T.T_FUNCTION_DECLARATION]: "function declaration",
  [T.T_ASYNC_FUNCTION_DECLARATION]: "async function declaration",
  [T.T_IMPORT_DECLARATION]: "import declaration",
  [T.T_UNARY_EXPRESSION]: "unary expression",
  [T.T_BINARY_EXPRESSION]: "binary expression",
  [T.T_SEQUENCE_EXPRESSION]: "sequence expression",
  [T.T_CONDITIONAL_EXPRESSION]: "conditional expression",
  [T.T_FUNCTION_INVOCATION_EXPRESSION]: "function invocation",
  [T.T_MEMBER_ACCESS_EXPRESSION]: "member access",
  [T.T_CALCULATED_MEMBER_ACCESS_EXPRESSION]: "calculated member access",
  [T.T_IDENTIFIER]: "identifier",
  [T.T_TEMPLATE_LITERAL_EXPRESSION]: "template literal",
  [T.T_LITERAL]: "literal",
  [T.T_ARRAY_LITERAL]: "array literal",
  [T.T_OBJECT_LITERAL]: "object literal",
  [T.T_SPREAD_EXPRESSION]: "spread expression",
  [T.T_ASSIGNMENT_EXPRESSION]: "assignment",
  [T.T_NO_ARG_EXPRESSION]: "no-argument expression",
  [T.T_ARROW_EXPRESSION]: "arrow function",
  [T.T_PREFIX_OP_EXPRESSION]: "prefix operator",
  [T.T_POSTFIX_OP_EXPRESSION]: "postfix operator",
  [T.T_REACTIVE_VAR_DECLARATION]: "reactive var declaration",
  [T.T_AWAIT_EXPRESSION]: "await expression",
  [T.T_NEW_EXPRESSION]: "new expression",
  [T.T_VAR_DECLARATION]: "variable declaration",
  [T.T_DESTRUCTURE]: "destructuring pattern",
  [T.T_ARRAY_DESTRUCTURE]: "array destructuring pattern",
  [T.T_OBJECT_DESTRUCTURE]: "object destructuring pattern",
  [T.T_SWITCH_CASE]: "switch case",
  [T.T_IMPORT_SPECIFIER]: "import specifier",
};

export function describeScriptNodeType(nodeType: string | number): string {
  const numericType = typeof nodeType === "number" ? nodeType : Number(nodeType);
  return SCRIPT_NODE_TYPE_NAMES[numericType] ?? "expression";
}
