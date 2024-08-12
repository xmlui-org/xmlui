import type { ScriptParserErrorMessage } from "./ScriptParserError";

import {BlockScope} from "../BlockScope";
import { Token } from "./Token";

// All binding expression tree node types
type Node = Statement | Expression | SwitchCase;

// The root type of all source tree nodes
export interface BaseNode {
  /**
   * Node type discriminator
   */
  type: Node["type"];

  /**
   * Start position (inclusive) of the node
   */
  startPosition?: number;

  /**
   * End position (exclusive)
   */
  endPosition?: number;

  /**
   * Start line number of the start token of the node
   */
  startLine?: number;

  /**
   * End line number of the end token of the node
   */
  endLine?: number;

  /**
   * Start column number (inclusive) of the node
   */
  startColumn?: number;

  /**
   * End column number (exclusive) of the node
   */
  endColumn?: number;

  /**
   * The source code of the expression
   */
  source?: string;

  /**
   * The start token of the node
   */
  startToken?: Token;

  /**
   * The end token of the node
   */
  endToken?: Token;
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

// The base node of statements
export interface StatementBase extends BaseNode {
  // Guard flag used when processing a statement
  guard?: boolean;

  // Flag indicating if the block scope should be removed
  removeBlockScope?: boolean;

  // Flag indicating if this is the last statement of a try block
  completeTryBlock?: boolean;

  // Flag indicating if this is the last statement of a catch block
  completeCatchBlock?: boolean;

  // Flag indicating if this is the last statement of a finally block
  completeFinallyBlock?: boolean;
}

export interface EmptyStatement extends StatementBase {
  type: "EmptyS";
}

export interface ExpressionStatement extends StatementBase {
  type: "ExprS";
  expression: Expression;
}

export interface ArrowExpressionStatement extends StatementBase {
  type: "ArrowS";
  expression: ArrowExpression;
}

export interface VarDeclaration extends ExpressionBase {
  type: "VarD";
  id?: string;
  arrayDestruct?: ArrayDestructure[],
  objectDestruct?: ObjectDestructure[],
  expression?: Expression;
}

export interface DestructureBase extends ExpressionBase {
  id?: string,
  arrayDestruct?: ArrayDestructure[];
  objectDestruct?: ObjectDestructure[];
}

export interface Destructure extends DestructureBase {
  type: "Destr"
  arrayDestruct?: ArrayDestructure[];
  objectDestruct?: ObjectDestructure[];
}

export interface ArrayDestructure extends DestructureBase {
  type: "ADestr",
}

export interface ObjectDestructure extends DestructureBase {
  type: "ODestr",
  id: string;
  alias?: string;
}

export interface LetStatement extends StatementBase {
  type: "LetS";
  declarations: VarDeclaration[];
}

export interface ConstStatement extends StatementBase {
  type: "ConstS";
  declarations: VarDeclaration[];
  isExported?: boolean;
}

export interface VarStatement extends StatementBase {
  type: "VarS";
  declarations: ReactiveVarDeclaration[];
}

export interface ReactiveVarDeclaration extends ExpressionBase {
  type: "RVarD";
  id: string;
  expression: Expression;
}

export interface BlockStatement extends StatementBase {
  type: "BlockS";
  statements: Statement[];
}

export interface IfStatement extends StatementBase {
  type: "IfS";
  condition: Expression;
  thenBranch: Statement;
  elseBranch?: Statement;
}

export interface ReturnStatement extends StatementBase {
  type: "RetS";
  expression?: Expression;
}

export interface WhileStatement extends StatementBase {
  type: "WhileS";
  condition: Expression;
  body: Statement;
}

export interface DoWhileStatement extends StatementBase {
  type: "DoWS";
  condition: Expression;
  body: Statement;
}

export interface BreakStatement extends StatementBase {
  type: "BrkS";
}

export interface ContinueStatement extends StatementBase {
  type: "ContS";
}

export interface ThrowStatement extends StatementBase {
  type: "ThrowS";
  expression: Expression;
}

export interface TryStatement extends StatementBase {
  type: "TryS";
  tryBlock: BlockStatement;
  catchBlock?: BlockStatement;
  catchVariable?: string;
  finallyBlock?: BlockStatement;
}

export interface ForStatement extends StatementBase {
  type: "ForS";
  init?: ExpressionStatement | LetStatement;
  condition?: Expression;
  update?: Expression;
  body: Statement;
}

export type ForVarBinding = "let" | "const" | "none";
export interface ForInStatement extends StatementBase {
  type: "ForInS";
  varBinding: ForVarBinding;
  id: string;
  expression: Expression;
  body: Statement;

