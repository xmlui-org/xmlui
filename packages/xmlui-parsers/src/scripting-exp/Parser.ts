import type { ErrorCodes, ParserErrorMessage } from "./ParserError";
import type { GenericToken } from "../common/GenericToken";
import type {
  ArrayDestructure,
  ArrayLiteral,
  ArrowExpression,
  AssignmentExpression,
  ScripNodeBase,
  BinaryExpression,
  BlockStatement,
  BreakStatement,
  CalculatedMemberAccessExpression,
  ConditionalExpression,
  ConstStatement,
  ContinueStatement,
  Destructure,
  DoWhileStatement,
  EmptyStatement,
  Expression,
  ExpressionStatement,
  ForInStatement,
  ForOfStatement,
  ForStatement,
  ForVarBinding,
  FunctionDeclaration,
  FunctionInvocationExpression,
  Identifier,
  IfStatement,
  ImportDeclaration,
  LetStatement,
  Literal,
  MemberAccessExpression,
  NoArgExpression,
  ObjectDestructure,
  ObjectLiteral,
  PostfixOpExpression,
  PrefixOpExpression,
  ReactiveVarDeclaration,
  ReturnStatement,
  SequenceExpression,
  SpreadExpression,
  Statement,
  SwitchCase,
  SwitchStatement,
  ThrowStatement,
  TryStatement,
  UnaryExpression,
  VarDeclaration,
  VarStatement,
  WhileStatement,
  ImportedItem,
} from "./source-tree";

