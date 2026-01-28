import {
  type ArrayDestructure,
  type ArrayLiteral,
  type ArrowExpression,
  type AssignmentExpression,
  type AwaitExpression,
  type ScripNodeBase,
  type BinaryExpression,
  type BlockStatement,
  type BreakStatement,
  type CalculatedMemberAccessExpression,
  type ConditionalExpression,
  type ConstStatement,
  type ContinueStatement,
  type Destructure,
  type DoWhileStatement,
  type EmptyStatement,
  type Expression,
  type ExpressionStatement,
  type ForInStatement,
  type ForOfStatement,
  type ForStatement,
  type ForVarBinding,
  type FunctionDeclaration,
  type FunctionInvocationExpression,
  type Identifier,
  type IfStatement,
  type LetStatement,
  type Literal,
  type MemberAccessExpression,
  type NoArgExpression,
  type NewExpression,
  type ObjectDestructure,
  type ObjectLiteral,
  type PostfixOpExpression,
  type PrefixOpExpression,
  type ReactiveVarDeclaration,
  type ReturnStatement,
  type SequenceExpression,
  type SpreadExpression,
  type Statement,
  type SwitchCase,
  type SwitchStatement,
  type ThrowStatement,
  type TryStatement,
  type UnaryExpression,
  type VarDeclaration,
  type VarStatement,
  type WhileStatement,
  type TemplateLiteralExpression,
  T_EMPTY_STATEMENT,
  T_BREAK_STATEMENT,
  T_CONTINUE_STATEMENT,
  T_EXPRESSION_STATEMENT,
  T_VAR_DECLARATION,
  T_LET_STATEMENT,
  T_CONST_STATEMENT,
  T_REACTIVE_VAR_DECLARATION,
  T_VAR_STATEMENT,
  T_ARRAY_DESTRUCTURE,
  T_BLOCK_STATEMENT,
  T_IF_STATEMENT,
  T_WHILE_STATEMENT,
  T_OBJECT_DESTRUCTURE,
  T_DO_WHILE_STATEMENT,
  T_RETURN_STATEMENT,
  T_FOR_STATEMENT,
  T_FOR_IN_STATEMENT,
  T_FOR_OF_STATEMENT,
  T_IDENTIFIER,
  T_THROW_STATEMENT,
  T_TRY_STATEMENT,
  T_SWITCH_CASE,
  T_SWITCH_STATEMENT,
  T_NO_ARG_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_OBJECT_LITERAL,
  T_ARRAY_LITERAL,
  T_SPREAD_EXPRESSION,
  T_FUNCTION_DECLARATION,
  T_ARROW_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_ASSIGNMENT_EXPRESSION,
  T_BINARY_EXPRESSION,
  T_UNARY_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_MEMBER_ACCESS_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_POSTFIX_OP_EXPRESSION,
  T_PREFIX_OP_EXPRESSION,
  T_LITERAL,
  T_TEMPLATE_LITERAL_EXPRESSION,
  T_DESTRUCTURE,
  T_AWAIT_EXPRESSION,
  T_NEW_EXPRESSION,
  T_ASYNC_FUNCTION_DECLARATION,
} from "../../components-core/script-runner/ScriptingSourceTree";
import type { GenericToken } from "../common/GenericToken";
import { InputStream } from "../common/InputStream";
import { Lexer } from "./Lexer";
import { ParserError, errorMessages } from "./ParserError";
import { tokenTraits } from "./TokenTrait";
import { TokenType } from "./TokenType";
import type { ErrorCodes, ParserErrorMessage } from "./ParserError";

type Token = GenericToken<TokenType>;

/**
 * States of the string parsing
 */
enum StrParseState {
  Normal,
  Backslash,
  X,
  Xh,
  UX1,
  UX2,
  UX3,
  UX4,
  Ucp1,
  Ucp2,
  Ucp3,
  Ucp4,
  Ucp5,
  Ucp6,
  UcpTail,
}

let lastNodeId = 0;

export function createXmlUiTreeNodeId(): number {
  return ++lastNodeId;
}

/**
 * This class parses a binding expression and transforms it into an evaluable expression tree
 */
export class Parser {
  // --- Keep track of error messages
  private _parseErrors: ParserErrorMessage[] = [];

  // --- Use this lexer
  private _lexer: Lexer;

  // --- Indicates the parsing level
  private _statementLevel = 0;

  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   */
  constructor(source?: string) {
    this._lexer = new Lexer(new InputStream(source ?? ""));
  }

  /**
   * Sets the source code to parse
   * @param source Source code to parse
   */
  setSource(source: string): void {
    this._lexer = new Lexer(new InputStream(source));
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): ParserErrorMessage[] {
    return this._parseErrors;
  }

  /**
   * Gets the current token
   */
  get current(): Token {
    return this._lexer.peek();
  }

  /**
   * Checks if we're at the end of the expression
   */
  get isEof(): boolean {
    return this._lexer.peek().type === TokenType.Eof;
  }

  /**
   * Gets the characters remaining after parsing
   */
  getTail(): string {
    return this._lexer.getTail();
  }

  // ==========================================================================
  // Statement parsing

  /**
   * Parses a list of statements:
   *
   * statements
   *   : statement*
   *   ;
   *
   * statement
   *   : emptyStatement
   *   | expressionStatement
   *   | letStatement
   *   | returnStatement
   *   ;
   */
  parseStatements(): Statement[] | null {
    this._statementLevel = 0;
    const statements: Statement[] = [];
    while (!this.isEof) {
      const statement = this.parseStatement();
      if (!statement) return null;
      statements.push(statement);
      if (statement.type !== T_EMPTY_STATEMENT) {
        this.skipToken(TokenType.Semicolon);
      }
    }
    return statements;
  }

  /**
   * Parses a single statement
   */
  private parseStatement(allowSequence = true): Statement | null {
    this._statementLevel++;
    try {
      const startToken = this._lexer.peek();
      switch (startToken.type) {
        case TokenType.Semicolon:
          return this.parseEmptyStatement();
        case TokenType.Let:
          return this.parseLetStatement();
        case TokenType.Const:
          return this.parseConstStatement();
        case TokenType.Var:
          return this.parseVarStatement();
        case TokenType.LBrace:
          return this.parseBlockStatement();
        case TokenType.If:
          return this.parseIfStatement();
        case TokenType.Do:
          return this.parseDoWhileStatement();
        case TokenType.While:
          return this.parseWhileStatement();
        case TokenType.Return:
          return this.parseReturnStatement();
        case TokenType.Break:
          this._lexer.get();
          return this.createStatementNode<BreakStatement>(
            T_BREAK_STATEMENT,
            {},
            startToken,
            startToken,
          );
        case TokenType.Continue:
          this._lexer.get();
          return this.createStatementNode<ContinueStatement>(
            T_CONTINUE_STATEMENT,
            {},
            startToken,
            startToken,
          );
        case TokenType.For:
          return this.parseForStatement();
        case TokenType.Throw:
          return this.parseThrowStatement();
        case TokenType.Try:
          return this.parseTryStatement();
        case TokenType.Switch:
          return this.parseSwitchStatement();
        case TokenType.Function:
          return this.parseFunctionDeclaration();
        default:
          // Check for async function (contextual keyword)
          if (startToken.type === TokenType.Identifier && startToken.text === "async") {
            const nextToken = this._lexer.ahead(1);
            if (nextToken && nextToken.type === TokenType.Function) {
              // Don't consume "async" here, let parseFunctionDeclaration handle it
              return this.parseFunctionDeclaration(false, true);
            }
          }
          if (this.isExpressionStart(startToken)) {
            return this.parseExpressionStatement(allowSequence);
          }
          this.reportError("W002", startToken, startToken.text);
          return null;
      }
    } finally {
      this._statementLevel--;
    }
  }

  /**
   * Parses an empty statement
   *
   * emptyStatement
   *   : ";"
   *   ;
   */
  private parseEmptyStatement(): EmptyStatement | null {
    const startToken = this._lexer.get();
    return this.createStatementNode<EmptyStatement>(T_EMPTY_STATEMENT, {}, startToken, startToken);
  }

  /**
   * Parses an expression statement
   *
   * expressionStatement
   *   : expression
   *   ;
   */
  private parseExpressionStatement(allowSequence = true): ExpressionStatement | null {
    const startToken = this._lexer.peek();
    const expr = this.getExpression(allowSequence);
    return expr
      ? this.createStatementNode<ExpressionStatement>(
          T_EXPRESSION_STATEMENT,
          {
            expr,
          },
          startToken,
          expr.endToken,
        )
      : null;
  }

