import type { GenericToken } from "../../parsers/common/GenericToken";
import type { TokenType } from "../../parsers/scripting-exp/TokenType";
import { ScriptParserErrorMessage } from "./ScriptParserError";

// --- All binding expression tree node types
type ScriptNode = Statement | Expression;

type ScriptingToken = GenericToken<TokenType>;

// The root type of all source tree nodes
export interface ScripNodeBase {
  // Node type discriminator
  type: ScriptNode["type"];

  // The start token of the node
  startToken?: ScriptingToken;

  // The end token of the node
  endToken?: ScriptingToken;
}

// --- Statement node type values
export const T_BLOCK_STATEMENT = 1;
export const T_EMPTY_STATEMENT = 2;
export const T_EXPRESSION_STATEMENT = 3;
export const T_ARROW_EXPRESSION_STATEMENT = 4;
export const T_LET_STATEMENT = 5;
export const T_CONST_STATEMENT = 6;
export const T_VAR_STATEMENT = 7;
export const T_IF_STATEMENT = 8;
export const T_RETURN_STATEMENT = 9;
export const T_BREAK_STATEMENT = 10;
export const T_CONTINUE_STATEMENT = 11;
export const T_WHILE_STATEMENT = 12;
export const T_DO_WHILE_STATEMENT = 13;
export const T_FOR_STATEMENT = 14;
export const T_FOR_IN_STATEMENT = 15;
export const T_FOR_OF_STATEMENT = 16;
export const T_THROW_STATEMENT = 17;
export const T_TRY_STATEMENT = 18;
export const T_SWITCH_STATEMENT = 19;
export const T_FUNCTION_DECLARATION = 20;
export const T_IMPORT_DECLARATION = 21;

// --- Expression node type values
export const T_UNARY_EXPRESSION = 100;
export const T_BINARY_EXPRESSION = 101;
export const T_SEQUENCE_EXPRESSION = 102;
export const T_CONDITIONAL_EXPRESSION = 103;
export const T_FUNCTION_INVOCATION_EXPRESSION = 104;
export const T_MEMBER_ACCESS_EXPRESSION = 105;
export const T_CALCULATED_MEMBER_ACCESS_EXPRESSION = 106;
export const T_IDENTIFIER = 107;
export const T_TEMPLATE_LITERAL_EXPRESSION = 108;
export const T_LITERAL = 109;
export const T_ARRAY_LITERAL = 110;
export const T_OBJECT_LITERAL = 111;
export const T_SPREAD_EXPRESSION = 112;
export const T_ASSIGNMENT_EXPRESSION = 113;
export const T_NO_ARG_EXPRESSION = 114;
export const T_ARROW_EXPRESSION = 115;
export const T_PREFIX_OP_EXPRESSION = 116;
export const T_POSTFIX_OP_EXPRESSION = 117;
export const T_REACTIVE_VAR_DECLARATION = 118;

// --- Other node type values
export const T_VAR_DECLARATION = 200;
export const T_DESTRUCTURE = 201;
export const T_ARRAY_DESTRUCTURE = 202;
export const T_OBJECT_DESTRUCTURE = 203;
export const T_SWITCH_CASE = 204;

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

// --- Other node types
type VAR_DECLARATION = typeof T_VAR_DECLARATION;
type DESTRUCTURE = typeof T_DESTRUCTURE;
type ARRAY_DESTRUCTURE = typeof T_ARRAY_DESTRUCTURE;
type OBJECT_DESTRUCTURE = typeof T_OBJECT_DESTRUCTURE;
type SWITCH_CASE = typeof T_SWITCH_CASE;

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
  type: FUNCTION_DECLARATION;
  id: Identifier;
  args: Expression[];
  stmt: BlockStatement;
  exp?: boolean;
}

export type ImportedItem = { id: Identifier; source: string };
export interface ImportDeclaration extends ScripNodeBase {
  type: IMPORT_DECLARATION;
  imports: ImportedItem[];
  moduleFile: string;
  module?: ScriptModule | null;
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

// =====================================================================================================================
// Property values (including binding expressions)

export type PropertyValue = SinglePropertyValue | SingleExpressionValue | CompoundPropertyValue;

export interface SinglePropertyValue {
  type: "SPV";
  value: any;
}

export interface SingleExpressionValue {
  type: "SEV";
  expr: Expression;
}

export interface CompoundPropertyValue {
  type: "CPV";
  parts: (string | Expression)[];
}

/**
 * Represents a parsed and resolved module
 */
export type ScriptModule = {
  type: "ScriptModule";
  name: string;
  parent?: ScriptModule | null;
  exports: Record<string, any>;
  imports: Record<string, Record<string, any>>;
  importedModules: ScriptModule[];
  functions: Record<string, FunctionDeclaration>;
  statements: Statement[];
  sources: Map<Statement, string>;
  executed: boolean;
};

/**
 * Represents a module error
 */
export type ModuleErrors = Record<string, ScriptParserErrorMessage[]>;

export type CollectedDeclarations = {
  vars: Record<string, CodeDeclaration>;
  functions: Record<string, CodeDeclaration>;
  moduleErrors?: ModuleErrors;
};

export type CodeDeclaration = {
  source?: string;
  tree: Expression;
  [x: string]: unknown;
};
