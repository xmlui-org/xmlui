import type { GenericToken } from "../../parsers/common/GenericToken";

import { TokenType } from "../../parsers/scripting-exp/TokenType";

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
  type: "EmptyS";
}

export interface ExpressionStatement extends ScripNodeBase {
  type: "ExprS";
  expr: Expression;
}

export interface ArrowExpressionStatement extends ScripNodeBase {
  type: "ArrowS";
  expr: ArrowExpression;
}

export interface VarDeclaration extends ExpressionBase {
  type: "VarD";
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
  type: "Destr";
  aDestr?: ArrayDestructure[];
  oDestr?: ObjectDestructure[];
}

export interface ArrayDestructure extends DestructureBase {
  type: "ADestr";
}

export interface ObjectDestructure extends DestructureBase {
  type: "ODestr";
  id: string;
  alias?: string;
}

export interface LetStatement extends ScripNodeBase {
  type: "LetS";
  decls: VarDeclaration[];
}

export interface ConstStatement extends ScripNodeBase {
  type: "ConstS";
  decls: VarDeclaration[];
}

export interface VarStatement extends ScripNodeBase {
  type: "VarS";
  decls: ReactiveVarDeclaration[];
}

export interface ReactiveVarDeclaration extends ExpressionBase {
  type: "RVarD";
  id: Identifier;
  expr: Expression;
}

export interface BlockStatement extends ScripNodeBase {
  type: "BlockS";
  stmts: Statement[];
}

export interface IfStatement extends ScripNodeBase {
  type: "IfS";
  cond: Expression;
  thenB: Statement;
  elseB?: Statement;
}

export interface ReturnStatement extends ScripNodeBase {
  type: "RetS";
  expr?: Expression;
}

export interface WhileStatement extends ScripNodeBase {
  type: "WhileS";
  cond: Expression;
  body: Statement;
}

export interface DoWhileStatement extends ScripNodeBase {
  type: "DoWS";
  cond: Expression;
  body: Statement;
}

export interface BreakStatement extends ScripNodeBase {
  type: "BrkS";
}

export interface ContinueStatement extends ScripNodeBase {
  type: "ContS";
}

export interface ThrowStatement extends ScripNodeBase {
  type: "ThrowS";
  expr: Expression;
}

export interface TryStatement extends ScripNodeBase {
  type: "TryS";
  tryB: BlockStatement;
  catchB?: BlockStatement;
  catchV?: Identifier;
  finallyB?: BlockStatement;
}

export interface ForStatement extends ScripNodeBase {
  type: "ForS";
  init?: ExpressionStatement | LetStatement;
  cond?: Expression;
  upd?: Expression;
  body: Statement;
}

export type ForVarBinding = "let" | "const" | "none";
export interface ForInStatement extends ScripNodeBase {
  type: "ForInS";
  varB: ForVarBinding;
  id: Identifier;
  expr: Expression;
  body: Statement;
}

export interface ForOfStatement extends ScripNodeBase {
  type: "ForOfS";
  varB: ForVarBinding;
  id: Identifier;
  expr: Expression;
  body: Statement;
}

export interface SwitchStatement extends ScripNodeBase {
  type: "SwitchS";
  expr: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase extends ExpressionBase {
  type: "SwitchC";
  caseE?: Expression;
  stmts?: Statement[];
}

export interface FunctionDeclaration extends ScripNodeBase {
  type: "FuncD";
  id: Identifier;
  args: Expression[];
  stmt: BlockStatement;
  exp?: boolean;
}

export type ImportedItem = { id: Identifier, source: string };
export interface ImportDeclaration extends ScripNodeBase {
  type: "ImportD";
  imports: ImportedItem[];
  moduleFile: string;
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
  type: "UnaryE";
  op: UnaryOpSymbols;
  expr: Expression;
}

export interface BinaryExpression extends ExpressionBase {
  type: "BinaryE";
  op: BinaryOpSymbols;
  left: Expression;
  right: Expression;
}

export interface SequenceExpression extends ExpressionBase {
  type: "SeqE";
  exprs: Expression[];
  loose?: boolean;
}

export interface ConditionalExpression extends ExpressionBase {
  type: "CondE";
  cond: Expression;
  thenE: Expression;
  elseE: Expression;
}

export interface FunctionInvocationExpression extends ExpressionBase {
  type: "InvokeE";
  obj: Expression;
  arguments: Expression[];
}

export interface MemberAccessExpression extends ExpressionBase {
  type: "MembE";
  obj: Expression;
  member: string;
  opt?: boolean;
}

export interface CalculatedMemberAccessExpression extends ExpressionBase {
  type: "CMembE";
  obj: Expression;
  member: Expression;
}

export interface Identifier extends ExpressionBase {
  type: "IdE";
  name: string;
  isGlobal?: boolean;
}

export interface Literal extends ExpressionBase {
  type: "LitE";
  value: any;
}

export interface TemplateLiteralExpression extends ExpressionBase {
  type: "TempLitE";
  segments: (Literal | Expression)[];
}

export interface ArrayLiteral extends ExpressionBase {
  type: "ALitE";
  items: Expression[];
  loose?: boolean;
}

export interface ObjectLiteral extends ExpressionBase {
  type: "OLitE";
  props: (SpreadExpression | [Expression, Expression])[];
}

export interface SpreadExpression extends ExpressionBase {
  type: "SpreadE";
  expr: Expression;
}

export interface AssignmentExpression extends ExpressionBase {
  type: "AsgnE";
  leftValue: Expression;
  op: AssignmentSymbols;
  expr: Expression;
}

export interface NoArgExpression extends ExpressionBase {
  type: "NoArgE";
}

export interface ArrowExpression extends ExpressionBase {
  type: "ArrowE";
  name?: string;
  args: Expression[];
  statement: Statement;
}

export interface PrefixOpExpression extends ExpressionBase {
  type: "PrefE";
  op: PrefixOpSymbol;
  expr: Expression;
}

export interface PostfixOpExpression extends ExpressionBase {
  type: "PostfE";
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
