import type { GenericToken } from "../../parsers/common/GenericToken";
import type { TokenType } from "../../parsers/scripting/TokenType";
import type { ScriptParserErrorMessage } from "../../abstractions/scripting/ScriptParserError";

// --- All binding expression tree node types
type ScriptNode = Statement | Expression;

type ScriptingToken = GenericToken<TokenType>;

// The root type of all source tree nodes
export interface ScripNodeBase {
  // Node type discriminator
  type: ScriptNode["type"];

  // The unique id of the node
  nodeId: number;

  // The start token of the node
  startToken?: ScriptingToken;

  // The end token of the node
  endToken?: ScriptingToken;
}

// Import the actual implementation constants from outside the abstractions folder
import * as NodeTypes from "../../parsers/scripting/ScriptingNodeTypes";

// Re-export the constants so they can be used both as types and values
export const {
  // Statement node type values
  T_BLOCK_STATEMENT,
  T_EMPTY_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_ARROW_EXPRESSION_STATEMENT,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
  T_VAR_STATEMENT,
  T_IF_STATEMENT,
  T_RETURN_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_WHILE_STATEMENT,
  T_DO_WHILE_STATEMENT,
  T_FOR_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_SWITCH_STATEMENT,
  T_FUNCTION_DECLARATION,
  T_ASYNC_FUNCTION_DECLARATION,
  T_IMPORT_DECLARATION,
  
  // Expression node type values
  T_UNARY_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_IDENTIFIER,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_LITERAL,
  T_ARRAY_LITERAL,
  T_OBJECT_LITERAL,
  T_SPREAD_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_NO_ARG_EXPRESSION,
  T_ARROW_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_REACTIVE_VAR_DECLARATION,
  T_AWAIT_EXPRESSION,
  T_NEW_EXPRESSION,
  
  // Other node type values
  T_VAR_DECLARATION,
  T_DESTRUCTURE,
  T_ARRAY_DESTRUCTURE,
  T_OBJECT_DESTRUCTURE,
  T_SWITCH_CASE,
  T_IMPORT_SPECIFIER
} = NodeTypes;

// --- Statement node types
type BLOCK_STATEMENT = typeof T_BLOCK_STATEMENT;
type EMPTY_STATEMENT = typeof T_EMPTY_STATEMENT;
type EXPRESSION_STATEMENT = typeof T_EXPRESSION_STATEMENT;
type ARROW_EXPRESSION_STATEMENT = typeof T_ARROW_EXPRESSION_STATEMENT;
type LET_STATEMENT = typeof T_LET_STATEMENT;
type CONST_STATEMENT = typeof T_CONST_STATEMENT;
type VAR_STATEMENT = typeof T_VAR_STATEMENT;
type IF_STATEMENT = typeof T_IF_STATEMENT;
type RETURN_STATEMENT = typeof T_RETURN_STATEMENT;
type BREAK_STATEMENT = typeof T_BREAK_STATEMENT;
type CONTINUE_STATEMENT = typeof T_CONTINUE_STATEMENT;
type WHILE_STATEMENT = typeof T_WHILE_STATEMENT;
type DO_WHILE_STATEMENT = typeof T_DO_WHILE_STATEMENT;
type FOR_STATEMENT = typeof T_FOR_STATEMENT;
type FOR_IN_STATEMENT = typeof T_FOR_IN_STATEMENT;
type FOR_OF_STATEMENT = typeof T_FOR_OF_STATEMENT;
type THROW_STATEMENT = typeof T_THROW_STATEMENT;
type TRY_STATEMENT = typeof T_TRY_STATEMENT;
type SWITCH_STATEMENT = typeof T_SWITCH_STATEMENT;
type FUNCTION_DECLARATION = typeof T_FUNCTION_DECLARATION;
type ASYNC_FUNCTION_DECLARATION = typeof T_ASYNC_FUNCTION_DECLARATION;
type IMPORT_DECLARATION = typeof T_IMPORT_DECLARATION;

