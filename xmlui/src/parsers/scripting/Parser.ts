import type {
  ArrayDestructure,
  ArrayLiteral,
  ArrowExpression,
  AssignmentExpression,
  BaseNode,
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
  TemplateLiteralExpression,
  ThrowStatement,
  TryStatement,
  UnaryExpression,
  VarDeclaration,
  VarStatement,
  WhileStatement,
} from "../../abstractions/scripting/ScriptingSourceTree";
import type { Token } from "@abstractions/scripting/Token";
import type {
  ScriptParserErrorMessage,
  ScriptParsingErrorCodes,
} from "@abstractions/scripting/ScriptParserError";

import { TokenType } from "../../abstractions/scripting/Token";
import { InputStream } from "../common/InputStream";
import { tokenTraits } from "./TokenTrait";
import { Lexer } from "./Lexer";
import { errorMessages, ParserError } from "./ParserError";

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
  private _parseErrors: ScriptParserErrorMessage[] = [];

  // --- Use this lexer
  private _lexer: Lexer;

  // --- Indicates the parsing level
  private _statementLevel = 0;

  /**
   * Initializes the parser with the specified source code
   * @param source Source code to parse
   */
  constructor(public readonly source: string) {
    this._lexer = new Lexer(new InputStream(source));
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): ScriptParserErrorMessage[] {
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
          if (startToken.type === TokenType.Eof) {
            this.reportError("W002", startToken, "EOF");
            return null;
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
    const expression = this.getExpression(allowSequence);
    return expression
      ? this.createStatementNode<ExpressionStatement>(
          "ExprS",
          {
            expression,
          },
          startToken,
          expression.endToken,
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
    const declarations: VarDeclaration[] = [];
    while (true) {
      const declStart = this._lexer.peek();
      let declarationProps: any = {};
      if (declStart.type === TokenType.LBrace) {
        // --- This is object destructure
        endToken = this._lexer.ahead(1);
        const objectDestruct = this.parseObjectDestructure();
        if (objectDestruct === null) return null;
        declarationProps = {
          objectDestruct,
        };
        endToken =
          objectDestruct.length > 0 ? objectDestruct[objectDestruct.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.LSquare) {
        // --- This is array destructure
        endToken = this._lexer.ahead(1);
        const arrayDestruct = this.parseArrayDestructure();
        if (arrayDestruct === null) return null;
        declarationProps = {
          arrayDestruct,
        };
        endToken =
          arrayDestruct.length > 0 ? arrayDestruct[arrayDestruct.length - 1].endToken : endToken;
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
      let expression: Expression | null = null;
      if (initToken.type === TokenType.Assignment) {
        this._lexer.get();
        expression = this.getExpression(false);
        if (expression === null) return null;
        declarationProps.expression = expression;
        endToken = expression.endToken;
      } else if (declarationProps.arrayDestruct || declarationProps.objectDestruct) {
        this.reportError("W009", initToken);
        return null;
      }

      // --- New declaration reached
      declarations.push(
        this.createExpressionNode<VarDeclaration>("VarD", declarationProps, declStart, endToken),
      );

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<LetStatement>(
      "LetS",
      {
        declarations,
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
    const declarations: VarDeclaration[] = [];
    while (true) {
      const declStart = this._lexer.peek();
      let declarationProps: any = {};
      if (declStart.type === TokenType.LBrace) {
        // --- This is object destructure
        endToken = this._lexer.ahead(1);
        const objectDestruct = this.parseObjectDestructure();
        if (objectDestruct === null) return null;
        declarationProps = {
          objectDestruct,
        };
        endToken =
          objectDestruct.length > 0 ? objectDestruct[objectDestruct.length - 1].endToken : endToken;
      } else if (declStart.type === TokenType.LSquare) {
        // --- This is array destructure
        endToken = this._lexer.ahead(1);
        const arrayDestruct = this.parseArrayDestructure();
        if (arrayDestruct === null) return null;
        declarationProps = {
          arrayDestruct,
        };
        endToken =
          arrayDestruct.length > 0 ? arrayDestruct[arrayDestruct.length - 1].endToken : endToken;
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
      const expression = this.getExpression(false);
      if (expression === null) return null;
      declarationProps.expression = expression;
      endToken = expression.endToken;

      // --- New declaration reached
      declarations.push(
        this.createExpressionNode<VarDeclaration>("VarD", declarationProps, declStart, endToken),
      );

      // --- Check for more declarations
      if (this._lexer.peek().type !== TokenType.Comma) break;
      this._lexer.get();
    }

    // --- Done
    return this.createStatementNode<ConstStatement>(
      "ConstS",
      {
        declarations,
      },
      startToken,
      endToken,
    );
  }

  /**
   * Parses a const statement
   *
   * constStatement
   *   : "var" id "=" expression
   *   ;
   */
  private parseVarStatement(): VarStatement | null {
    const startToken = this._lexer.get();
    let endToken: Token | undefined = startToken;
    const declarations: ReactiveVarDeclaration[] = [];
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
          id: declStart.text,
        };
      } else {
        this.reportError("W003");
        return null;
      }

      // --- Mandatory initialization
      this.expectToken(TokenType.Assignment);
      const expression = this.getExpression(false);
      if (expression === null) return null;
      declarationProps.expression = expression;
      endToken = expression.endToken;
      // --- New declaration reached
      declarations.push(
        this.createExpressionNode<ReactiveVarDeclaration>(
          "RVarD",
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
      "VarS",
      {
        declarations,
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
      let arrayDestruct: ArrayDestructure[] | undefined | null;
      let objectDestruct: ObjectDestructure[] | undefined | null;
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
          arrayDestruct = this.parseArrayDestructure();
          if (arrayDestruct === null) return null;
          endToken = arrayDestruct[arrayDestruct.length - 1].endToken;
        } else if (nextToken.type === TokenType.LBrace) {
          objectDestruct = this.parseObjectDestructure();
          if (objectDestruct === null) return null;
          endToken = objectDestruct[objectDestruct.length - 1].endToken;
        }
      }

      // --- Check for next segment
      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Comma || nextToken.type === TokenType.RBrace) {
        result.push(
          this.createExpressionNode<ObjectDestructure>(
            "ODestr",
            { id, alias, arrayDestruct, objectDestruct },
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
      let arrayDestruct: ArrayDestructure[] | undefined | null;
      let objectDestruct: ObjectDestructure[] | undefined | null;
      if (nextToken.type === TokenType.Identifier) {
        id = nextToken.text;
        if (id.startsWith("$")) {
          this.reportError("W031");
          return null;
        }

        endToken = nextToken;
        nextToken = this._lexer.get();
      } else if (nextToken.type === TokenType.LSquare) {
        arrayDestruct = this.parseArrayDestructure();
        if (arrayDestruct === null) return null;
        endToken = arrayDestruct[arrayDestruct.length - 1].endToken;
      } else if (nextToken.type === TokenType.LBrace) {
        objectDestruct = this.parseObjectDestructure();
        if (objectDestruct === null) return null;
        endToken = objectDestruct[objectDestruct.length - 1].endToken;
      }

      nextToken = this._lexer.peek();
      if (nextToken.type === TokenType.Comma) {
        // --- Store the segment
        result.push(
          this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            { id, arrayDestruct, objectDestruct },
            startToken,
            endToken,
          ),
        );
        this._lexer.get();
      } else if (nextToken.type === TokenType.RSquare) {
        if (id || arrayDestruct || objectDestruct) {
          // --- Store a non-empty the segment
          result.push(
            this.createExpressionNode<ArrayDestructure>(
              "ADestr",
              { id, arrayDestruct, objectDestruct },
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
    const statements: Statement[] = [];
    while (this._lexer.peek().type !== TokenType.RBrace) {
      const statement = this.parseStatement();
      if (!statement) return null;
      statements.push(statement);
      if (statement.type !== "EmptyS") {
        this.skipToken(TokenType.Semicolon);
      }
    }
    const endToken = this._lexer.get();
    return this.createStatementNode<BlockStatement>("BlockS", { statements }, startToken, endToken);
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
    const condition = this.getExpression();
    if (!condition) return null;
    this.expectToken(TokenType.RParent, "W006");
    const thenBranch = this.parseStatement();
    if (!thenBranch) return null;
    endToken = thenBranch.endToken;
    let elseCanFollow = true;
    if (thenBranch.type !== "BlockS") {
      // --- We need a closing semicolon before else
      if (this._lexer.peek().type === TokenType.Semicolon) {
        this._lexer.get();
      } else {
        elseCanFollow = false;
      }
    }
    let elseBranch: Statement | null = null;
    if (elseCanFollow && this._lexer.peek().type === TokenType.Else) {
      this._lexer.get();
      elseBranch = this.parseStatement();
      if (!elseBranch) return null;
      endToken = elseBranch.endToken;
    }
    return this.createStatementNode<IfStatement>(
      "IfS",
      {
        condition,
        thenBranch,
        elseBranch,
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
    const condition = this.getExpression();
    if (!condition) return null;
    this.expectToken(TokenType.RParent, "W006");
    const body = this.parseStatement();
    if (!body) return null;

    return this.createStatementNode<WhileStatement>(
      "WhileS",
      {
        condition,
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
    if (body.type !== "BlockS" && body.type !== "EmptyS") {
      this.expectToken(TokenType.Semicolon);
    }
    this.expectToken(TokenType.While);
    this.expectToken(TokenType.LParent, "W014");
    const condition = this.getExpression();
    if (!condition) return null;
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RParent, "W006");

    return this.createStatementNode<DoWhileStatement>(
      "DoWS",
      {
        condition,
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
    let expression: Expression | undefined | null;
    if (tokenTraits[this._lexer.peek().type].expressionStart) {
      expression = this.getExpression();
      if (expression === null) return null;
      endToken = expression.endToken;
    }
    return this.createStatementNode<ReturnStatement>(
      "RetS",
      {
        expression,
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
        return this.parseForInOfStatement(startToken, "none", nextToken.text, "ForInS");
      } else if (this._lexer.ahead(1).type === TokenType.Of) {
        return this.parseForInOfStatement(startToken, "none", nextToken.text, "ForOfS");
      }
    } else if (nextToken.type === TokenType.Let) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "let", idToken.text, "ForInS");
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "let", idToken.text, "ForOfS");
        }
      }
    } else if (nextToken.type === TokenType.Const) {
      const idToken = this._lexer.ahead(1);
      if (idToken.type === TokenType.Identifier) {
        const inOfToken = this._lexer.ahead(2);
        if (inOfToken.type === TokenType.In) {
          return this.parseForInOfStatement(startToken, "const", idToken.text, "ForInS");
        } else if (inOfToken.type === TokenType.Of) {
          return this.parseForInOfStatement(startToken, "const", idToken.text, "ForOfS");
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
      if (init.declarations.some((d) => !d.expression)) {
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
    let condition: Expression | null | undefined;
    nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Semicolon) {
      // --- No condition
      this._lexer.get();
    } else {
      condition = this.getExpression();
      if (condition === null) {
        return null;
      }
      this.expectToken(TokenType.Semicolon);
    }

    // --- Parse the update expression
    let update: Expression | null | undefined;
    nextToken = this._lexer.peek();
    if (nextToken.type !== TokenType.RParent) {
      update = this.getExpression();
      if (update === null) {
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
        condition,
        update,
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
   * @param varBinding Variable binding of the for..in/of statement
   * @param id ID name
   * @param type Is it a for..in or a for..of?
   */
  private parseForInOfStatement(
    startToken: Token,
    varBinding: ForVarBinding,
    id: string,
    type: string,
  ): ForInStatement | ForOfStatement | null {
    if (varBinding !== "none") {
      if (id.startsWith("$")) {
        this.reportError("W031");
        return null;
      }

      // --- Skip variable binding type
      this._lexer.get();
    }

    // --- Skip variable name, in/of token
    this._lexer.get();
    this._lexer.get();

    // --- Get the expression
    const expression = this.getExpression(true);

    // --- Close the declaration part
    this.expectToken(TokenType.RParent, "W006");

    // --- Get the body
    const body = this.parseStatement();
    if (!body) return null;

    return type === "ForInS"
      ? this.createStatementNode<ForInStatement>(
          "ForInS",
          {
            varBinding,
            id,
            expression,
            body,
          },
          startToken,
          body.endToken,
        )
      : this.createStatementNode<ForOfStatement>(
          "ForOfS",
          {
            varBinding,
            id,
            expression,
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
    let expression: Expression | undefined | null;
    expression = this.getExpression();
    if (expression === null) return null;
    return this.createStatementNode<ThrowStatement>(
      "ThrowS",
      {
        expression,
      },
      startToken,
      expression.endToken,
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
    const tryBlock = getBlock()!;
    let catchBlock: BlockStatement | undefined;
    let catchVariable: string | undefined;
    let finallyBlock: BlockStatement | undefined;
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
        catchVariable = nextToken.text;
        this._lexer.get();
        this.expectToken(TokenType.RParent, "W006");
      }

      // --- Get catch block
      catchBlock = getBlock()!;
      endToken = catchBlock.endToken;
      if (this._lexer.peek().type === TokenType.Finally) {
        // --- Finally after catch
        this._lexer.get();
        finallyBlock = getBlock()!;
        endToken = finallyBlock.endToken;
      }
    } else if (nextToken.type === TokenType.Finally) {
      // --- Finally found
      this._lexer.get();
      finallyBlock = getBlock()!;
      endToken = finallyBlock.endToken;
    } else {
      this.reportError("W013", nextToken);
      return null;
    }

    return this.createStatementNode<TryStatement>(
      "TryS",
      {
        tryBlock,
        catchBlock,
        catchVariable,
        finallyBlock,
      },
      startToken,
      endToken,
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
    const expression = this.getExpression();
    if (!expression) return null;
    this.expectToken(TokenType.RParent, "W006");

    // --- Parse the case blocks
    this.expectToken(TokenType.LBrace, "W012");
    const cases: SwitchCase[] = [];
    let defaultCaseFound = false;
    while (true) {
      let nextToken = this._lexer.peek();
      let caseExpression: Expression | null | undefined;
      if (nextToken.type === TokenType.Case) {
        // --- Process "case"
        this._lexer.get();
        caseExpression = this.getExpression();
        if (!caseExpression) return null;
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
      let statements: Statement[] = [];
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
            statements.push(stmt);
            if (stmt.type !== "EmptyS") {
              this.skipToken(TokenType.Semicolon);
            }
        }
      }

      cases.push(
        this.createNode(
          "SwitchC",
          {
            caseExpression,
            statements,
          },
          startToken,
        ),
      );
    }

    // --- Closing
    const endToken = this._lexer.peek();
    this.expectToken(TokenType.RBrace, "W004");
    return this.createStatementNode<SwitchStatement>(
      "SwitchS",
      {
        expression,
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
        let spreadFound = false;
        if (isValid) {
          for (const expr of exprList.expressions) {
            // --- Spread operator can be used only in the last position
            if (spreadFound) {
              isValid = false;
              break;
            }
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
              case "SpreadE": {
                spreadFound = true;
                if (expr.operand.type !== "IdE") {
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
      case "SpreadE":
        if (exprList.operand.type !== "IdE") {
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

    const body = this.parseBlockStatement();
    if (!body) return null;

    // --- Done.
    return this.createStatementNode<FunctionDeclaration>(
      "FuncD",
      {
        name: funcId.text,
        args,
        statement: body,
      },
      startToken,
      body.endToken,
    );
  }

  /**
   * Parses an export statement
   *
   * exportStatement
   *   : "export" (constStatement | functionDeclaration)
   *   ;
   */
  private parseExport(): ConstStatement | FunctionDeclaration | null {
    this._lexer.get();
    const nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.Const) {
      if (this._statementLevel > 1) {
        this.reportError("W030", nextToken);
        return null;
      }
      const constStmt = this.parseConstStatement();
      return constStmt === null ? null : { ...constStmt, isExported: true };
    } else if (nextToken.type === TokenType.Function) {
      if (this._statementLevel > 1) {
        this.reportError("W030", nextToken);
        return null;
      }
      const funcDecl = this.parseFunctionDeclaration();
      return funcDecl === null ? null : { ...funcDecl, isExported: true };
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
    const imports: Record<string, string> = {};
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
        if (imports[nextToken.text]) {
          this.reportError("W019", nextToken, nextToken.text);
          return null;
        }
        imports[nextToken.text] = id;
        this._lexer.get();
      } else {
        if (imports[id]) {
          this.reportError("W019", nextToken, id);
          return null;
        }
        imports[id] = id;
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
      moduleToken,
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
    const expressions: Expression[] = [];
    let loose = false;

    if (this._lexer.peek().type === TokenType.Comma) {
      expressions.push(leftExpr);
      while (this.skipToken(TokenType.Comma)) {
        if (this._lexer.peek().type === TokenType.Comma) {
          loose = true;
          endToken = this._lexer.peek();
          expressions.push(
            this.createExpressionNode<NoArgExpression>("NoArgE", {}, endToken, endToken),
          );
        } else {
          const nextExpr = this.parseCondOrSpreadOrAsgnOrArrowExpr();
          if (!nextExpr) {
            break;
          }
          endToken = nextExpr.endToken;
          expressions.push(nextExpr);
        }
      }
    }

    if (!expressions.length) {
      // --- No sequence
      return leftExpr;
    }

    // --- Create the sequence expression
    leftExpr = this.createExpressionNode<SequenceExpression>(
      "SeqE",
      {
        expressions,
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
            "SpreadE",
            {
              operand: spreadOperand,
            },
            startToken,
            spreadOperand.endToken,
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
          condition: otherExpr,
          consequent: trueExpr,
          alternate: falseExpr,
        },
        startToken,
        falseExpr!.endToken,
      );
    }

    if (tokenTraits[nextToken.type].isAssignment) {
      // --- Assignment
      this._lexer.get();
      const operand = this.getExpression();
      return operand
        ? this.createExpressionNode<AssignmentExpression>(
            "AsgnE",
            {
              leftValue: otherExpr,
              operator: nextToken.text,
              operand,
            },
            startToken,
            operand.endToken,
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
        let spreadFound = false;
        if (isValid) {
          for (const expr of left.expressions) {
            if (spreadFound) {
              isValid = false;
              break;
            }
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
              case "SpreadE": {
                spreadFound = true;
                if (expr.operand.type !== "IdE") {
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
      case "SpreadE":
        isValid = left.operand.type === "IdE";
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
    return statement
      ? this.createExpressionNode<ArrowExpression>(
          "ArrowE",
          {
            args,
            statement,
          },
          start,
          statement.endToken,
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
          operator: "??",
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
        "BinaryE",
        {
          operator: "||",
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
        "BinaryE",
        {
          operator: "&&",
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
        "BinaryE",
        {
          operator: "|",
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
        "BinaryE",
        {
          operator: "^",
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
        "BinaryE",
        {
          operator: "&",
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
        "BinaryE",
        {
          type: "BinaryE",
          operator: opType.text,
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
        "BinaryE",
        {
          operator: opType.text,
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
        "BinaryE",
        {
          operator: opType.text,
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
        "BinaryE",
        {
          operator: opType.text,
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
        "BinaryE",
        {
          operator: opType.text,
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
          "BinaryE",
          {
            operator: opType.text,
            left: leftExpr,
            right: rightExpr,
          },
          startToken,
          endToken,
        );
      } else {
        const prevLeft = leftExpr as BinaryExpression;
        leftExpr = this.createExpressionNode<BinaryExpression>(
          "BinaryE",
          {
            operator: opType.text,
            left: prevLeft.left,
            right: {
              type: "BinaryE",
              operator: opType.text,
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
          operator: startToken.text,
          operand: unaryOperand,
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
        "PrefE",
        {
          operator: startToken.text,
          operand: prefixOperand,
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
            args = expr.type === "SeqE" ? expr.expressions : [expr];
          }
          const endToken = this._lexer.peek();
          this.expectToken(TokenType.RParent, "W006");
          primary = this.createExpressionNode<FunctionInvocationExpression>(
            "InvokeE",
            {
              object: primary,
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
            "MembE",
            {
              object: primary,
              member: member.text,
              isOptional: currentStart.type === TokenType.OptionalChaining,
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
            "CMembE",
            {
              object: primary,
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
        "PostfE",
        {
          operator: nextToken.text,
          operand: primary,
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
          return this.createExpressionNode<NoArgExpression>("NoArgE", {}, start, endToken);
        }

        // --- Parenthesized
        const parenthesizedExpr = this.parseExpr();
        if (!parenthesizedExpr) {
          return null;
        }
        const endToken = this._lexer.peek();
        this.expectToken(TokenType.RParent, "W006");
        parenthesizedExpr.parenthesized ??= 0;
        parenthesizedExpr.parenthesized++;
        parenthesizedExpr.startToken = start;
        parenthesizedExpr.startPosition = start.location.startPosition;
        parenthesizedExpr.startLine = start.location.startLine;
        parenthesizedExpr.startColumn = start.location.startColumn;
        parenthesizedExpr.endToken = endToken;
        parenthesizedExpr.endPosition = endToken.location.endPosition;
        parenthesizedExpr.endLine = endToken.location.endLine;
        parenthesizedExpr.endColumn = endToken.location.endColumn;
        parenthesizedExpr.source = this.getSource(start, endToken);
        return parenthesizedExpr;

      case TokenType.Identifier: {
        const idToken = this._lexer.get();
        return this.createExpressionNode<Identifier>(
          "IdE",
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
          "IdE",
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
          "LitE",
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
          "LitE",
          {
            value: Infinity,
          },
          start,
          start,
        );

      case TokenType.NaN:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: NaN,
          },
          start,
          start,
        );

      case TokenType.Null:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
          {
            value: null,
          },
          start,
          start,
        );

      case TokenType.Undefined:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "LitE",
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
      "TempLitE",
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
        expressions = expr.type === "SeqE" ? expr.expressions : [expr];
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
                expressions: [nameExpr],
              },
              start,
            );
          } else if (traits.isPropLiteral) {
            nameExpr = this.getExpression(false);
            if (!nameExpr) {
              return null;
            }
            if (
              nameExpr.type !== "IdE" &&
              nameExpr.type !== "LitE" &&
              nameExpr.type !== "SpreadE"
            ) {
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
            value: undefined,
            startPosition: nextToken.location.startPosition,
            startLine: nextToken.location.startLine,
            startColumn: nextToken.location.startColumn,
            endPosition: nextToken.location.endPosition,
            endLine: nextToken.location.endLine,
            endColumn: nextToken.location.endColumn,
            source: nextToken.text,
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
      "OLitE",
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
        "LitE",
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
  private expectToken(
    type: TokenType,
    errorCode?: ScriptParsingErrorCodes,
    allowEof?: boolean,
  ): Token | null {
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
  private reportError(errorCode: ScriptParsingErrorCodes, token?: Token, ...options: any[]): void {
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
      line: token.location.startLine,
      column: token.location.startColumn,
      position: token.location.startPosition,
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
  private createNode<T extends BaseNode>(
    type: BaseNode["type"],
    stump: any,
    startToken: Token,
    endToken?: Token,
    source?: string,
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek();
    }
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.startPosition;
    return Object.assign({}, stump, {
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.endColumn,
      source: source ?? this.getSource(startToken, endToken),
    } as BaseNode);
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
    source?: string,
  ): T {
    if (!endToken) {
      endToken = this._lexer.peek();
    }
    if (!startToken) {
      startToken = endToken;
    }
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.endPosition;
    return Object.assign({}, stump, {
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.endColumn,
      source: source ?? this.getSource(startToken, endToken),
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
    const startPosition = startToken?.location?.startPosition;
    const currentToken = this._lexer.peek();
    const endPosition = endToken
      ? endToken.location.endPosition
      : currentToken.type === TokenType.Eof
        ? currentToken.location.startPosition + 1
        : currentToken.location.startPosition;
    return Object.assign({}, stump, {
      type,
      startPosition,
      endPosition,
      startLine: startToken?.location?.startLine,
      startColumn: startToken?.location?.startColumn,
      endLine: endToken ? endToken.location.endLine : startToken?.location?.endLine,
      endColumn: endToken ? endToken.location.endColumn : startToken?.location?.endColumn,
      source:
        this.source && startPosition !== undefined && endPosition !== undefined
          ? this.source.substring(startPosition, endPosition)
          : undefined,
      startToken,
      endToken,
    } as Statement);
  }

  /**
   * Gets the source code for the specified token range
   * @param start Start token
   * @param end Optional end token
   * @returns The source code for the token range
   */
  private getSource(start: Token, end: Token): string {
    return this.source.substring(
      start.location.startPosition,
      end.type === TokenType.Eof ? end.location.startPosition : end.location.endPosition,
    );
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
      "LitE",
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
      "LitE",
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
      "LitE",
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
      "LitE",
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
    const items = seq.type === "SeqE" ? seq.expressions : seq.items;
    const result = this.createExpressionNode<Destructure>(
      "Destr",
      { arrayDestruct: [] },
      seq.startToken,
      seq.endToken,
    );

    // --- Convert all items
    for (const item of items) {
      let arrayD: ArrayDestructure | undefined;
      switch (item.type) {
        case "NoArgE":
          arrayD = this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            {},
            item.startToken,
            item.endToken,
          );
          break;
        case "IdE":
          arrayD = this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            { id: item.name },
            item.startToken,
            item.endToken,
          );
          break;
        case "Destr":
          result.arrayDestruct!.push(...item.arrayDestruct!);
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
                arrayDestruct: destructure.arrayDestruct,
              },
              item.startToken,
              item.endToken,
            );
          }
          break;
        }
        case "ODestr":
          arrayD = this.createExpressionNode<ArrayDestructure>(
            "ADestr",
            {
              objectDestruct: item,
            },
            item.startToken,
            item.endToken,
          );
          break;
        case "OLitE": {
          const destructure = this.convertToObjectDestructure(item);
          if (destructure) {
            arrayD = this.createExpressionNode<ArrayDestructure>(
              "ADestr",
              {
                objectDestruct: destructure.objectDestruct,
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
      if (arrayD) result.arrayDestruct?.push(arrayD);
    }

    // --- Done.
    return result;
  }

  private convertToObjectDestructure(objLit: ObjectLiteral): Destructure | null {
    const result = this.createExpressionNode<Destructure>(
      "Destr",
      { objectDestruct: [] },
      objLit.startToken,
      objLit.endToken,
    );

    // --- Convert all items
    for (const prop of objLit.props) {
      if (Array.isArray(prop)) {
      } else {
        reportError("W018");
        return null;
      }

      const [propKey, propValue] = prop;
      if (propKey.type !== "IdE") {
        reportError("W018");
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
              propValue.endToken,
            );
          } else {
            objD = this.createExpressionNode<ObjectDestructure>(
              "ODestr",
              {
                id: propKey.name,
                alias: propValue.name,
              },
              propValue.startToken,
              propValue.endToken,
            );
          }
          break;
        case "ADestr": {
          objD = this.createExpressionNode<ObjectDestructure>(
            "ODestr",
            {
              id: propKey.name,
              arrayDestruct: propValue,
            },
            propKey.startToken,
            propValue.endToken,
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
                arrayDestruct: destructure.arrayDestruct,
              },
              propKey.startToken,
              propValue.endToken,
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
                objectDestruct: destructure.objectDestruct,
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
      if (objD) result.objectDestruct?.push(objD);
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
("TypeError: Cannot read properties of undefined (reading 'canBeUnary')\n    at Parser.parseUnaryOrPrefixExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:2041:38)\n    at Parser.parseExponentialExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1985:25)\n    at Parser.parseMultExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1951:25)\n    at Parser.parseAddExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1917:25)\n    at Par…nExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1835:25)\n    at Parser.parseEquExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1793:25)\n    at Parser.parseBitwiseAndExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1760:25)\n    at Parser.parseBitwiseXorExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1727:25)\n    at Parser.parseBitwiseOrExpr (/home/ez/code/work/xmlui/xmlui/src/parsers/scripting/Parser.ts:1694:25)");