  /**
   * Parses a let statement
   *
   * letStatement
   *   : "let" id ["=" expression] ("," id ["=" expression])*
   *   ;
   */
  private parseLetStatement(): LetStatement | null {
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;
    const decls: VarDeclaration[] = [];
    while (true) {
      const declStart = this._lexer.peek();
      let declarationProps: any = {};
      if (declStart.type === TokenType.LBrace) {
        // --- This is object destructure
        endToken = this._lexer.ahead(1);
        const oDestr = this.parseObjectDestructure();
        if (oDestr === null) return null;
        declarationProps = {
          oDestr,
        };
        endToken = oDestr.length > 0 ? oDestr[oDestr.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.LSquare) {
        // --- This is array destructure
        endToken = this._lexer.ahead(1);
        const aDestr = this.parseArrayDestructure();
        if (aDestr === null) return null;
        declarationProps = {
          aDestr,
        };
        endToken = aDestr.length > 0 ? aDestr[aDestr.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.Identifier) {
        if (declStart.text.startsWith("$")) {
          this.reportError("W031");
          return null;
        }
        endToken = this._lexer.get();
        declarationProps = {
          id: declStart.text,
        };
      } else {
        this.reportError("W003");
        return null;
      }

      // --- Optional initialization
      const initToken = this._lexer.peek();
      let expr: Expression | null = null;
      if (initToken.type === TokenType.Assignment) {
        this._lexer.get();
        expr = this.getExpression(false);
        if (expr === null) return null;
        declarationProps.expr = expr;
        endToken = expr.endToken;
      } else if (declarationProps.aDestr || declarationProps.oDestr) {
        this.reportError("W009", initToken);
        return null;
      }

      // --- New declaration reached
      decls.push(
        this.createExpressionNode<VarDeclaration>(
          T_VAR_DECLARATION,
          declarationProps,
          declStart,
          endToken,
        ),
      );

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<LetStatement>(
      T_LET_STATEMENT,
      {
        decls,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a const statement
   *
   * constStatement
   *   : "const" id "=" expression
   *   ;
   */
  private parseConstStatement(): ConstStatement | null {
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;
    const decls: VarDeclaration[] = [];
    while (true) {
      const declStart = this._lexer.peek();
      let declarationProps: any = {};
      if (declStart.type === TokenType.LBrace) {
        // --- This is object destructure
        endToken = this._lexer.ahead(1);
        const oDestr = this.parseObjectDestructure();
        if (oDestr === null) return null;
        declarationProps = {
          oDestr,
        };
        endToken = oDestr.length > 0 ? oDestr[oDestr.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.LSquare) {
        // --- This is array destructure
        endToken = this._lexer.ahead(1);
        const aDestr = this.parseArrayDestructure();
        if (aDestr === null) return null;
        declarationProps = {
          aDestr,
        };
        endToken = aDestr.length > 0 ? aDestr[aDestr.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.Identifier) {
        if (declStart.text.startsWith("$")) {
          this.reportError("W031");
          return null;
        }
        endToken = this._lexer.get();
        declarationProps = {
          id: declStart.text,
        };
      } else {
        this.reportError("W003");
        return null;
      }

      this.expectToken(TokenType.Assignment);
      const expr = this.getExpression(false);
      if (expr === null) return null;
      declarationProps.expr = expr;
      endToken = expr.endToken;

      // --- New declaration reached
      decls.push(
        this.createExpressionNode<VarDeclaration>(
          T_VAR_DECLARATION,
          declarationProps,
          declStart,
          endToken,
        ),
      );

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<ConstStatement>(
      T_CONST_STATEMENT,
      {
        decls,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a var statement
   *
   * constStatement
   *   : "var" id "=" expression
   *   ;
   */
  private parseVarStatement(): VarStatement | null {
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;
    const decls: ReactiveVarDeclaration[] = [];
    while (true) {
      const declStart = this._lexer.peek();
      let declarationProps: any = {};
      if (declStart.type === TokenType.Identifier) {
        if (declStart.text.startsWith("$")) {
          this.reportError("W031");
          return null;
        }
        endToken = this._lexer.get();
        declarationProps = {
          id: {
            type: T_IDENTIFIER,
            name: declStart.text,
            startToken: declStart,
            endToken,
          },
        };
      } else {
        this.reportError("W003");
        return null;
      }

      // --- Mandatory initialization
      this.expectToken(TokenType.Assignment);
      const expr = this.getExpression(false);
      if (expr === null) return null;
      declarationProps.expr = expr;
      endToken = expr.endToken;
      // --- New declaration reached
      decls.push(
        this.createExpressionNode<ReactiveVarDeclaration>(
          T_REACTIVE_VAR_DECLARATION,
          declarationProps,
          declStart,
          endToken,
        ),
      );

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<VarStatement>(
      T_VAR_STATEMENT,
      {
        decls,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses an object destructure expression
   */
  private parseObjectDestructure(): ObjectDestructure[] | null {
    const result: ObjectDestructure[] = [];

    // --- Skip the starting left brace
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;

    let nextToken = this._lexer.peek();
    while (nextToken.type === TokenType.Identifier) {
      // --- Obtain the ID
      const id = nextToken.text;
      if (id.startsWith("$")) {
        this.reportError("W031");
        return null;
      }

      let alias: string | undefined;
      let aDestr: ArrayDestructure[] | undefined | null;
      let oDestr: ObjectDestructure[] | undefined | null;
      this._lexer.get();

      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Colon) {
        // --- Check the available cases
        this._lexer.get();
        nextToken = this._lexer.peek();
        if (nextToken.type === TokenType.Identifier) {
          alias = nextToken.text;
          endToken = nextToken;
          this._lexer.get();
        } else if (nextToken.type === TokenType.LSquare) {
          aDestr = this.parseArrayDestructure();
          if (aDestr === null) return null;
          endToken = aDestr[aDestr.length - 1].endToken;
        } else if (nextToken.type === TokenType.LBrace) {
          oDestr = this.parseObjectDestructure();
          if (oDestr === null) return null;
          endToken = oDestr[oDestr.length - 1].endToken;
        }
      }

      // --- Check for next segment
      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Comma || nextToken.type === TokenType.RBrace) {
        result.push(
          this.createExpressionNode<ObjectDestructure>(
            T_OBJECT_DESTRUCTURE,
            { id, alias, aDestr, oDestr },
            startToken,
            endToken,
          ),
        );

        if (nextToken.type === TokenType.Comma) {
          // --- Skip the delimiter comma
          this._lexer.get();
          nextToken = this._lexer.peek();
        }
      }
    }

    // --- Expect a closing right brace
    this.expectToken(TokenType.RBrace, "W004");
    return result;
  }

  private parseArrayDestructure(): ArrayDestructure[] | null {
    const result: ArrayDestructure[] = [];

    // --- Skip the starting left square
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;

    do {
      let nextToken = this._lexer.peek();
      let id: string | undefined;
      let aDestr: ArrayDestructure[] | undefined | null;
      let oDestr: ObjectDestructure[] | undefined | null;
      if (nextToken.type === TokenType.Identifier) {
        id = nextToken.text;
        if (id.startsWith("$")) {
          this.reportError("W031");
          return null;
        }

        endToken = nextToken;
        nextToken = this._lexer.get();
      } else if (nextToken.type === TokenType.LSquare) {
        aDestr = this.parseArrayDestructure();
        if (aDestr === null) return null;
        endToken = aDestr[aDestr.length - 1].endToken;
      } else if (nextToken.type === TokenType.LBrace) {
        oDestr = this.parseObjectDestructure();
        if (oDestr === null) return null;
        endToken = oDestr[oDestr.length - 1].endToken;
      }

      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Comma) {
        // --- Store the segment
        result.push(
          this.createExpressionNode<ArrayDestructure>(
            T_ARRAY_DESTRUCTURE,
            { id, aDestr, oDestr },
            startToken,
            endToken,
          ),
        );
        this._lexer.get();
      } else if (nextToken.type === TokenType.RSquare) {
        if (id || aDestr || oDestr) {
          // --- Store a non-empty the segment
          result.push(
            this.createExpressionNode<ArrayDestructure>(
              T_ARRAY_DESTRUCTURE,
              { id, aDestr, oDestr },
              startToken,
              endToken,
            ),
          );
        }
        break;
      } else {
        this.reportError("W002", nextToken);
        return null;
      }
    } while (true);

    // --- Expect a closing right square
    this.expectToken(TokenType.RSquare, "W005");
    return result;
  }

  /**
   * Parses a block statement
   *
   * blockStatement
   *   : "{" (statement [";"])* "}"
   *   ;
   */
  private parseBlockStatement(): BlockStatement | null {
    const startToken = this._lexer.get();
    const stmts: Statement[] = [];
    while (this._lexer.peek().type !== TokenType.RBrace) {
      const statement = this.parseStatement();
      if (!statement) return null;
      stmts.push(statement);
      if (statement.type !== T_EMPTY_STATEMENT) {
        this.skipToken(TokenType.Semicolon);
      }
    }
    const endToken = this._lexer.get();
    return this.createStatementNode<BlockStatement>(
      T_BLOCK_STATEMENT,
      { stmts },
      startToken,
      endToken,
    );
  }

  /**
   * Parses an if statement
   *
   * ifStatement
   *   : "if" "(" expression ")" statement ["else" statement]
   *   ;
   */
  private parseIfStatement(): IfStatement | null {
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;
    this.expectToken(TokenType.LParent, "W014");
    const cond = this.getExpression();
    if (!cond) return null;
    this.expectToken(TokenType.RParent, "W006");
    const thenB = this.parseStatement();
    if (!thenB) return null;
    endToken = thenB.endToken;
    let elseCanFollow = true;
    if (thenB.type !== T_BLOCK_STATEMENT) {
      // --- We need a closing semicolon before else
      if (this._lexer.peek().type === TokenType.Semicolon) {
        this._lexer.get();
      } else {
        elseCanFollow = false;
      }
    }
    let elseB: Statement | null = null;
    if (elseCanFollow && this._lexer.peek().type === TokenType.Else) {
      this._lexer.get();
      elseB = this.parseStatement();
      if (!elseB) return null;
      endToken = elseB.endToken;
    }
    return this.createStatementNode<IfStatement>(
      T_IF_STATEMENT,
      {
        cond,
        thenB,
        elseB,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a while statement
   *
   * whileStatement
   *   : "while" "(" condition ")" statement
   *   ;
   */
  private parseWhileStatement(): WhileStatement | null {
    const startToken = this._lexer.get();
    this.expectToken(TokenType.LParent, "W014");
    const cond = this.getExpression();
    if (!cond) return null;
    this.expectToken(TokenType.RParent, "W006");
    const body = this.parseStatement();
    if (!body) return null;

    return this.createStatementNode<WhileStatement>(
      T_WHILE_STATEMENT,
      {
        cond,
        body,
      },
      startToken,
      body.endToken,
    );
  }

  /**
   * Parses a do-while statement
   *
   * doWhileStatement
   *   : "do" statement "while" "(" condition ")"
   *   ;
   */
  private parseDoWhileStatement(): DoWhileStatement | null {
    const startToken = this._lexer.get();
    const body = this.parseStatement();
    if (!body) return null;
    if (body.type !== T_BLOCK_STATEMENT && body.type !== T_EMPTY_STATEMENT) {
      this.expectToken(TokenType.Semicolon);
    }
    this.expectToken(TokenType.While);
    this.expectToken(TokenType.LParent, "W014");
    const cond = this.getExpression();
    if (!cond) return null;
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RParent, "W006");

    return this.createStatementNode<DoWhileStatement>(
      T_DO_WHILE_STATEMENT,
      {
        cond,
        body,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses an expression statement
   *
   * returnStatement
   *   : "return" expression?
   *   ;
   */
  private parseReturnStatement(): ReturnStatement | null {
    const startToken = this._lexer.peek();
    let endToken: Token | undefined = this._lexer.get();
    let expr: Expression | undefined | null;
    if (tokenTraits[this._lexer.peek().type].expressionStart) {
      expr = this.getExpression();
      if (expr === null) return null;
      endToken = expr.endToken;
    }
    return this.createStatementNode<ReturnStatement>(
      T_RETURN_STATEMENT,
      {
        expr,
      },
      startToken,
      endToken,
    );
  }

  /**
   * forStatement
   *   : "for" "(" initStatement? ";" expression? ";" expression? ")" statement
   *   | forInOfStatement
   *   ;
   */
  private parseForStatement(): ForStatement | ForInStatement | ForOfStatement | null {
    const startToken = this._lexer.peek();
    this._lexer.get();
    this.expectToken(TokenType.LParent, "W014");

    // --- Check for..in and for..of
    let nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Identifier) {
      if (this._lexer.ahead(1).type === TokenType.In) {
        return this.parseForInOfStatement(startToken, "none", nextToken, T_FOR_IN_STATEMENT);
      } else if (this._lexer.ahead(1).type === TokenType.Of) {
        return this.parseForInOfStatement(startToken, "none", nextToken, T_FOR_OF_STATEMENT);
      }
    } else if (nextToken.type === TokenType.Let) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "let", idToken, T_FOR_IN_STATEMENT);
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "let", idToken, T_FOR_OF_STATEMENT);
        }
      }
    } else if (nextToken.type === TokenType.Const) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "const", idToken, T_FOR_IN_STATEMENT);
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "const", idToken, T_FOR_OF_STATEMENT);
        }
      }
    }

    // --- We accept only let statement, empty statement, and expression
    let init: ExpressionStatement | LetStatement | undefined;
    nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Semicolon) {
      // --- Empty statement: no init in the for loop
      this._lexer.get();
    } else if (nextToken.type === TokenType.Let) {
      // --- Let statement
      const letStmt = this.parseLetStatement();
      if (letStmt === null) {
        return null;
      }
      init = letStmt;
      if (init.decls.some((d) => !d.expr)) {
        this.reportError("W011");
        return null;
      }
      this.expectToken(TokenType.Semicolon);
    } else if (tokenTraits[nextToken.type].expressionStart) {
      // --- Expression statement
      const exprStmt = this.parseExpressionStatement();
      if (exprStmt === null) {
        return null;
      }
      init = exprStmt;
      this.expectToken(TokenType.Semicolon);
    }

    // --- Parse the condition
    let cond: Expression | null | undefined;
    nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Semicolon) {
      // --- No condition
      this._lexer.get();
    } else {
      cond = this.getExpression();
      if (cond === null) {
        return null;
      }
      this.expectToken(TokenType.Semicolon);
    }

    // --- Parse the update expression
    let upd: Expression | null | undefined;
    nextToken = this._lexer.peek();
    if (nextToken.type !== TokenType.RParent) {
      upd = this.getExpression();
      if (upd === null) {
        return null;
      }
    }

    // --- Close the declaration part
    this.expectToken(TokenType.RParent, "W006");

    // --- Get the body
    const body = this.parseStatement();
    if (!body) return null;

    return this.createStatementNode<ForStatement>(
      T_FOR_STATEMENT,
      {
        init,
        cond,
        upd,
        body,
      },
      startToken,
      body.endToken,
    );
  }

  /**
   * forInOfStatement
   *   : "for" "(" [ "let" | "const" ] identifier ( "in" | "of" ) expression? ")" statement
   *   | forInOfStatement
   *   ;
   *
   * @param startToken Statement start token
   * @param varB Variable binding of the for..in/of statement
   * @param id ID name
   * @param type Is it a for..in or a for..of?
   */
  private parseForInOfStatement(
    startToken: Token,
    varB: ForVarBinding,
    idToken: Token,
    type: number,
  ): ForInStatement | ForOfStatement | null {
    if (varB !== "none") {
      // --- Skip variable binding type
      if (idToken.text.startsWith("$")) {
        this.reportError("W031");
        return null;
      }
      this._lexer.get();
    }

    // --- Skip variable name, in/of token
    this._lexer.get();
    this._lexer.get();

    // --- Get the expression
    const expr = this.getExpression(true);

    // --- Close the declaration part
    this.expectToken(TokenType.RParent, "W006");

    // --- Get the body
    const body = this.parseStatement();
    if (!body) return null;

    return type === T_FOR_IN_STATEMENT
      ? this.createStatementNode<ForInStatement>(
          T_FOR_IN_STATEMENT,
          {
            varB,
            id: {
              type: T_IDENTIFIER,
              name: idToken.text,
              startToken: idToken,
              endToken: idToken,
            },
            expr,
            body,
          },
          startToken,
          body.endToken,
        )
      : this.createStatementNode<ForOfStatement>(
          T_FOR_OF_STATEMENT,
          {
            varB,
            id: {
              type: T_IDENTIFIER,
              name: idToken.text,
              startToken: idToken,
              endToken: idToken,
            },
            expr,
            body,
          },
          startToken,
          body.endToken,
        );
  }

  /**
   * Parses a throw statement
   *
   * throwStatement
   *   : "throw" expression
   *   ;
   */
  private parseThrowStatement(): ThrowStatement | null {
    const startToken = this._lexer.peek();
    this._lexer.get();
    let expr: Expression | undefined | null;
    expr = this.getExpression();
    if (expr === null) return null;
    return this.createStatementNode<ThrowStatement>(
      T_THROW_STATEMENT,
      {
        expr,
      },
      startToken,
      expr.endToken,
    );
  }

  /**
   * Parses a try..catch..finally statement
   *
   * tryStatement
   *   : "try" blockStatement catchClause finallyClause?
   *   | "try" blockStatement catchClause? finallyClause
   *   ;
   *
   * catchClause
   *   : "catch" [ "(" identifier ") ]? blockStatement
   *   ;
   *
   * finallyClause
   *   : "finally" blockStatement
   */
  private parseTryStatement(): TryStatement | null {
    const getBlock: () => BlockStatement | null = () => {
      const nextToken = this._lexer.peek();
      if (nextToken.type !== TokenType.LBrace) {
        this.reportError("W012", nextToken);
        return null;
      }
      return this.parseBlockStatement();
    };

    const startToken = this._lexer.peek();
    let endToken: Token | undefined = this._lexer.get();

    // --- Get "try" block
    const tryB = getBlock()!;
    let catchB: BlockStatement | undefined;
    let catchV: Identifier | undefined;
    let finallyB: BlockStatement | undefined;
    let nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Catch) {
      // --- Catch found
      this._lexer.get();
      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.LParent) {
        // --- Catch variable found
        this._lexer.get();
        nextToken = this._lexer.peek();
        if (nextToken.type !== TokenType.Identifier) {
          this.reportError("W003", nextToken);
          return null;
        }
        catchV = {
          type: T_IDENTIFIER,
          nodeId: createXmlUiTreeNodeId(),
          name: nextToken.text,
          startToken: nextToken,
          endToken: nextToken,
        };
        this._lexer.get();
        this.expectToken(TokenType.RParent, "W006");
      }

      // --- Get catch block
      catchB = getBlock()!;
      endToken = catchB.endToken;
      if (this._lexer.peek().type === TokenType.Finally) {
        // --- Finally after catch
        this._lexer.get();
        finallyB = getBlock()!;
        endToken = finallyB.endToken;
      }
    } else if (nextToken.type === TokenType.Finally) {
      // --- Finally found
      this._lexer.get();
      finallyB = getBlock()!;
      endToken = finallyB.endToken;
    } else {
      this.reportError("W013", nextToken);
      return null;
    }

    return this.createStatementNode<TryStatement>(
      T_TRY_STATEMENT,
      {
        tryB,
        catchB,
        catchV,
        finallyB,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a switch statement
   *
   * switchStatement
   *   : "switch" "(" expression ")" "{" caseClauses "}"
   *   ;
   *
   * caseClauses
   *   : "case" expression ":" statement*
   *   | "default" ":" statement*
   *   ;
   */
  private parseSwitchStatement(): SwitchStatement | null {
    const startToken = this._lexer.get();

    // --- Parse the switch expression
    this.expectToken(TokenType.LParent, "W014");
    const expr = this.getExpression();
    if (!expr) return null;
    this.expectToken(TokenType.RParent, "W006");

    // --- Parse the case blocks
    this.expectToken(TokenType.LBrace, "W012");
    const cases: SwitchCase[] = [];
    let defaultCaseFound = false;
    while (true) {
      let nextToken = this._lexer.peek();
      let caseE: Expression | null | undefined;
      if (nextToken.type === TokenType.Case) {
        // --- Process "case"
        this._lexer.get();
        caseE = this.getExpression();
        if (!caseE) return null;
      } else if (nextToken.type === TokenType.Default) {
        // --- Process "default"
        if (defaultCaseFound) {
          this.reportError("W016");
          return null;
        }
        defaultCaseFound = true;
        this._lexer.get();
      } else if (nextToken.type === TokenType.RBrace) {
        break;
      } else {
        this.reportError("W015");
        return null;
      }

      // --- Process label statements
      this.expectToken(TokenType.Colon, "W008");
      let stmts: Statement[] = [];
      let collected = false;
      while (!collected) {
        const stmtToken = this._lexer.peek();
        switch (stmtToken.type) {
          case TokenType.Case:
          case TokenType.Default:
          case TokenType.RBrace:
            // --- No more case to process
            collected = true;
            break;
          default:
            // --- Try to get the next statement
            const stmt = this.parseStatement();
            if (stmt === null) {
              collected = true;
              break;
            }
            stmts.push(stmt);
            if (stmt.type !== T_EMPTY_STATEMENT) {
              this.skipToken(TokenType.Semicolon);
            }
        }
      }

      cases.push(
        this.createNode(
          T_SWITCH_CASE,
          {
            caseE,
            stmts,
          },
          startToken,
        ),
      );
    }

    // --- Closing
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RBrace, "W004");
    return this.createStatementNode<SwitchStatement>(
      T_SWITCH_STATEMENT,
      {
        expr,
        cases,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a function declaration
   *
   * functionDeclaration
   *   : ["async"] "function" identifier "(" [parameterList] ")" blockStatement
   *   ;
   */
  private parseFunctionDeclaration(
    allowNoName = false,
    isAsync = false,
  ): FunctionDeclaration | null {
    // If async, we need to consume the "async" token first
    let startToken = this._lexer.peek();
    if (isAsync) {
      startToken = this._lexer.get(); // consume "async"
    }

    // Now consume the "function" keyword
    this._lexer.get();

    // --- Get the function name
    let functionName: string | undefined;
    const funcId = this._lexer.peek();
    if (allowNoName) {
      if (funcId.type !== TokenType.LParent) {
        if (funcId.type !== TokenType.Identifier) {
          this.reportError("W003", funcId);
          return null;
        }
        functionName = funcId.text;
        this._lexer.get();
      }
    } else {
      if (funcId.type !== TokenType.Identifier) {
        this.reportError("W003", funcId);
        return null;
      }
      functionName = funcId.text;
      this._lexer.get();
    }

    // --- Get the parameter list;
    const nextToken = this._lexer.peek();
    if (nextToken.type !== TokenType.LParent) {
      this.reportError("W014", nextToken);
      return null;
    }

    // --- Now, get the parameter list as an expression
    const exprList = this.getExpression(true);

    // --- We turn the expression into a parameter list
    let isValid: boolean;
    const args: Expression[] = [];
    switch (exprList!.type) {
      case T_NO_ARG_EXPRESSION:
        isValid = true;
        break;
      case T_IDENTIFIER:
        isValid = (exprList.parenthesized ?? 0) <= 1;
        args.push(exprList);
        break;
      case T_SEQUENCE_EXPRESSION:
        isValid = exprList.parenthesized === 1;
        let spreadFound = false;
        if (isValid) {
          for (const expr of exprList.exprs) {
            // --- Spread operator can be used only in the last position
            if (spreadFound) {
              isValid = false;
              break;
            }
            switch (expr.type) {
              case T_IDENTIFIER:
                isValid = !expr.parenthesized;
                args.push(expr);
                break;
              case T_OBJECT_LITERAL: {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToObjectDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case T_ARRAY_LITERAL: {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToArrayDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case T_SPREAD_EXPRESSION: {
                spreadFound = true;
                if (expr.expr.type !== T_IDENTIFIER) {
                  isValid = false;
                  break;
                }
                args.push(expr);
                break;
              }
              default:
                isValid = false;
                break;
            }
          }
        }
        break;
      case T_OBJECT_LITERAL:
        isValid = exprList.parenthesized === 1;
        if (isValid) {
          const des = this.convertToObjectDestructure(exprList);
          if (des) args.push(des);
        }
        break;
      case T_ARRAY_LITERAL:
        isValid = exprList.parenthesized === 1;
        if (isValid) {
          const des = this.convertToArrayDestructure(exprList);
          if (des) args.push(des);
        }
        break;
      case T_SPREAD_EXPRESSION:
        if (exprList.expr.type !== T_IDENTIFIER) {
          isValid = false;
          break;
        }
        isValid = true;
        args.push(exprList);
        break;
      default:
        isValid = false;
    }
    if (!isValid) {
      this.reportError("W010", startToken);
      return null;
    }

    // --- Get the function body (statement block)
    if (this._lexer.peek().type !== TokenType.LBrace) {
      this.reportError("W012", this._lexer.peek());
      return null;
    }

    const stmt = this.parseBlockStatement();
    if (!stmt) return null;

    // --- Done.
    const nodeData: any = {
      id: { type: T_IDENTIFIER, name: functionName },
      args,
      stmt,
    };
    if (isAsync) {
      nodeData.async = true;
    }
    return this.createStatementNode<FunctionDeclaration>(
      isAsync ? T_ASYNC_FUNCTION_DECLARATION : T_FUNCTION_DECLARATION,
      nodeData,
      startToken,
      stmt.endToken,
    );
  }

  // ==========================================================================
  // Expression parsing

  /**
   * Parses an expression:
   *
   * expr
   *   : sequenceExpr
   *   ;
   */
  parseExpr(allowSequence = true): Expression | null {
    return allowSequence
      ? this.parseSequenceExpression()
      : this.parseCondOrSpreadOrAsgnOrArrowExpr();
  }

  /**
   * sequenceExpr
   *   : conditionalExpr ( "," conditionalExpr )?
   */
  private parseSequenceExpression(): Expression | null {
    const start = this._lexer.peek();
    let endToken: Token | undefined = start;
    let leftExpr = this.parseCondOrSpreadOrAsgnOrArrowExpr();
    if (!leftExpr) {
      return null;
    }
    endToken = leftExpr.endToken;
    const exprs: Expression[] = [];
    let loose = false;

    if (this._lexer.peek().type === TokenType.Comma) {
      exprs.push(leftExpr);
      while (this.skipToken(TokenType.Comma)) {
        if (this._lexer.peek().type === TokenType.Comma) {
          loose = true;
          endToken = this._lexer.peek();
          exprs.push(
            this.createExpressionNode<NoArgExpression>(T_NO_ARG_EXPRESSION, {}, endToken, endToken),
          );
        } else {
          const nextExpr = this.parseCondOrSpreadOrAsgnOrArrowExpr();
          if (!nextExpr) {
            break;
          }
          endToken = nextExpr.endToken;
          exprs.push(nextExpr);
        }
      }
    }

    if (!exprs.length) {
      // --- No sequence
      return leftExpr;
    }

    // --- Create the sequence expression
    leftExpr = this.createExpressionNode<SequenceExpression>(
      T_SEQUENCE_EXPRESSION,
      {
        exprs,
        loose,
      },
      start,
      endToken,
    );

    // --- Check for "loose" sequence expression
    if (loose) {
      leftExpr = this.convertToArrayDestructure(leftExpr);
    }

    // --- Done.
    return leftExpr;
  }

  /**
   * conditionalOrSpreadOrAsgnOrArrowExpr
   *   : nullCoalescingExpr ( "?" expr ":" expr )?
   *   | "..." nullCoalescingExpr
   *   | identifier "=" expr
   *   ;
   */
  private parseCondOrSpreadOrAsgnOrArrowExpr(): Expression | null {
    const startToken = this._lexer.peek();
    if (startToken.type === TokenType.Spread) {
      // --- Spread expression
      this._lexer.get();
      const spreadOperand = this.parseNullCoalescingExpr();
      return spreadOperand
        ? this.createExpressionNode<SpreadExpression>(
            T_SPREAD_EXPRESSION,
            {
              expr: spreadOperand,
            },
            startToken,
            spreadOperand.endToken,
          )
        : null;
    }

    if (startToken.type === TokenType.Function) {
      const funcDecl = this.parseFunctionDeclaration(true);
      if (!funcDecl) return null;

      const nodeData: any = {
        name: funcDecl.id.name,
        args: funcDecl.args,
        statement: funcDecl.stmt,
      };
      if (funcDecl.async) {
        nodeData.async = true;
      }
      return this.createExpressionNode<ArrowExpression>(
        T_ARROW_EXPRESSION,
        nodeData,
        startToken,
        funcDecl.endToken,
      );
    }

    // Check for async function expression (contextual keyword)
    if (startToken.type === TokenType.Identifier && startToken.text === "async") {
      const nextToken = this._lexer.ahead(1);
      if (nextToken && nextToken.type === TokenType.Function) {
        // Don't consume "async" here - parseFunctionDeclaration will handle it
        const funcDecl = this.parseFunctionDeclaration(true, true);
        if (!funcDecl) return null;

        const nodeData: any = {
          name: funcDecl.id.name,
          args: funcDecl.args,
          statement: funcDecl.stmt,
        };
        if (funcDecl.async) {
          nodeData.async = true;
        }
        return this.createExpressionNode<ArrowExpression>(
          T_ARROW_EXPRESSION,
          nodeData,
          startToken,
          funcDecl.endToken,
        );
      }
      // Check for async arrow function: async (...) => or async id =>
      if (
        nextToken &&
        (nextToken.type === TokenType.LParent || nextToken.type === TokenType.Identifier)
      ) {
        // For async id =>, we need to peek further to confirm it's an arrow function
        if (nextToken.type === TokenType.Identifier) {
          const tokenAfterParam = this._lexer.ahead(2);
          if (!tokenAfterParam || tokenAfterParam.type !== TokenType.Arrow) {
            // Not an arrow function, treat "async" as a regular identifier
            // Fall through to parse as normal expression
          } else {
            // It's async id => ..., consume and parse
            this._lexer.get(); // consume "async"
            const arrowExpr = this.parseNullCoalescingExpr();
            if (!arrowExpr) {
              return null;
            }

            const arrowToken = this._lexer.peek();
            if (arrowToken.type === TokenType.Arrow) {
              return this.parseArrowExpression(startToken, arrowExpr, true);
            }
          }
        } else {
          // It's async (...), consume and parse
          this._lexer.get(); // consume "async"
          const arrowExpr = this.parseNullCoalescingExpr();
          if (!arrowExpr) {
            return null;
          }

          const arrowToken = this._lexer.peek();
          if (arrowToken.type === TokenType.Arrow) {
            return this.parseArrowExpression(startToken, arrowExpr, true);
          }
          // Not an arrow function, this is an error - we consumed "async" but didn't find arrow
          this.reportError("W002", arrowToken, arrowToken.text);
          return null;
        }
      }
    }

    const otherExpr = this.parseNullCoalescingExpr();
    if (!otherExpr) {
      return null;
    }

    const nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Arrow) {
      // --- It is an arrow expression
      return this.parseArrowExpression(startToken, otherExpr);
    }

    if (nextToken.type === TokenType.QuestionMark) {
      this._lexer.get();
      // --- Conditional expression
      const trueExpr = this.getExpression(false);
      this.expectToken(TokenType.Colon);
      const falseExpr = this.getExpression(false);

      return this.createExpressionNode<ConditionalExpression>(
        T_CONDITIONAL_EXPRESSION,
        {
          cond: otherExpr,
          thenE: trueExpr,
          elseE: falseExpr,
        },
        startToken,
        falseExpr!.endToken,
      );
    }

    if (tokenTraits[nextToken.type].isAssignment) {
      // --- Assignment
      this._lexer.get();
      const expr = this.getExpression();
      return expr
        ? this.createExpressionNode<AssignmentExpression>(
            T_ASSIGNMENT_EXPRESSION,
            {
              leftValue: otherExpr,
              op: nextToken.text,
              expr,
            },
            startToken,
            expr.endToken,
          )
        : null;
    }

    return otherExpr;
  }

  /**
   * Parses an arrow expression
   * @param start Start token
   * @param left Expression to the left from the arrow
   * @param isAsync Whether this is an async arrow function
   */
  private parseArrowExpression(
    start: Token,
    left: Expression,
    isAsync = false,
  ): ArrowExpression | null {
    // --- Check the left expression
    let isValid: boolean;
    const args: Expression[] = [];
    switch (left.type) {
      case T_NO_ARG_EXPRESSION:
        isValid = true;
        break;
      case T_IDENTIFIER:
        isValid = (left.parenthesized ?? 0) <= 1;
        args.push(left);
        break;
      case T_SEQUENCE_EXPRESSION:
        isValid = left.parenthesized === 1;
        let spreadFound = false;
        if (isValid) {
          for (const expr of left.exprs) {
            if (spreadFound) {
              isValid = false;
              break;
            }
            switch (expr.type) {
              case T_IDENTIFIER:
                isValid = !expr.parenthesized;
                args.push(expr);
                break;
              case T_OBJECT_LITERAL: {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToObjectDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case T_ARRAY_LITERAL: {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToArrayDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case T_SPREAD_EXPRESSION: {
                spreadFound = true;
                if (expr.expr.type !== T_IDENTIFIER) {
                  isValid = false;
                  break;
                }
                args.push(expr);
                break;
              }
              default:
                isValid = false;
                break;
            }
          }
        }
        break;
      case T_OBJECT_LITERAL:
        isValid = left.parenthesized === 1;
        if (isValid) {
          const des = this.convertToObjectDestructure(left);
          if (des) args.push(des);
        }
        break;
      case T_ARRAY_LITERAL:
        isValid = left.parenthesized === 1;
        if (isValid) {
          const des = this.convertToArrayDestructure(left);
          if (des) args.push(des);
        }
        break;
      case T_SPREAD_EXPRESSION:
        isValid = left.expr.type === T_IDENTIFIER;
        if (isValid) {
          args.push(left);
        }
        break;
      default:
        isValid = false;
    }
    if (!isValid) {
      this.reportError("W010", start);
      return null;
    }

    // --- Skip the arrow token
    this._lexer.get();

    // --- Get arrow expression statements
    const statement = this.parseStatement(false);
    if (!statement) return null;

    const nodeData: any = {
      args,
      statement,
    };
    if (isAsync) {
      nodeData.async = true;
    }
    return this.createExpressionNode<ArrowExpression>(
      T_ARROW_EXPRESSION,
      nodeData,
      start,
      statement.endToken,
    );
  }

  /**
   * nullCoalescingExpr
   *   : logicalOrExpr ( "??" logicalOrExpr )?
   *   ;
   */
  private parseNullCoalescingExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseLogicalOrExpr();
    if (!leftExpr) {
      return null;
    }
    while (this.skipToken(TokenType.NullCoalesce)) {
      const rightExpr = this.parseLogicalOrExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "??",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * logicalOrExpr
   *   : logicalAndExpr ( "||" logicalAndExpr )?
   *   ;
   */
  private parseLogicalOrExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseLogicalAndExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.LogicalOr)) {
      const rightExpr = this.parseLogicalAndExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "||",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * logicalAndExpr
   *   : bitwiseOrExpr ( "&&" bitwiseOrExpr )?
   *   ;
   */
  private parseLogicalAndExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseBitwiseOrExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.LogicalAnd)) {
      const rightExpr = this.parseBitwiseOrExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "&&",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * bitwiseOrExpr
   *   : bitwiseXorExpr ( "|" bitwiseXorExpr )?
   *   ;
   */
  private parseBitwiseOrExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseBitwiseXorExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.BitwiseOr)) {
      const rightExpr = this.parseBitwiseXorExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "|",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * bitwiseXorExpr
   *   : bitwiseAndExpr ( "^" bitwiseAndExpr )?
   *   ;
   */
  private parseBitwiseXorExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseBitwiseAndExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.BitwiseXor)) {
      const rightExpr = this.parseBitwiseAndExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "^",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * bitwiseAndExpr
   *   : equExpr ( "&" equExpr )?
   *   ;
   */
  private parseBitwiseAndExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseEquExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.BitwiseAnd)) {
      const rightExpr = this.parseEquExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: "&",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * equExpr
   *   : relOrInExpr ( ( "==" | "!=" | "===" | "!==" ) relOrInExpr )?
   *   ;
   */
  private parseEquExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseRelOrInExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.Equal,
        TokenType.StrictEqual,
        TokenType.NotEqual,
        TokenType.StrictNotEqual,
      ))
    ) {
      const rightExpr = this.parseRelOrInExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * relOrInExpr
   *   : shiftExpr ( ( "<" | "<=" | ">" | ">=", "in" ) shiftExpr )?
   *   ;
   */
  private parseRelOrInExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseShiftExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.LessThan,
        TokenType.LessThanOrEqual,
        TokenType.GreaterThan,
        TokenType.GreaterThanOrEqual,
        TokenType.In,
      ))
    ) {
      const rightExpr = this.parseShiftExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * shiftExpr
   *   : addExpr ( ( "<<" | ">>" | ">>>" ) addExpr )?
   *   ;
   */
  private parseShiftExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseAddExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.ShiftLeft,
        TokenType.ShiftRight,
        TokenType.SignedShiftRight,
      ))
    ) {
      const rightExpr = this.parseAddExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * addExpr
   *   : multExpr ( ( "+" | "-" ) multExpr )?
   *   ;
   */
  private parseAddExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseMultExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while ((opType = this.skipTokens(TokenType.Plus, TokenType.Minus))) {
      const rightExpr = this.parseMultExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * multExpr
   *   : exponentialExpr ( ( "*" | "/" | "%") exponentialExpr )?
   *   ;
   */
  private parseMultExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseExponentialExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while ((opType = this.skipTokens(TokenType.Multiply, TokenType.Divide, TokenType.Remainder))) {
      const rightExpr = this.parseExponentialExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        T_BINARY_EXPRESSION,
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken,
      );
    }
    return leftExpr;
  }