// --- Expression node types
type UNARY_EXPRESSION = typeof T_UNARY_EXPRESSION;
type BINARY_EXPRESSION = typeof T_BINARY_EXPRESSION;
type SEQUENCE_EXPRESSION = typeof T_SEQUENCE_EXPRESSION;
type CONDITIONAL_EXPRESSION = typeof T_CONDITIONAL_EXPRESSION;
type FUNCTION_INVOCATION_EXPRESSION = typeof T_FUNCTION_INVOCATION_EXPRESSION;
type MEMBER_ACCESS_EXPRESSION = typeof T_MEMBER_ACCESS_EXPRESSION;
type CALCULATED_MEMBER_ACCESS_EXPRESSION = typeof T_CALCULATED_MEMBER_ACCESS_EXPRESSION;
type IDENTIFIER = typeof T_IDENTIFIER;
type TEMPLATE_LITERAL_EXPRESSION = typeof T_TEMPLATE_LITERAL_EXPRESSION;
type LITERAL = typeof T_LITERAL;
type ARRAY_LITERAL = typeof T_ARRAY_LITERAL;
type OBJECT_LITERAL = typeof T_OBJECT_LITERAL;
type SPREAD_EXPRESSION = typeof T_SPREAD_EXPRESSION;
type ASSIGNMENT_EXPRESSION = typeof T_ASSIGNMENT_EXPRESSION;
type NO_ARG_EXPRESSION = typeof T_NO_ARG_EXPRESSION;
type ARROW_EXPRESSION = typeof T_ARROW_EXPRESSION;
type PREFIX_OP_EXPRESSION = typeof T_PREFIX_OP_EXPRESSION;
type POSTFIX_OP_EXPRESSION = typeof T_POSTFIX_OP_EXPRESSION;
type REACTIVE_VAR_DECLARATION = typeof T_REACTIVE_VAR_DECLARATION;
type AWAIT_EXPRESSION = typeof T_AWAIT_EXPRESSION;
type NEW_EXPRESSION = typeof T_NEW_EXPRESSION;

// --- Other node types
type VAR_DECLARATION = typeof T_VAR_DECLARATION;
type DESTRUCTURE = typeof T_DESTRUCTURE;
type ARRAY_DESTRUCTURE = typeof T_ARRAY_DESTRUCTURE;
type OBJECT_DESTRUCTURE = typeof T_OBJECT_DESTRUCTURE;
type SWITCH_CASE = typeof T_SWITCH_CASE;
type IMPORT_SPECIFIER = typeof T_IMPORT_SPECIFIER;

// =====================================================================================================================
// Statements

export type Statement =
  | BlockStatement
  | EmptyStatement
  | ExpressionStatement
  | ArrowExpressionStatement
  | LetStatement
  | ConstStatement
  | VarStatement
  | IfStatement
  | ReturnStatement
  | BreakStatement
  | ContinueStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForInStatement
  | ForOfStatement
  | ThrowStatement
  | TryStatement
  | SwitchStatement
  | FunctionDeclaration
  | ImportDeclaration;

export type LoopStatement = WhileStatement | DoWhileStatement;

export interface EmptyStatement extends ScripNodeBase {
  type: EMPTY_STATEMENT;
}

export interface ExpressionStatement extends ScripNodeBase {
  type: EXPRESSION_STATEMENT;
  expr: Expression;
}

export interface ArrowExpressionStatement extends ScripNodeBase {
  type: ARROW_EXPRESSION_STATEMENT;
  expr: ArrowExpression;
}

export interface VarDeclaration extends ExpressionBase {
  type: VAR_DECLARATION;
  id?: string;
  aDestr?: ArrayDestructure[];
  oDestr?: ObjectDestructure[];
  expr?: Expression;
}

export interface DestructureBase extends ExpressionBase {
  id?: string;
  aDestr?: ArrayDestructure[];
  oDestr?: ObjectDestructure[];
}

export interface Destructure extends DestructureBase {
  type: DESTRUCTURE;
  aDestr?: ArrayDestructure[];
  oDestr?: ObjectDestructure[];
}

export interface ArrayDestructure extends DestructureBase {
  type: ARRAY_DESTRUCTURE;
}

export interface ObjectDestructure extends DestructureBase {
  type: OBJECT_DESTRUCTURE;
  id: string;
  alias?: string;
}

export interface LetStatement extends ScripNodeBase {
  type: LET_STATEMENT;
  decls: VarDeclaration[];
}

export interface ConstStatement extends ScripNodeBase {
  type: CONST_STATEMENT;
  decls: VarDeclaration[];
}

export interface VarStatement extends ScripNodeBase {
  type: VAR_STATEMENT;
  decls: ReactiveVarDeclaration[];
}