  // Object keys in a for..in loop
  keys?: string[];

  // Object key index in a for
  keyIndex?: number;
}

export interface ForOfStatement extends StatementBase {
  type: "ForOfS";
  varBinding: ForVarBinding;
  id: string;
  expression: Expression;
  body: Statement;

  // --- Iterator used in for..of
  iterator?: any;
}

export interface SwitchStatement extends StatementBase {
  type: "SwitchS";
  expression: Expression;
  cases: SwitchCase[];
}

export interface SwitchCase extends BaseNode {
  type: "SwitchC";
  caseExpression?: Expression;
  statements?: Statement[];
}

export interface FunctionDeclaration extends StatementBase {
  type: "FuncD";
  name: string;
  args: Expression[];
  statement: BlockStatement;
  isExported?: boolean;
  closureContext?: BlockScope[];
}

export interface ImportDeclaration extends StatementBase {
  type: "ImportD";
  imports: Record<string, string>;
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

// Common base node for all expression syntax nodes
export interface ExpressionBase extends BaseNode {
  // The value of the expression.
  value?: any;

  // Is this expression parenthesized?
  parenthesized?: number;

  // The scope in which a left-hand value can be resolved
  valueScope?: any;

  // The index to resolve the left-hand value in its resolution scope
  valueIndex?: string | number;
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
  operator: UnaryOpSymbols;
  operand: Expression;
}

export interface BinaryExpression extends ExpressionBase {
  type: "BinaryE";
  operator: BinaryOpSymbols;
  left: Expression;
  right: Expression;
}

export interface SequenceExpression extends ExpressionBase {
  type: "SeqE";
  expressions: Expression[];
  loose?: boolean;
}

export interface ConditionalExpression extends ExpressionBase {
  type: "CondE";
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}

export interface FunctionInvocationExpression extends ExpressionBase {
  type: "InvokeE";
  object: Expression;
  arguments: Expression[];
}

export interface MemberAccessExpression extends ExpressionBase {
  type: "MembE";
  object: Expression;
  member: string;
  isOptional?: boolean;
}

export interface CalculatedMemberAccessExpression extends ExpressionBase {
  type: "CMembE";
  object: Expression;
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
  operand: Expression;
}

export interface AssignmentExpression extends ExpressionBase {
  type: "AsgnE";
  leftValue: Expression;
  operator: AssignmentSymbols;
  operand: Expression;
}

export interface NoArgExpression extends ExpressionBase {
  type: "NoArgE";
}

export interface ArrowExpression extends ExpressionBase {
  type: "ArrowE";
  args: Expression[];
  statement: Statement;
  closureContext?: BlockScope[];
}

export interface PrefixOpExpression extends ExpressionBase {
  type: "PrefE";
  operator: PrefixOpSymbol;
  operand: Expression;
}

export interface PostfixOpExpression extends ExpressionBase {
  type: "PostfE";
  operator: PrefixOpSymbol;
  operand: Expression;
}

/**
 * Represents a parsed and resolved module
 */
export type ScriptModule = {
  type: "ScriptModule";
  name: string;
  parent?: ScriptModule | null;
  exports: Map<string, any>;
  imports: Record<string, any>;
  importedModules: ScriptModule[];
  functions: Record<string, FunctionDeclaration>;
  statements: Statement[];
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