  /**
   * exponentialExpr
   *   : unaryExpr ( "**" unaryExpr )?
   *   ;
   */
  private parseExponentialExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let leftExpr = this.parseUnaryOrPrefixExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    let count = 0;
    while ((opType = this.skipToken(TokenType.Exponent))) {
      let rightExpr = this.parseUnaryOrPrefixExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      if (count === 0) {
        leftExpr = this.createExpressionNode<BinaryExpression>(
          T_BINARY_EXPRESSION,
          {
            op: opType.text,
            left: leftExpr,
            right: rightExpr,
          },
          startToken,
          endToken,
        );
      } else {
        const prevLeft = leftExpr as BinaryExpression;
        leftExpr = this.createExpressionNode<BinaryExpression>(
          T_BINARY_EXPRESSION,
          {
            op: opType.text,
            left: prevLeft.left,
            right: {
              type: T_BINARY_EXPRESSION,
              op: opType.text,
              left: prevLeft.right,
              right: rightExpr,
            },
          },
          startToken,
          endToken,
        );
      }
      count++;
    }
    return leftExpr;
  }

  /**
   * unaryExpr
   *   : ( "typeof" | "delete" | "+" | "-" | "~" | "!" | "await" ) memberOrInvocationExpr
   *   | memberOrInvocationExpr
   *   ;
   */
  private parseUnaryOrPrefixExpr(): Expression | null {
    const startToken = this._lexer.peek();

    // Check for new expression
    if (startToken.type === TokenType.New) {
      this._lexer.get();

      // Parse the callee (but not function invocations yet)
      let callee = this.parsePrimaryExpr();
      if (!callee) {
        return null;
      }

      // Handle member access on the callee (e.g., new obj.Constructor)
      let exitLoop = false;
      do {
        const currentStart = this._lexer.peek();

        switch (currentStart.type) {
          case TokenType.Dot:
          case TokenType.OptionalChaining: {
            this._lexer.get();
            const memberToken = this._lexer.peek();
            if (memberToken.type !== TokenType.Identifier) {
              this.reportError("W003");
              return null;
            }
            this._lexer.get();
            callee = this.createExpressionNode<MemberAccessExpression>(
              T_MEMBER_ACCESS_EXPRESSION,
              {
                obj: callee,
                member: memberToken.text,
                opt: currentStart.type === TokenType.OptionalChaining,
              },
              startToken,
              memberToken,
            );
            break;
          }

          case TokenType.LSquare: {
            this._lexer.get();
            const memberExpr = this.parseExpr();
            if (!memberExpr) {
              return null;
            }
            const endToken = this._lexer.peek();
            this.expectToken(TokenType.RSquare, "W005");
            callee = this.createExpressionNode<CalculatedMemberAccessExpression>(
              T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
              {
                obj: callee,
                member: memberExpr,
              },
              startToken,
              endToken,
            );
            break;
          }

          default:
            exitLoop = true;
            break;
        }
      } while (!exitLoop);

      // Parse arguments if present (they're optional for new operator)
      let args: Expression[] = [];
      let endToken = callee.endToken;
      const nextToken = this._lexer.peek();

      // Check if there are constructor arguments
      if (nextToken.type === TokenType.LParent) {
        this._lexer.get();
        if (this._lexer.peek().type !== TokenType.RParent) {
          const expr = this.parseExpr();
          if (!expr) {
            this.reportError("W001");
            return null;
          }
          args = expr.type === T_SEQUENCE_EXPRESSION ? expr.exprs : [expr];
        }
        endToken = this._lexer.peek();
        this.expectToken(TokenType.RParent, "W006");
      }

      return this.createExpressionNode<NewExpression>(
        T_NEW_EXPRESSION,
        {
          callee,
          arguments: args,
        },
        startToken,
        endToken,
      );
    }

    // Check for await expression (contextual keyword)
    if (startToken.type === TokenType.Identifier && startToken.text === "await") {
      this._lexer.get();
      const awaitOperand = this.parseUnaryOrPrefixExpr();
      if (!awaitOperand) {
        return null;
      }
      return this.createExpressionNode<AwaitExpression>(
        T_AWAIT_EXPRESSION,
        {
          expr: awaitOperand,
        },
        startToken,
        awaitOperand.endToken,
      );
    }

    if (tokenTraits[startToken.type].canBeUnary) {
      this._lexer.get();
      const unaryOperand = this.parseUnaryOrPrefixExpr();
      if (!unaryOperand) {
        return null;
      }
      return this.createExpressionNode<UnaryExpression>(
        T_UNARY_EXPRESSION,
        {
          op: startToken.text,
          expr: unaryOperand,
        },
        startToken,
        unaryOperand.endToken,
      );
    }

    if (startToken.type === TokenType.IncOp || startToken.type === TokenType.DecOp) {
      this._lexer.get();
      const prefixOperand = this.parseMemberOrInvocationExpr();
      if (!prefixOperand) {
        return null;
      }
      return this.createExpressionNode<PrefixOpExpression>(
        T_PREFIX_OP_EXPRESSION,
        {
          op: startToken.text,
          expr: prefixOperand,
        },
        startToken,
        prefixOperand.endToken,
      );
    }

    // --- Not unary or prefix
    return this.parseMemberOrInvocationExpr();
  }

  /**
   * memberOrInvocationExpr
   *   : primaryExpr "(" functionArgs ")"
   *   | primaryExpr "." identifier
   *   | primaryExpr "?." identifier
   *   | primaryExpr "[" expr "]"
   *   ;
   */
  private parseMemberOrInvocationExpr(): Expression | null {
    const startToken = this._lexer.peek();
    let primary = this.parsePrimaryExpr();
    if (!primary) {
      return null;
    }

    let exitLoop = false;
    do {
      const currentStart = this._lexer.peek();

      switch (currentStart.type) {
        case TokenType.LParent: {
          this._lexer.get();
          let args: Expression[] = [];
          if (this._lexer.peek().type !== TokenType.RParent) {
            const expr = this.parseExpr();
            if (!expr) {
              this.reportError("W001");
              return null;
            }
            args = expr.type === T_SEQUENCE_EXPRESSION ? expr.exprs : [expr];
          }
          const endToken = this._lexer.peek();
          this.expectToken(TokenType.RParent, "W006");
          primary = this.createExpressionNode<FunctionInvocationExpression>(
            T_FUNCTION_INVOCATION_EXPRESSION,
            {
              obj: primary,
              arguments: args,
            },
            startToken,
            endToken,
          );
          break;
        }

        case TokenType.Dot:
        case TokenType.OptionalChaining:
          this._lexer.get();
          const member = this._lexer.get();
          const memberTrait = tokenTraits[member.type];
          if (!memberTrait.keywordLike) {
            this.reportError("W003");
            return null;
          }
          primary = this.createExpressionNode<MemberAccessExpression>(
            T_MEMBER_ACCESS_EXPRESSION,
            {
              obj: primary,
              member: member.text,
              opt: currentStart.type === TokenType.OptionalChaining,
            },
            startToken,
            member,
          );
          break;

        case TokenType.LSquare:
          this._lexer.get();
          const memberExpr = this.getExpression();
          if (!memberExpr) {
            return null;
          }
          const endToken = this._lexer.peek();
          this.expectToken(TokenType.RSquare, "W005");
          primary = this.createExpressionNode<CalculatedMemberAccessExpression>(
            T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
            {
              obj: primary,
              member: memberExpr,
            },
            startToken,
            endToken,
          );
          break;

        default:
          exitLoop = true;
          break;
      }
    } while (!exitLoop);

    // --- Check for postfix operators
    const nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.IncOp || nextToken.type === TokenType.DecOp) {
      this._lexer.get();
      return this.createExpressionNode<PostfixOpExpression>(
        T_POSTFIX_OP_EXPRESSION,
        {
          op: nextToken.text,
          expr: primary,
        },
        startToken,
        nextToken,
      );
    }

    return primary;
  }

  /**
   * primaryExpr
   *   : literal
   *   | identifier
   *   | "::" identifier
   *   | "$item"
   *   | "(" expr ")"
   *   ;
   */
  private parsePrimaryExpr(): Expression | null {
    const start = this._lexer.peek();
    switch (start.type) {
      case TokenType.LParent:
        // --- Parenthesised or no-arg expression
        this._lexer.get();
        if (this._lexer.peek().type === TokenType.RParent) {
          // --- No-arg
          const endToken = this._lexer.get();
          return this.createExpressionNode<NoArgExpression>(
            T_NO_ARG_EXPRESSION,
            {},
            start,
            endToken,
          );
        }

        // --- Parenthesized
        let parenthesizedExpr = this.parseExpr();
        if (!parenthesizedExpr) {
          return null;
        }
        const endToken = this._lexer.peek();
        this.expectToken(TokenType.RParent, "W006");
        return {
          ...parenthesizedExpr,
          parenthesized: (parenthesizedExpr.parenthesized ?? 0) + 1,
          startToken: start,
          endToken,
        };

      case TokenType.Identifier: {
        const idToken = this._lexer.get();
        return this.createExpressionNode<Identifier>(
          T_IDENTIFIER,
          {
            name: idToken.text,
          },
          idToken,
          idToken,
        );
      }

      case TokenType.Global: {
        this._lexer.get();
        const idToken = this._lexer.get();
        if (idToken.type !== TokenType.Identifier) {
          this.reportError("W003");
          return null;
        }
        return this.createExpressionNode<Identifier>(
          T_IDENTIFIER,
          {
            name: idToken.text,
            isGlobal: true,
          },
          idToken,
          idToken,
        );
      }
      case TokenType.Backtick:
        return this.parseTemplateLiteral();

      case TokenType.False:
      case TokenType.True:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          T_LITERAL,
          {
            value: start.type === TokenType.True,
          },
          start,
          start,
        );

      case TokenType.BinaryLiteral:
        this._lexer.get();
        return this.parseBinaryLiteral(start);

      case TokenType.DecimalLiteral:
        this._lexer.get();
        return this.parseDecimalLiteral(start);

      case TokenType.HexadecimalLiteral:
        this._lexer.get();
        return this.parseHexadecimalLiteral(start);

      case TokenType.RealLiteral:
        this._lexer.get();
        return this.parseRealLiteral(start);

      case TokenType.StringLiteral:
        this._lexer.get();
        return this.parseStringLiteral(start);

      case TokenType.Infinity:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          T_LITERAL,
          {
            value: Infinity,
          },
          start,
          start,
        );

      case TokenType.NaN:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          T_LITERAL,
          {
            value: NaN,
          },
          start,
          start,
        );

      case TokenType.Null:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          T_LITERAL,
          {
            value: null,
          },
          start,
          start,
        );

      case TokenType.Undefined:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          T_LITERAL,
          {
            value: undefined,
          },
          start,
          start,
        );

      case TokenType.LSquare:
        return this.parseArrayLiteral();

      case TokenType.LBrace:
        return this.parseObjectLiteral();

      case TokenType.Divide:
        return this.parseRegExpLiteral();
    }

    return null;
  }

  private parseTemplateLiteral(): TemplateLiteralExpression {
    const startToken = this._lexer.get();
    this._lexer.setStartingPhaseToTemplateLiteral();
    const segments: (Literal | Expression)[] = [];
    loop: while (true) {
      let nextToken = this._lexer.peek();
      switch (nextToken.type) {
        case TokenType.StringLiteral:
          this._lexer.get();
          const str = this.parseStringLiteral(nextToken, false);
          segments.push(str);
          break;
        case TokenType.DollarLBrace:
          this._lexer.get();
          const innerExpr = this.parseExpr();
          segments.push(innerExpr);
          this.expectToken(TokenType.RBrace, "W004");
          this._lexer.setStartingPhaseToTemplateLiteral();
          break;
        case TokenType.Backtick:
          break loop;
        default:
          this.reportError("W004");
      }
    }
    const endToken = this._lexer.get();
    return this.createExpressionNode<TemplateLiteralExpression>(
      T_TEMPLATE_LITERAL_EXPRESSION,
      { segments },
      startToken,
      endToken,
    );
  }

  /**
   * Parses an array literal
   */
  private parseArrayLiteral(): ArrayLiteral | null {
    const start = this._lexer.get();
    let expressions: Expression[] = [];
    if (this._lexer.peek().type !== TokenType.RSquare) {
      const expr = this.getExpression();
      if (expr) {
        expressions = expr.type === T_SEQUENCE_EXPRESSION ? expr.exprs : [expr];
      }
    }
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RSquare);
    return this.createExpressionNode<ArrayLiteral>(
      T_ARRAY_LITERAL,
      {
        items: expressions,
      },
      start,
      endToken,
    );
  }

  /**
   * Parses an object literal
   */
  private parseObjectLiteral(): ObjectLiteral | null {
    const start = this._lexer.get();
    let props: (SpreadExpression | [Expression, Expression])[] = [];
    if (this._lexer.peek().type !== TokenType.RBrace) {
      while (this._lexer.peek().type !== TokenType.RBrace) {
        // --- Check the next token
        const nextToken = this._lexer.peek();
        const traits = tokenTraits[nextToken.type];
        let nameExpr: Expression | null;

        // --- Get property name or calculated property name
        if (traits.keywordLike) {
          nameExpr = {
            type: T_IDENTIFIER,
            nodeId: createXmlUiTreeNodeId(),
            name: nextToken.text,
            startToken: nextToken,
            endToken: nextToken,
          };
          this._lexer.get();
        } else if (traits.expressionStart) {
          if (nextToken.type === TokenType.LSquare) {
            this._lexer.get();
            nameExpr = this.getExpression();
            if (!nameExpr) {
              return null;
            }
            this.expectToken(TokenType.RSquare, "W005");
            nameExpr = this.createExpressionNode<SequenceExpression>(
              T_SEQUENCE_EXPRESSION,
              {
                exprs: [nameExpr],
              },
              start,
            );
          } else if (traits.isPropLiteral) {
            nameExpr = this.getExpression(false);
            if (!nameExpr) {
              return null;
            }
            if (
              nameExpr.type !== T_IDENTIFIER &&
              nameExpr.type !== T_LITERAL &&
              nameExpr.type !== T_SPREAD_EXPRESSION
            ) {
              this.reportError("W007");
              return null;
            }
          } else {
            this.reportError("W007");
            return null;
          }
        } else {
          this.reportError("W001");
          return null;
        }

        const nameType = nameExpr.type;
        if (nameType === T_SPREAD_EXPRESSION) {
          props.push(nameExpr);
        } else {
          if (nameType === T_LITERAL) {
            const val = nameExpr.value;
            if (typeof val !== "number" && typeof val !== "string") {
              this.expectToken(TokenType.RBrace, "W007");
              return null;
            }
          }

          // --- Value is optional, when we have a name
          let valueExpr: Expression | null = null;

          if (nameType === T_IDENTIFIER) {
            const nameFollowerToken = this._lexer.peek();
            if (
              nameFollowerToken.type === TokenType.Comma ||
              nameFollowerToken.type === TokenType.RBrace
            ) {
              valueExpr = { ...nameExpr };
            }
          }

          // --- Move to property value
          if (!valueExpr) {
            this.expectToken(TokenType.Colon, "W008");
            valueExpr = this.getExpression(false);
            if (!valueExpr) {
              return null;
            }
          }

          props.push([nameExpr, valueExpr]);
        }

        // --- Test property termination
        const next = this._lexer.peek().type;
        if (next === TokenType.Comma) {
          this._lexer.get();
        } else {
          if (next !== TokenType.RBrace) {
            break;
          }
        }
      }
    }

    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RBrace, "W004");
    return this.createExpressionNode<ObjectLiteral>(
      T_OBJECT_LITERAL,
      {
        props,
      },
      start,
      endToken,
    );
  }

  private parseRegExpLiteral(): Literal | null {
    const startToken = this._lexer.peek();
    const result = this._lexer.getRegEx();
    if (result.success) {
      return this.createExpressionNode<Literal>(
        T_LITERAL,
        {
          value: new RegExp(result.pattern!, result.flags),
        },
        startToken,
        this._lexer.peek(),
      );
    }
    this.reportError("W002", startToken, result.pattern ?? "");
    return null;
  }

  /**
   * Gets an expression
   */
  private getExpression(allowSequence = true): Expression | null {
    const expr = this.parseExpr(allowSequence);
    if (expr) {
      return expr;
    }
    this.reportError("W001");
    return null;
  }

  // ==========================================================================
  // Helpers

  /**
   * Tests the type of the next token
   * @param type Expected token type
   * @param errorCode Error to raise if the next token is not expected
   * @param allowEof Allow an EOF instead of the expected token?
   */
  private expectToken(type: TokenType, errorCode?: ErrorCodes, allowEof?: boolean): Token | null {
    const next = this._lexer.peek();
    if (next.type === type || (allowEof && next.type === TokenType.Eof)) {
      // --- Skip the expected token
      return this._lexer.get();
    }
    this.reportError(errorCode ?? "W002", next, next.text);
    return null;
  }

  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  private skipToken(type: TokenType): Token | null {
    const next = this._lexer.peek();
    if (next.type === type) {
      this._lexer.get();
      return next;
    }
    return null;
  }

  /**
   * Skips the next token if the type is the specified one
   * @param types Token types to check
   */
  private skipTokens(...types: TokenType[]): Token | null {
    const next = this._lexer.peek();
    for (const type of types) {
      if (next.type === type) {
        this._lexer.get();
        return next;
      }
    }
    return null;
  }

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  private reportError(errorCode: ErrorCodes, token?: Token, ...options: any[]): void {
    let errorText: string = errorMessages[errorCode] ?? "Unkonwn error";
    if (options) {
      options.forEach(
        (o, idx) => (errorText = replace(errorText, `{${idx}}`, options[idx].toString())),
      );
    }
    if (!token) {
      token = this._lexer.peek();
    }
    this._parseErrors.push({
      code: errorCode,
      text: errorText,
      line: token.startLine,
      column: token.startColumn,
      position: token.startPosition,
      end: token.endPosition,
    });
    throw new ParserError(errorText, errorCode);

    function replace(input: string, placeholder: string, replacement: string): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
    }
  }

  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   * @param source Expression source code to store to the node
   */
  private createNode<T extends ScripNodeBase>(
    type: ScripNodeBase["type"],
    stump: any,
    startToken: Token,
    endToken?: Token,
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek();
    }
    return Object.assign({}, stump, {
      type,
      startToken,
      endToken,
    } as ScripNodeBase);
  }

  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   * @param source Expression source code to store to the node
   */
  private createExpressionNode<T extends Expression>(
    type: Expression["type"],
    stump: any = {},
    startToken?: Token,
    endToken?: Token,
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek();
    }
    if (!startToken) {
      startToken = endToken;
    }
    return Object.assign({}, stump, {
      type,
      nodeId: createXmlUiTreeNodeId(),
      startToken,
      endToken,
    });
  }

  /**
   * Creates a statement node
   * @param type Statement type
   * @param stump Stump properties
   * @param startToken The token that starts the statement
   * @param endToken The token that ends the statement
   */
  private createStatementNode<T extends Statement>(
    type: Statement["type"],
    stump: any,
    startToken?: Token,
    endToken?: Token,
  ): T {
    return Object.assign({}, stump, {
      type,
      nodeId: createXmlUiTreeNodeId(),
      startToken,
      endToken,
    } as Statement);
  }

  /**
   * Parses a binary literal
   * @param token Literal token
   */
  private parseBinaryLiteral(token: Token): Literal {
    let value: number | bigint;
    const bigValue = BigInt(token.text.replace(/[_']/g, ""));
    if (bigValue < Number.MIN_SAFE_INTEGER || bigValue > Number.MAX_SAFE_INTEGER) {
      value = bigValue;
    } else {
      value = parseInt(token.text.substring(2).replace(/[_']/g, ""), 2);
    }
    return this.createExpressionNode<Literal>(
      T_LITERAL,
      {
        value,
      },
      token,
      token,
    );
  }

  /**
   * Parses a decimal literal
   * @param token Literal token
   */
  private parseDecimalLiteral(token: Token): Literal {
    let value: number | bigint;
    const bigValue = BigInt(token.text.replace(/[_']/g, ""));
    if (bigValue < Number.MIN_SAFE_INTEGER || bigValue > Number.MAX_SAFE_INTEGER) {
      value = bigValue;
    } else {
      value = parseInt(token.text.replace(/[_']/g, ""), 10);
    }
    return this.createExpressionNode<Literal>(
      T_LITERAL,
      {
        value,
      },
      token,
      token,
    );
  }

  /**
   * Parses a hexadecimal literal
   * @param token Literal token
   */
  private parseHexadecimalLiteral(token: Token): Literal {
    let value: number | bigint;
    const bigValue = BigInt(token.text.replace(/[_']/g, ""));
    if (bigValue < Number.MIN_SAFE_INTEGER || bigValue > Number.MAX_SAFE_INTEGER) {
      value = bigValue;
    } else {
      value = parseInt(token.text.substring(2).replace(/[_']/g, ""), 16);
    }
    return this.createExpressionNode<Literal>(
      T_LITERAL,
      {
        value,
      },
      token,
      token,
    );
  }

  /**
   * Parses a real literal
   * @param token Literal token
   */
  private parseRealLiteral(token: Token): Literal {
    let value = parseFloat(token.text.replace(/[_']/g, ""));
    return this.createExpressionNode<Literal>(
      T_LITERAL,
      {
        value,
      },
      token,
      token,
    );
  }

  /**
   * Converts a string token to intrinsic string
   * @param token Literal token
   */
  private parseStringLiteral(token: Token, quoteSurrounded: boolean = true): Literal {
    let input = token.text;
    if (quoteSurrounded) {
      input = token.text.length < 2 ? "" : input.substring(1, input.length - 1);
    }
    let result = "";
    let state: StrParseState = StrParseState.Normal;
    let collect = 0;
    for (const ch of input) {
      switch (state) {
        case StrParseState.Normal:
          if (ch === "\\") {
            state = StrParseState.Backslash;
          } else {
            result += ch;
          }
          break;

        case StrParseState.Backslash:
          state = StrParseState.Normal;
          switch (ch) {
            case "b":
              result += "\b";
              break;
            case "f":
              result += "\f";
              break;
            case "n":
              result += "\n";
              break;
            case "r":
              result += "\r";
              break;
            case "t":
              result += "\t";
              break;
            case "v":
              result += "\v";
              break;
            case "S":
              result += "\xa0";
              break;
            case "0":
              result += String.fromCharCode(0x00);
              break;
            case "'":
              result += "'";
              break;
            case '"':
              result += '"';
              break;
            case "\\":
              result += "\\";
              break;
            case "x":
              state = StrParseState.X;
              break;
            case "u":
              state = StrParseState.UX1;
              break;
            default:
              result += ch;
              break;
          }
          break;

        case StrParseState.X:
          if (isHexaDecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.Xh;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Xh:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            result += String.fromCharCode(collect);
            state = StrParseState.Normal;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX1:
          if (ch === "{") {
            state = StrParseState.Ucp1;
            break;
          }
          if (isHexaDecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.UX2;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX2:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UX3;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX3:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UX4;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UX4:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            result += String.fromCharCode(collect);
            state = StrParseState.Normal;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp1:
          if (isHexaDecimal(ch)) {
            collect = parseInt(ch, 16);
            state = StrParseState.Ucp2;
          } else {
            result += "x";
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp2:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp3;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp3:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp4;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp4:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp5;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp5:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.Ucp6;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.Ucp6:
          if (isHexaDecimal(ch)) {
            collect = collect * 0x10 + parseInt(ch, 16);
            state = StrParseState.UcpTail;
          } else {
            result += String.fromCharCode(collect);
            result += ch;
            state = StrParseState.Normal;
          }
          break;

        case StrParseState.UcpTail:
          result += String.fromCharCode(collect);
          if (ch !== "}") {
            result += ch;
          }
          state = StrParseState.Normal;
          break;
      }
    }

    // --- Handle the final machine state
    switch (state) {
      case StrParseState.Backslash:
        result += "\\";
        break;
      case StrParseState.X:
        result += "x";
        break;
      case StrParseState.Xh:
        result += String.fromCharCode(collect);
        break;
    }

    // --- Done
    return this.createExpressionNode<Literal>(
      T_LITERAL,
      {
        value: result,
      },
      token,
      token,
    );

    function isHexaDecimal(ch: string): boolean {
      return (ch >= "0" && ch <= "9") || (ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F");
    }
  }

  private convertToArrayDestructure(seq: SequenceExpression | ArrayLiteral): Destructure | null {
    const items = seq.type === T_SEQUENCE_EXPRESSION ? seq.exprs : seq.items;
    const result = this.createExpressionNode<Destructure>(
      T_DESTRUCTURE,
      { aDestr: [] },
      seq.startToken,
      seq.endToken,
    );

    // --- Convert all items
    for (const item of items) {
      let arrayD: ArrayDestructure | undefined;
      switch (item.type) {
        case T_NO_ARG_EXPRESSION:
          arrayD = this.createExpressionNode<ArrayDestructure>(
            T_ARRAY_DESTRUCTURE,
            {},
            item.startToken,
            item.endToken,
          );
          break;
        case T_IDENTIFIER:
          arrayD = this.createExpressionNode<ArrayDestructure>(
            T_ARRAY_DESTRUCTURE,
            { id: item.name },
            item.startToken,
            item.endToken,
          );
          break;
        case T_DESTRUCTURE:
          result.aDestr!.push(...item.aDestr!);
          break;
        case T_ARRAY_DESTRUCTURE:
          arrayD = item;
          break;
        case T_ARRAY_LITERAL: {
          const destructure = this.convertToArrayDestructure(item);
          if (destructure) {
            arrayD = this.createExpressionNode<ArrayDestructure>(
              T_ARRAY_DESTRUCTURE,
              {
                aDestr: destructure.aDestr,
              },
              item.startToken,
              item.endToken,
            );
          }
          break;
        }
        case T_OBJECT_DESTRUCTURE:
          arrayD = this.createExpressionNode<ArrayDestructure>(
            T_ARRAY_DESTRUCTURE,
            {
              oDestr: item,
            },
            item.startToken,
            item.endToken,
          );
          break;
        case T_OBJECT_LITERAL: {
          const destructure = this.convertToObjectDestructure(item);
          if (destructure) {
            arrayD = this.createExpressionNode<ArrayDestructure>(
              T_ARRAY_DESTRUCTURE,
              {
                oDestr: destructure.oDestr,
              },
              item.startToken,
              item.endToken,
            );
          }
          break;
        }

        default:
          this.reportError("W017");
          return null;
      }
      if (arrayD) result.aDestr?.push(arrayD);
    }

    // --- Done.
    return result;
  }

  private convertToObjectDestructure(objLit: ObjectLiteral): Destructure | null {
    const result = this.createExpressionNode<Destructure>(
      T_DESTRUCTURE,
      { oDestr: [] },
      objLit.startToken,
      objLit.endToken,
    );

    // --- Convert all items
    for (const prop of objLit.props) {
      if (Array.isArray(prop)) {
      } else {
        this.reportError("W018");
        return null;
      }

      const [propKey, propValue] = prop;
      if (propKey.type !== T_IDENTIFIER) {
        this.reportError("W018");
        return null;
      }

      let objD: ObjectDestructure | undefined;
      switch (propValue.type) {
        case T_IDENTIFIER:
          if (propValue.name === propKey.name) {
            objD = this.createExpressionNode<ObjectDestructure>(
              T_OBJECT_DESTRUCTURE,
              { id: propKey.name },
              propValue.startToken,
              propValue.endToken,
            );
          } else {
            objD = this.createExpressionNode<ObjectDestructure>(
              T_OBJECT_DESTRUCTURE,
              {
                id: propKey.name,
                alias: propValue.name,
              },
              propValue.startToken,
              propValue.endToken,
            );
          }
          break;
        case T_ARRAY_DESTRUCTURE: {
          objD = this.createExpressionNode<ObjectDestructure>(
            T_OBJECT_DESTRUCTURE,
            {
              id: propKey.name,
              aDestr: propValue,
            },
            propKey.startToken,
            propValue.endToken,
          );
          break;
        }
        case T_ARRAY_LITERAL: {
          const destructure = this.convertToArrayDestructure(propValue);
          if (destructure) {
            objD = this.createExpressionNode<ObjectDestructure>(
              T_OBJECT_DESTRUCTURE,
              {
                id: propKey.name,
                aDestr: destructure.aDestr,
              },
              propKey.startToken,
              propValue.endToken,
            );
          }
          break;
        }
        case T_OBJECT_DESTRUCTURE:
          objD = propValue;
          break;
        case T_OBJECT_LITERAL: {
          const destructure = this.convertToObjectDestructure(propValue);
          if (destructure) {
            objD = this.createExpressionNode<ObjectDestructure>(
              T_OBJECT_DESTRUCTURE,
              {
                id: propKey.name,
                oDestr: destructure.oDestr,
              },
              propKey.startToken,
              propValue.endToken,
            );
          }
          break;
        }
        default:
          this.reportError("W018");
          return null;
      }
      if (objD) result.oDestr?.push(objD);
    }

    // --- Done.
    return result;
  }

  /**
   * Tests if the specified token can be the start of an expression
   */
  private isExpressionStart(token: Token): boolean {
    return tokenTraits[token.type]?.expressionStart ?? false;
  }
}