export interface ReactiveVarDeclaration extends ExpressionBase {
  type: REACTIVE_VAR_DECLARATION;
  id: Identifier;
  expr: Expression;
}

export interface BlockStatement extends ScripNodeBase {
  type: BLOCK_STATEMENT;
  stmts: Statement[];
}

export interface IfStatement extends ScripNodeBase {
  type: IF_STATEMENT;
  cond: Expression;
  thenB: Statement;
  elseB?: Statement;
}

export interface ReturnStatement extends ScripNodeBase {
  type: RETURN_STATEMENT;
  expr?: Expression;
}

export interface WhileStatement extends ScripNodeBase {
  type: WHILE_STATEMENT;
  cond: Expression;
  body: Statement;
}

export interface DoWhileStatement extends ScripNodeBase {
  type: DO_WHILE_STATEMENT;
  cond: Expression;
  body: Statement;
}

export interface BreakStatement extends ScripNodeBase {
  type: BREAK_STATEMENT;
}

export interface ContinueStatement extends ScripNodeBase {
  type: CONTINUE_STATEMENT;
}

export interface ThrowStatement extends ScripNodeBase {
  type: THROW_STATEMENT;
  expr: Expression;
}

export interface TryStatement extends ScripNodeBase {
  type: TRY_STATEMENT;
  tryB: BlockStatement;
  catchB?: BlockStatement;
  catchV?: Identifier;
  finallyB?: BlockStatement;
}

export interface ForStatement extends ScripNodeBase {
  type: FOR_STATEMENT;
  init?: ExpressionStatement | LetStatement;
  cond?: Expression;
  upd?: Expression;
  body: Statement;
}

export type ForVarBinding = "let" | "const" | "none";
export interface ForInStatement extends ScripNodeBase {
  type: FOR_IN_STATEMENT;
  varB: ForVarBinding;
  id: Identifier;
  expr: Expression;
  body: Statement;
}

export interface ForOfStatement extends ScripNodeBase {
  type: FOR_OF_STATEMENT;
  varB: ForVarBinding;
  id: Identifier;
  expr: Expression;
  body: Statement;
}