import { Lexer } from "./Lexer.js";
import { ParserError, errorMessages } from "./ParserError.js";
import { InputStream } from "../common/InputStream.js";
import { tokenTraits } from "./TokenTrait.js";
import { TokenType } from "./TokenType.js";
import { deepFreeze } from "../common/utils.js";

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
      if (statement.type !== "EmptyS") {
        this.skipToken(TokenType.Semicolon);
      }
    }
    return deepFreeze(statements);
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
          return this.createStatementNode<BreakStatement>("BrkS", {}, startToken, startToken);
        case TokenType.Continue:
          this._lexer.get();
          return this.createStatementNode<ContinueStatement>("ContS", {}, startToken, startToken);
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
        case TokenType.Export:
          return this.parseExport();
        case TokenType.Import:
          return this.parseImport();
        default:
          return this.isExpressionStart(startToken) ? this.parseExpressionStatement(allowSequence) : null;
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
    return this.createStatementNode<EmptyStatement>("EmptyS", {}, startToken, startToken);
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
          "ExprS",
          {
            expr,
          },
          startToken,
          expr.endToken
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
      decls.push(this.createExpressionNode<VarDeclaration>("VarD", declarationProps, declStart, endToken));

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<LetStatement>(
      "LetS",
      {
        decls,
      },
      startToken,
      endToken
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
      decls.push(this.createExpressionNode<VarDeclaration>("VarD", declarationProps, declStart, endToken));

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<ConstStatement>(
      "ConstS",
      {
        decls,
      },
      startToken,
      endToken
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
        endToken = this._lexer.get();
        declarationProps = {
          id: {
            type: "IdE",
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
      decls.push(this.createExpressionNode<ReactiveVarDeclaration>("RVarD", declarationProps, declStart, endToken));

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<VarStatement>(
      "VarS",
      {
        decls,
      },
      startToken,
      endToken
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
          this.createExpressionNode<ObjectDestructure>("ODestr", { id, alias, aDestr, oDestr }, startToken, endToken)
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
          this.createExpressionNode<ArrayDestructure>("ADestr", { id, aDestr, oDestr }, startToken, endToken)
        );
        this._lexer.get();
      } else if (nextToken.type === TokenType.RSquare) {
        if (id || aDestr || oDestr) {
          // --- Store a non-empty the segment
          result.push(
            this.createExpressionNode<ArrayDestructure>("ADestr", { id, aDestr, oDestr }, startToken, endToken)
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
      if (statement.type !== "EmptyS") {
        this.skipToken(TokenType.Semicolon);
      }
    }
    const endToken = this._lexer.get();
    return this.createStatementNode<BlockStatement>("BlockS", { stmts }, startToken, endToken);
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
    if (thenB.type !== "BlockS") {
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
      "IfS",
      {
        cond,
        thenB,
        elseB,
      },
      startToken,
      endToken
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
      "WhileS",
      {
        cond,
        body,
      },
      startToken,
      body.endToken
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
    if (body.type !== "BlockS" && body.type !== "EmptyS") {
      this.expectToken(TokenType.Semicolon);
    }
    this.expectToken(TokenType.While);
    this.expectToken(TokenType.LParent, "W014");
    const cond = this.getExpression();
    if (!cond) return null;
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RParent, "W006");

    return this.createStatementNode<DoWhileStatement>(
      "DoWS",
      {
        cond,
        body,
      },
      startToken,
      endToken
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
      "RetS",
      {
        expr,
      },
      startToken,
      endToken
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
        return this.parseForInOfStatement(startToken, "none", nextToken, "ForInS");
      } else if (this._lexer.ahead(1).type === TokenType.Of) {
        return this.parseForInOfStatement(startToken, "none", nextToken, "ForOfS");
      }
    } else if (nextToken.type === TokenType.Let) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "let", idToken, "ForInS");
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "let", idToken, "ForOfS");
        }
      }
    } else if (nextToken.type === TokenType.Const) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "const", idToken, "ForInS");
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "const", idToken, "ForOfS");
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
      "ForS",
      {
        init,
        cond,
        upd,
        body,
      },
      startToken,
      body.endToken
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
    type: string
  ): ForInStatement | ForOfStatement | null {
    if (varB !== "none") {
      // --- Skip variable binding type
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

    return type === "ForInS"
      ? this.createStatementNode<ForInStatement>(
          "ForInS",
          {
            varB,
            id: {
              type: "IdE",
              name: idToken.text,
              startToken: idToken,
              endToken: idToken,
            },
            expr,
            body,
          },
          startToken,
          body.endToken
        )
      : this.createStatementNode<ForOfStatement>(
          "ForOfS",
          {
            varB,
            id: {
              type: "IdE",
              name: idToken.text,
              startToken: idToken,
              endToken: idToken,
            },
            expr,
            body,
          },
          startToken,
          body.endToken
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
      "ThrowS",
      {
        expr,
      },
      startToken,
      expr.endToken
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
    const startToken = this._lexer.peek();
    let endToken: Token | undefined = this._lexer.get();
    const parser = this;

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
          type: "IdE",
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
      "TryS",
      {
        tryB,
        catchB,
        catchV,
        finallyB,
      },
      startToken,
      endToken
    );

    function getBlock(): BlockStatement | null {
      const nextToken = parser._lexer.peek();
      if (nextToken.type !== TokenType.LBrace) {
        parser.reportError("W012", nextToken);
        return null;
      }
      return parser.parseBlockStatement();
    }
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
            if (stmt.type !== "EmptyS") {
              this.skipToken(TokenType.Semicolon);
            }
        }
      }

      cases.push(
        this.createNode(
          "SwitchC",
          {
            caseE,
            stmts,
          },
          startToken
        )
      );
    }

    // --- Closing
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RBrace, "W004");
    return this.createStatementNode<SwitchStatement>(
      "SwitchS",
      {
        expr,
        cases,
      },
      startToken,
      endToken
    );
  }

  /**
   * Parses a function declaration
   *
   * functionDeclaration
   *   : "function" identifier "(" [parameterList] ")" blockStatement
   *   ;
   */
  private parseFunctionDeclaration(): FunctionDeclaration | null {
    const startToken = this._lexer.get();

    // --- Get the function name
    const funcId = this._lexer.peek();
    if (funcId.type !== TokenType.Identifier) {
      this.reportError("W003", funcId);
      return null;
    }
    this._lexer.get();

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
      case "NoArgE":
        isValid = true;
        break;
      case "IdE":
        isValid = (exprList.parenthesized ?? 0) <= 1;
        args.push(exprList);
        break;
      case "SeqE":
        isValid = exprList.parenthesized === 1;
        if (isValid) {
          for (const expr of exprList.exprs) {
            switch (expr.type) {
              case "IdE":
                isValid = !expr.parenthesized;
                args.push(expr);
                break;
              case "OLitE": {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToObjectDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case "ALitE": {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToArrayDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              default:
                isValid = false;
                break;
            }
          }
        }
        break;
      case "OLitE":
        isValid = exprList.parenthesized === 1;
        if (isValid) {
          const des = this.convertToObjectDestructure(exprList);
          if (des) args.push(des);
        }
        break;
      case "ALitE":
        isValid = exprList.parenthesized === 1;
        if (isValid) {
          const des = this.convertToArrayDestructure(exprList);
          if (des) args.push(des);
        }
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
    return this.createStatementNode<FunctionDeclaration>(
      "FuncD",
      {
        id: { type: "IdE", name: funcId.text },
        args,
        stmt,
      },
      startToken,
      stmt.endToken
    );
  }

  /**
   * Parses an export statement
   *
   * exportStatement
   *   : "export" functionDeclaration
   *   ;
   */
  private parseExport(): FunctionDeclaration | null {
    this._lexer.get();
    const nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Function) {
      if (this._statementLevel > 1) {
        this.reportError("W030", nextToken);
        return null;
      }
      const funcDecl = this.parseFunctionDeclaration();
      return funcDecl === null ? null : { ...funcDecl, exp: true };
    }
    this.reportError("W024", nextToken);
    return null;
  }

  /**
   * Parse an import declaration
   *
   * importDeclaration
   *   : "import" "{" importItem ("," importItem)* [ "," ] "}" from module
   *   ;
   *
   * importItem
   *   : identifier [ "as" identifier ]
   *   ;
   */
  private parseImport(): ImportDeclaration | null {
    const startToken = this._lexer.get();
    this.expectToken(TokenType.LBrace, "W012");
    const imports: ImportedItem[] = [];
    let nextToken = this._lexer.peek();
    while (nextToken.type !== TokenType.RBrace) {
      if (nextToken.type !== TokenType.Identifier) {
        this.reportError("W003", nextToken);
        return null;
      }
      const id = nextToken.text;
      this._lexer.get();
      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.As) {
        this._lexer.get();
        nextToken = this._lexer.peek();
        if (nextToken.type !== TokenType.Identifier) {
          this.reportError("W003", nextToken);
          return null;
        }
        if (imports.find((item) => item.id.name === nextToken.text)) {
          this.reportError("W019", nextToken, nextToken.text);
          return null;
        }
        imports.push({
          id: { type: "IdE", name: nextToken.text },
          source: id,
        });
        this._lexer.get();
      } else {
        if (imports.find((item) => item.id.name === id)) {
          this.reportError("W019", nextToken, id);
          return null;
        }
        imports.push({
          id: { type: "IdE", name: id },
          source: id,
        });
      }
      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Comma) {
        this._lexer.get();
        nextToken = this._lexer.peek();
      }
    }

    // --- Skip the closing brace
    this._lexer.get();

    // --- Check for "from"
    this.expectToken(TokenType.From, "W025");

    // --- Get the module name
    const moduleToken = this._lexer.peek();
    if (moduleToken.type !== TokenType.StringLiteral) {
      this.reportError("W026", moduleToken);
      return null;
    }
    this._lexer.get();
    const literal = this.parseStringLiteral(moduleToken);

    // --- Done.
    return this.createStatementNode<ImportDeclaration>(
      "ImportD",
      {
        imports,
        moduleFile: literal.value,
      },
      startToken,
      moduleToken
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
    return deepFreeze(allowSequence ? this.parseSequenceExpression() : this.parseCondOrSpreadOrAsgnOrArrowExpr());
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
          exprs.push(this.createExpressionNode<NoArgExpression>("NoArgE", {}, endToken, endToken));
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
      "SeqE",
      {
        exprs,
        loose,
      },
      start,
      endToken
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
            "SpreadE",
            {
              expr: spreadOperand,
            },
            startToken,
            spreadOperand.endToken
          )
        : null;
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
        "CondE",
        {
          cond: otherExpr,
          thenE: trueExpr,
          elseE: falseExpr,
        },
        startToken,
        falseExpr!.endToken
      );
    }

    if (tokenTraits[nextToken.type].isAssignment) {
      // --- Assignment
      this._lexer.get();
      const expr = this.getExpression();
      return expr
        ? this.createExpressionNode<AssignmentExpression>(
            "AsgnE",
            {
              leftValue: otherExpr,
              op: nextToken.text,
              expr,
            },
            startToken,
            expr.endToken
          )
        : null;
    }

    return otherExpr;
  }

  /**
   * Parses an arrow expression
   * @param start Start token
   * @param left Expression to the left from the arrow
   */
  private parseArrowExpression(start: Token, left: Expression): ArrowExpression | null {
    // --- Check the left expression
    let isValid: boolean;
    const args: Expression[] = [];
    switch (left.type) {
      case "NoArgE":
        isValid = true;
        break;
      case "IdE":
        isValid = (left.parenthesized ?? 0) <= 1;
        args.push(left);
        break;
      case "SeqE":
        isValid = left.parenthesized === 1;
        if (isValid) {
          for (const expr of left.exprs) {
            switch (expr.type) {
              case "IdE":
                isValid = !expr.parenthesized;
                args.push(expr);
                break;
              case "OLitE": {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToObjectDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              case "ALitE": {
                isValid = !expr.parenthesized;
                if (isValid) {
                  const des = this.convertToArrayDestructure(expr);
                  if (des) args.push(des);
                }
                break;
              }
              default:
                isValid = false;
                break;
            }
          }
        }
        break;
      case "OLitE":
        isValid = left.parenthesized === 1;
        if (isValid) {
          const des = this.convertToObjectDestructure(left);
          if (des) args.push(des);
        }
        break;
      case "ALitE":
        isValid = left.parenthesized === 1;
        if (isValid) {
          const des = this.convertToArrayDestructure(left);
          if (des) args.push(des);
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
    return statement
      ? this.createExpressionNode<ArrowExpression>(
          "ArrowE",
          {
            args,
            statement,
          },
          start,
          statement.endToken
        )
      : null;
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
        "BinaryE",
        {
          op: "??",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: "||",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: "&&",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: "|",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: "^",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: "&",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
      (opType = this.skipTokens(TokenType.Equal, TokenType.StrictEqual, TokenType.NotEqual, TokenType.StrictNotEqual))
    ) {
      const rightExpr = this.parseRelOrInExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryE",
        {
          type: "BinaryE",
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        TokenType.In
      ))
    ) {
      const rightExpr = this.parseShiftExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryE",
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
    while ((opType = this.skipTokens(TokenType.ShiftLeft, TokenType.ShiftRight, TokenType.SignedShiftRight))) {
      const rightExpr = this.parseAddExpr();
      if (!rightExpr) {
        this.reportError("W001");
        return null;
      }
      let endToken = rightExpr.endToken;
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryE",
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
        "BinaryE",
        {
          op: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
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
          "BinaryE",
          {
            op: opType.text,
            left: leftExpr,
            right: rightExpr,
          },
          startToken,
          endToken
        );
      } else {
        const prevLeft = leftExpr as BinaryExpression;
        leftExpr = this.createExpressionNode<BinaryExpression>(
          "BinaryE",
          {
            op: opType.text,
            left: prevLeft.left,
            right: {
              type: "BinaryE",
              op: opType.text,
              left: prevLeft.right,
              right: rightExpr,
            },
          },
          startToken,
          endToken
        );
      }
      count++;
    }
    return leftExpr;
  }

  /**
   * unaryExpr
   *   : ( "typeof" | "delete" | "+" | "-" | "~" | "!" ) memberOrInvocationExpr
   *   | memberOrInvocationExpr
   *   ;
   */
  private parseUnaryOrPrefixExpr(): Expression | null {
    const startToken = this._lexer.peek();
    if (tokenTraits[startToken.type].canBeUnary) {
      this._lexer.get();
      const unaryOperand = this.parseUnaryOrPrefixExpr();
      if (!unaryOperand) {
        return null;
      }
      return this.createExpressionNode<UnaryExpression>(
        "UnaryE",
        {
          op: startToken.text,
          expr: unaryOperand,
        },
        startToken,
        unaryOperand.endToken
      );
    }

    if (startToken.type === TokenType.IncOp || startToken.type === TokenType.DecOp) {
      this._lexer.get();
      const prefixOperand = this.parseMemberOrInvocationExpr();
      if (!prefixOperand) {
        return null;
      }
      return this.createExpressionNode<PrefixOpExpression>(
        "PrefE",
        {
          op: startToken.text,
          expr: prefixOperand,
        },
        startToken,
        prefixOperand.endToken
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
            args = expr.type === "SeqE" ? expr.exprs : [expr];
          }
          const endToken = this._lexer.peek();
          this.expectToken(TokenType.RParent, "W006");
          primary = this.createExpressionNode<FunctionInvocationExpression>(
            "InvokeE",
            {
              obj: primary,
              arguments: args,
            },
            startToken,
            endToken
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
            "MembE",
            {
              obj: primary,
              member: member.text,
              opt: currentStart.type === TokenType.OptionalChaining,
            },
            startToken,
            member
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
            "CMembE",
            {
              obj: primary,
              member: memberExpr,
            },
            startToken,
            endToken
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
        "PostfE",
        {
          op: nextToken.text,
          expr: primary,
        },
        startToken,
        nextToken
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
          return this.createExpressionNode<NoArgExpression>("NoArgE", {}, start, endToken);
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
          "IdE",
          {
            name: idToken.text,
          },
          idToken,
          idToken
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
          "IdE",
          {
            name: idToken.text,
            isGlobal: true,
          },
          idToken,
          idToken
        );
      }
      case TokenType.False:
      case TokenType.True:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: start.type === TokenType.True,
          },
          start,
          start
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
          "LitE",
          {
            value: Infinity,
          },
          start,
          start
        );

      case TokenType.NaN:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: NaN,
          },
          start,
          start
        );

      case TokenType.Null:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: null,
          },
          start,
          start
        );

      case TokenType.Undefined:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: undefined,
          },
          start,
          start
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

  /**
   * Parses an array literal
   */
  private parseArrayLiteral(): ArrayLiteral | null {
    const start = this._lexer.get();
    let expressions: Expression[] = [];
    if (this._lexer.peek().type !== TokenType.RSquare) {
      const expr = this.getExpression();
      if (expr) {
        expressions = expr.type === "SeqE" ? expr.exprs : [expr];
      }
    }
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RSquare);
    return this.createExpressionNode<ArrayLiteral>(
      "ALitE",
      {
        items: expressions,
      },
      start,
      endToken
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
        if (traits.expressionStart) {
          if (nextToken.type === TokenType.LSquare) {
            this._lexer.get();
            nameExpr = this.getExpression();
            if (!nameExpr) {
              return null;
            }
            this.expectToken(TokenType.RSquare, "W005");
            nameExpr = this.createExpressionNode<SequenceExpression>(
              "SeqE",
              {
                exprs: [nameExpr],
              },
              start
            );
          } else if (traits.isPropLiteral) {
            nameExpr = this.getExpression(false);
            if (!nameExpr) {
              return null;
            }
            if (nameExpr.type !== "IdE" && nameExpr.type !== "LitE" && nameExpr.type !== "SpreadE") {
              this.reportError("W007");
              return null;
            }
          } else {
            this.reportError("W007");
            return null;
          }
        } else if (traits.keywordLike) {
          nameExpr = {
            type: "IdE",
            name: nextToken.text,
            startToken: nextToken,
            endToken: nextToken,
          };
          this._lexer.get();
        } else {
          this.reportError("W001");
          return null;
        }

        const nameType = nameExpr.type;
        if (nameType === "SpreadE") {
          props.push(nameExpr);
        } else {
          if (nameType === "LitE") {
            const val = nameExpr.value;
            if (typeof val !== "number" && typeof val !== "string") {
              this.expectToken(TokenType.RBrace, "W007");
              return null;
            }
          }
          // else if (nameType !== "IdE") {
          //   this.expectToken(TokenType.RBrace, "W007");
          //   return null;
          // }

          // --- Value is optional, when we have a name
          let valueExpr: Expression | null = null;

          if (nameType === "IdE") {
            const nameFollowerToken = this._lexer.peek();
            if (nameFollowerToken.type === TokenType.Comma || nameFollowerToken.type === TokenType.RBrace) {
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
      "OLitE",
      {
        props,
      },
      start,
      endToken
    );
  }

  private parseRegExpLiteral(): Literal | null {
    const startToken = this._lexer.peek();
    const result = this._lexer.getRegEx();
    if (result.success) {
      return this.createExpressionNode<Literal>(
        "LitE",
        {
          value: new RegExp(result.pattern!, result.flags),
        },
        startToken,
        this._lexer.peek()
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
      options.forEach((o, idx) => (errorText = replace(errorText, `{${idx}}`, options[idx].toString())));
    }
    if (!token) {
      token = this._lexer.peek();
    }
    this._parseErrors.push({
      code: errorCode,
      text: errorText,
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
    endToken?: Token
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
    endToken?: Token
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek();
    }
    if (!startToken) {
      startToken = endToken;
    }
    return Object.assign({}, stump, {
      type,
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
    endToken?: Token
  ): T {
    return Object.assign({}, stump, {
      type,
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
      "LitE",
      {
        value,
      },
      token,
      token
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
      "LitE",
      {
        value,
      },
      token,
      token
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
      "LitE",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Parses a real literal
   * @param token Literal token
   */
  private parseRealLiteral(token: Token): Literal {
    let value = parseFloat(token.text.replace(/[_']/g, ""));
    return this.createExpressionNode<Literal>(
      "LitE",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Converts a string token to intrinsic string
   * @param token Literal token
   */
  private parseStringLiteral(token: Token): Literal {
    const input = token.text.length < 2 ? "" : token.text.substring(1, token.text.length - 1);
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
              result += "\\" + ch;
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
      "LitE",
      {
        value: result,
      },
      token,
      token
    );

    function isHexaDecimal(ch: string): boolean {
      return (ch >= "0" && ch <= "9") || (ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F");
    }
  }

  private convertToArrayDestructure(seq: SequenceExpression | ArrayLiteral): Destructure | null {
    const items = seq.type === "SeqE" ? seq.exprs : seq.items;
    const result = this.createExpressionNode<Destructure>("Destr", { aDestr: [] }, seq.startToken, seq.endToken);

    // --- Convert all items
    for (const item of items) {
      let arrayD: ArrayDestructure | undefined;
      switch (item.type) {
        case "NoArgE":
          arrayD = this.createExpressionNode<ArrayDestructure>("ADestr", {}, item.startToken, item.endToken);
          break;
        case "IdE":
          arrayD = this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            { id: item.name },
            item.startToken,
            item.endToken
          );
          break;
        case "Destr":
          result.aDestr!.push(...item.aDestr!);
          break;
        case "ADestr":
          arrayD = item;
          break;
        case "ALitE": {
          const destructure = this.convertToArrayDestructure(item);
          if (destructure) {
            arrayD = this.createExpressionNode<ArrayDestructure>(
              "ADestr",
              {
                aDestr: destructure.aDestr,
              },
              item.startToken,
              item.endToken
            );
          }
          break;
        }
        case "ODestr":
          arrayD = this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            {
              oDestr: item,
            },
            item.startToken,
            item.endToken
          );
          break;
        case "OLitE": {
          const destructure = this.convertToObjectDestructure(item);
          if (destructure) {
            arrayD = this.createExpressionNode<ArrayDestructure>(
              "ADestr",
              {
                oDestr: destructure.oDestr,
              },
              item.startToken,
              item.endToken
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
    const result = this.createExpressionNode<Destructure>("Destr", { oDestr: [] }, objLit.startToken, objLit.endToken);

    // --- Convert all items
    for (const prop of objLit.props) {
      if (Array.isArray(prop)) {
      } else {
        this.reportError("W018");
        return null;
      }

      const [propKey, propValue] = prop;
      if (propKey.type !== "IdE") {
        this.reportError("W018");
        return null;
      }

      let objD: ObjectDestructure | undefined;
      switch (propValue.type) {
        case "IdE":
          if (propValue.name === propKey.name) {
            objD = this.createExpressionNode<ObjectDestructure>(
              "ODestr",
              { id: propKey.name },
              propValue.startToken,
              propValue.endToken
            );
          } else {
            objD = this.createExpressionNode<ObjectDestructure>(
              "ODestr",
              {
                id: propKey.name,
                alias: propValue.name,
              },
              propValue.startToken,
              propValue.endToken
            );
          }
          break;
        case "ADestr": {
          objD = this.createExpressionNode<ObjectDestructure>(
            "ODestr",
            {
              id: propKey.name,
              aDestr: propValue,
            },
            propKey.startToken,
            propValue.endToken
          );
          break;
        }
        case "ALitE": {
          const destructure = this.convertToArrayDestructure(propValue);
          if (destructure) {
            objD = this.createExpressionNode<ObjectDestructure>(
              "ODestr",
              {
                id: propKey.name,
                aDestr: destructure.aDestr,
              },
              propKey.startToken,
              propValue.endToken
            );
          }
          break;
        }
        case "ODestr":
          objD = propValue;
          break;
        case "OLitE": {
          const destructure = this.convertToObjectDestructure(propValue);
          if (destructure) {
            objD = this.createExpressionNode<ObjectDestructure>(
              "ODestr",
              {
                id: propKey.name,
                oDestr: destructure.oDestr,
              },
              propKey.startToken,
              propValue.endToken
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