export interface SwitchStatement extends ScripNodeBase {
  type: SWITCH_STATEMENT;
  expr: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase extends ExpressionBase {
  type: SWITCH_CASE;
  caseE?: Expression;
  stmts?: Statement[];
}

export interface FunctionDeclaration extends ScripNodeBase {
  type: FUNCTION_DECLARATION | ASYNC_FUNCTION_DECLARATION;
  id: Identifier;
  args: Expression[];
  stmt: BlockStatement;
  async?: boolean;
}

export interface ImportSpecifier extends ExpressionBase {
  type: IMPORT_SPECIFIER;
  imported: Identifier;
  local?: Identifier;
}

export interface ImportDeclaration extends ScripNodeBase {
  type: IMPORT_DECLARATION;
  specifiers: ImportSpecifier[];
  source: Literal;
}

// =====================================================================================================================
// Expressions

// All syntax nodes that represent an expression
export type Expression =
  | UnaryExpression
  | BinaryExpression
  | SequenceExpression
  | ConditionalExpression
  | FunctionInvocationExpression
  | MemberAccessExpression
  | CalculatedMemberAccessExpression
  | Identifier
  | TemplateLiteralExpression
  | Literal
  | ArrayLiteral
  | ObjectLiteral
  | SpreadExpression
  | AssignmentExpression
  | NoArgExpression
  | ArrowExpression
  | PrefixOpExpression
  | PostfixOpExpression
  | ReactiveVarDeclaration
  | AwaitExpression
  | NewExpression
  | VarDeclaration
  | Destructure
  | ObjectDestructure
  | ArrayDestructure
  | SwitchCase;

// Common base node for all expression syntax nodes
export interface ExpressionBase extends ScripNodeBase {
  // Is this expression parenthesized?
  parenthesized?: number;
}

export type UnaryOpSymbols = "+" | "-" | "~" | "!" | "typeof" | "delete";

export type BinaryOpSymbols =
  | "**"
  | "*"
  | "/"
  | "%"
  | "+"
  | "-"
  | "<<"
  | ">>"
  | ">>>"
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "==="
  | "!="
  | "!=="
  | "&"
  | "|"
  | "^"
  | "&&"
  | "||"
  | "??"
  | "in";

export type AssignmentSymbols =
  | "="
  | "+="
  | "-="
  | "**="
  | "*="
  | "/="
  | "%="
  | "<<="
  | ">>="
  | ">>>="
  | "&="
  | "^="
  | "|="
  | "&&="
  | "||="
  | "??=";

export type PrefixOpSymbol = "++" | "--";

export interface UnaryExpression extends ExpressionBase {
  type: UNARY_EXPRESSION;
  op: UnaryOpSymbols;
  expr: Expression;
}

export interface BinaryExpression extends ExpressionBase {
  type: BINARY_EXPRESSION;
  op: BinaryOpSymbols;
  left: Expression;
  right: Expression;
}

export interface SequenceExpression extends ExpressionBase {
  type: SEQUENCE_EXPRESSION;
  exprs: Expression[];
  loose?: boolean;
}

export interface ConditionalExpression extends ExpressionBase {
  type: CONDITIONAL_EXPRESSION;
  cond: Expression;
  thenE: Expression;
  elseE: Expression;
}

export interface FunctionInvocationExpression extends ExpressionBase {
  type: FUNCTION_INVOCATION_EXPRESSION;
  obj: Expression;
  arguments: Expression[];
}

export interface MemberAccessExpression extends ExpressionBase {
  type: MEMBER_ACCESS_EXPRESSION;
  obj: Expression;
  member: string;
  opt?: boolean;
}

export interface CalculatedMemberAccessExpression extends ExpressionBase {
  type: CALCULATED_MEMBER_ACCESS_EXPRESSION;
  obj: Expression;
  member: Expression;
}

export interface Identifier extends ExpressionBase {
  type: IDENTIFIER;
  name: string;
  isGlobal?: boolean;
}

export interface Literal extends ExpressionBase {
  type: LITERAL;
  value: any;
}

export interface TemplateLiteralExpression extends ExpressionBase {
  type: TEMPLATE_LITERAL_EXPRESSION;
  segments: (Literal | Expression)[];
}

export interface ArrayLiteral extends ExpressionBase {
  type: ARRAY_LITERAL;
  items: Expression[];
  loose?: boolean;
}

export interface ObjectLiteral extends ExpressionBase {
  type: OBJECT_LITERAL;
  props: (SpreadExpression | [Expression, Expression])[];
}

export interface SpreadExpression extends ExpressionBase {
  type: SPREAD_EXPRESSION;
  expr: Expression;
}

export interface AssignmentExpression extends ExpressionBase {
  type: ASSIGNMENT_EXPRESSION;
  leftValue: Expression;
  op: AssignmentSymbols;
  expr: Expression;
}

export interface NoArgExpression extends ExpressionBase {
  type: NO_ARG_EXPRESSION;
}

export interface ArrowExpression extends ExpressionBase {
  type: ARROW_EXPRESSION;
  name?: string;
  args: Expression[];
  statement: Statement;
  async?: boolean;
}

export interface PrefixOpExpression extends ExpressionBase {
  type: PREFIX_OP_EXPRESSION;
  op: PrefixOpSymbol;
  expr: Expression;
}

export interface PostfixOpExpression extends ExpressionBase {
  type: POSTFIX_OP_EXPRESSION;
  op: PrefixOpSymbol;
  expr: Expression;
}

export interface AwaitExpression extends ExpressionBase {
  type: AWAIT_EXPRESSION;
  expr: Expression;
}

export interface NewExpression extends ExpressionBase {
  type: NEW_EXPRESSION;
  callee: Expression;
  arguments: Expression[];
}

/**
 * Represents a parsed and resolved module
 */
export type ScriptModule = {
  type: "ScriptModule";
  name: string;
  parent?: ScriptModule | null;
  functions: Record<string, FunctionDeclaration>;
  statements: Statement[];
  sources: Map<Statement, string>;
};

/**
 * Represents a module error
 */
export type ModuleErrors = Record<string, ScriptParserErrorMessage[]>;

export type CollectedDeclarations = {
  vars: Record<string, CodeDeclaration>;
  functions: Record<string, CodeDeclaration>;
  moduleErrors?: ModuleErrors;
  hasInvalidStatements?: boolean;
};

export type CodeDeclaration = {
  source?: string;
  tree: Expression;
  [x: string]: unknown;
};
