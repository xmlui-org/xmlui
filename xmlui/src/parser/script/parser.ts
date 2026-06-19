import { createErrorDiagnostic, type ParserDiagnostic } from "../common/diagnostics";
import { SourceText, type SourceSpan } from "../common/source";
import {
  type AssignmentExpressionNode,
  type ArrayExpressionNode,
  type ArrowFunctionExpressionNode,
  type BinaryExpressionNode,
  type CallExpressionNode,
  type ConditionalExpressionNode,
  type ErrorNode,
  type ExpressionStatementNode,
  type IdentifierNode,
  type IndexExpressionNode,
  type LiteralNode,
  type MemberExpressionNode,
  type ObjectExpressionNode,
  type ObjectPropertyNode,
  type ParseScriptOptions,
  type ParseScriptResult,
  type PostfixExpressionNode,
  type ProgramNode,
  type ScriptNode,
  type ScriptNodeKind,
  type ScriptSourceInput,
  type UnaryExpressionNode,
} from "./ast";
import { tokenizeScript, type ScriptToken } from "./scanner";
import { isScriptTrivia, ScriptTokenKind } from "./tokenKind";

export function parseScriptExpression(
  source: ScriptSourceInput,
  options: ParseScriptOptions = {},
): ParseScriptResult<ScriptNode> {
  return new ScriptParser(source, options).parseExpressionDocument();
}

export function parseScriptEventHandler(
  source: ScriptSourceInput,
  options: ParseScriptOptions = {},
): ParseScriptResult<ProgramNode> {
  return new ScriptParser(source, options).parseEventHandlerDocument();
}

class ScriptParser {
  private readonly source: SourceText;
  private readonly tokens: ScriptToken[];
  private readonly diagnostics: ParserDiagnostic[];
  private offset = 0;

  constructor(source: ScriptSourceInput, options: ParseScriptOptions) {
    this.source = source instanceof SourceText ? source : new SourceText(source, options.sourceId);
    const tokenizeResult = tokenizeScript(this.source, options);
    this.tokens = tokenizeResult.tokens.filter((token) => !isScriptTrivia(token.kind));
    this.diagnostics = [...tokenizeResult.diagnostics];
  }

  parseExpressionDocument(): ParseScriptResult<ScriptNode> {
    const expression = this.parseExpression();
    if (!this.at(ScriptTokenKind.EndOfFile)) {
      this.report("XS101", "Unexpected token after expression.", this.current());
    }
    return {
      source: this.source,
      node: expression,
      diagnostics: this.diagnostics,
    };
  }

  parseEventHandlerDocument(): ParseScriptResult<ProgramNode> {
    const body: ScriptNode[] = [];
    while (!this.at(ScriptTokenKind.EndOfFile)) {
      const expression = this.parseExpression();
      body.push(this.createExpressionStatement(expression));
      if (this.at(ScriptTokenKind.Semicolon)) {
        this.consume();
      } else if (!this.at(ScriptTokenKind.EndOfFile)) {
        this.report("XS102", "Expected ';' between event-handler statements.", this.current());
        this.recoverToStatementBoundary();
        if (this.at(ScriptTokenKind.Semicolon)) {
          this.consume();
        }
      }
    }

    return {
      source: this.source,
      node: this.createProgram(body),
      diagnostics: this.diagnostics,
    };
  }

  private parseExpression(precedence = 0): ScriptNode {
    let left = this.parseArrowExpression();

    while (true) {
      if (this.at(ScriptTokenKind.PlusPlus)) {
        const operator = this.consume();
        left = this.createPostfixExpression(left, operator);
        continue;
      }

      if (this.at(ScriptTokenKind.Dot) || this.at(ScriptTokenKind.QuestionDot)) {
        const optional = this.at(ScriptTokenKind.QuestionDot);
        this.consume();
        if (optional && this.at(ScriptTokenKind.OpenParen)) {
          left = this.parseCallExpression(left, true);
          continue;
        }
        if (optional && this.at(ScriptTokenKind.OpenBracket)) {
          left = this.parseIndexExpression(left, true);
          continue;
        }
        if (!this.at(ScriptTokenKind.Identifier)) {
          const error = this.expected("XS103", `Expected property name after '${optional ? "?." : "."}'.`);
          left = this.createMemberExpression(left, this.createIdentifierFromError(error), optional);
          continue;
        }
        left = this.createMemberExpression(left, this.createIdentifier(this.consume()), optional);
        continue;
      }

      if (this.at(ScriptTokenKind.OpenBracket)) {
        left = this.parseIndexExpression(left, false);
        continue;
      }

      if (this.at(ScriptTokenKind.OpenParen)) {
        left = this.parseCallExpression(left, false);
        continue;
      }

      if (this.at(ScriptTokenKind.Question) && precedence < 2) {
        const question = this.consume();
        const consequent = this.parseExpression();
        if (!this.at(ScriptTokenKind.Colon)) {
          this.report("XS110", "Expected ':' in conditional expression.", this.current());
        } else {
          this.consume();
        }
        const alternate = this.parseExpression(1);
        left = this.createConditionalExpression(left, question, consequent, alternate);
        continue;
      }

      const currentPrecedence = this.binaryPrecedence(this.current().kind);
      if (currentPrecedence <= precedence) {
        break;
      }

      const operator = this.consume();
      const right = this.parseExpression(
        operator.kind === ScriptTokenKind.Equal ? currentPrecedence - 1 : currentPrecedence,
      );
      left =
        operator.kind === ScriptTokenKind.Equal
          ? this.createAssignmentExpression(left, operator, right)
          : this.createBinaryExpression(left, operator, right);
    }

    return left;
  }

  private parseArrowExpression(): ScriptNode {
    if (this.at(ScriptTokenKind.Identifier) && this.peekNonTriviaKind(1) === ScriptTokenKind.Arrow) {
      const param = this.createIdentifier(this.consume());
      const arrow = this.consume(ScriptTokenKind.Arrow);
      return this.createArrowFunctionExpression([param], arrow, this.parseExpression());
    }

    if (this.at(ScriptTokenKind.OpenParen)) {
      const checkpoint = this.offset;
      const params = this.tryParseArrowParams();
      if (params) {
        const arrow = this.consume(ScriptTokenKind.Arrow);
        return this.createArrowFunctionExpression(params, arrow, this.parseExpression());
      }
      this.offset = checkpoint;
    }

    return this.parsePrefixExpression();
  }

  private parsePrefixExpression(): ScriptNode {
    const token = this.current();
    switch (token.kind) {
      case ScriptTokenKind.Identifier:
        return this.createIdentifier(this.consume());
      case ScriptTokenKind.Dollar: {
        const dollar = this.consume();
        if (!this.at(ScriptTokenKind.Identifier)) {
          return this.expected("XS104", "Expected identifier after '$'.");
        }
        const identifier = this.consume();
        return this.createIdentifier(identifier, `$${identifier.text}`, dollar);
      }
      case ScriptTokenKind.NumberLiteral:
      case ScriptTokenKind.StringLiteral:
      case ScriptTokenKind.TrueKeyword:
      case ScriptTokenKind.FalseKeyword:
      case ScriptTokenKind.NullKeyword:
      case ScriptTokenKind.UndefinedKeyword:
        return this.createLiteral(this.consume());
      case ScriptTokenKind.Exclamation:
      case ScriptTokenKind.Plus:
      case ScriptTokenKind.Minus:
        return this.createUnaryExpression(this.consume(), this.parseExpression(10));
      case ScriptTokenKind.OpenParen:
        return this.parseGroupedExpression();
      case ScriptTokenKind.OpenBracket:
        return this.parseArrayExpression();
      case ScriptTokenKind.OpenBrace:
        return this.parseObjectExpression();
      default:
        return this.expected("XS105", "Expected expression.");
    }
  }

  private parseGroupedExpression(): ScriptNode {
    const open = this.consume(ScriptTokenKind.OpenParen);
    const expression = this.parseExpression();
    if (this.at(ScriptTokenKind.CloseParen)) {
      const close = this.consume(ScriptTokenKind.CloseParen);
      return {
        ...expression,
        span: this.span(open, close),
        startToken: open,
        endToken: close,
      };
    }
    this.report("XS106", "Expected ')' to close grouped expression.", this.current());
    return expression;
  }

  private parseArrayExpression(): ArrayExpressionNode {
    const open = this.consume(ScriptTokenKind.OpenBracket);
    const elements: ScriptNode[] = [];

    while (!this.at(ScriptTokenKind.EndOfFile) && !this.at(ScriptTokenKind.CloseBracket)) {
      elements.push(this.parseExpression());
      if (this.at(ScriptTokenKind.Comma)) {
        this.consume();
        continue;
      }
      if (!this.at(ScriptTokenKind.CloseBracket)) {
        this.report("XS111", "Expected ',' between array elements.", this.current());
        break;
      }
    }

    const close = this.at(ScriptTokenKind.CloseBracket)
      ? this.consume(ScriptTokenKind.CloseBracket)
      : this.current();
    if (close.kind !== ScriptTokenKind.CloseBracket) {
      this.report("XS112", "Expected ']' after array literal.", close);
    }

    return this.node("ArrayExpression", open, close, elements, {
      elements,
    }) as ArrayExpressionNode;
  }

  private parseObjectExpression(): ObjectExpressionNode {
    const open = this.consume(ScriptTokenKind.OpenBrace);
    const properties: ObjectPropertyNode[] = [];

    while (!this.at(ScriptTokenKind.EndOfFile) && !this.at(ScriptTokenKind.CloseBrace)) {
      properties.push(this.parseObjectProperty());
      if (this.at(ScriptTokenKind.Comma)) {
        this.consume();
        continue;
      }
      if (!this.at(ScriptTokenKind.CloseBrace)) {
        this.report("XS113", "Expected ',' between object properties.", this.current());
        break;
      }
    }

    const close = this.at(ScriptTokenKind.CloseBrace)
      ? this.consume(ScriptTokenKind.CloseBrace)
      : this.current();
    if (close.kind !== ScriptTokenKind.CloseBrace) {
      this.report("XS114", "Expected '}' after object literal.", close);
    }

    return this.node("ObjectExpression", open, close, properties, {
      properties,
    }) as ObjectExpressionNode;
  }

  private parseObjectProperty(): ObjectPropertyNode {
    const key = this.parseObjectKey();
    if (this.at(ScriptTokenKind.Colon)) {
      this.consume();
      const value = this.parseExpression();
      return this.node("ObjectProperty", key.startToken, value.endToken, [key, value], {
        key,
        value,
      }) as ObjectPropertyNode;
    }
    if (key.kind === "Identifier") {
      return this.node("ObjectProperty", key.startToken, key.endToken, [key], {
        key,
        value: key,
        shorthand: true,
      }) as ObjectPropertyNode;
    }
    this.report("XS115", "Expected ':' after object property key.", this.current());
    const value = this.node("Error", key.endToken, key.endToken, []) as ErrorNode;
    return this.node("ObjectProperty", key.startToken, key.endToken, [key, value], {
      key,
      value,
    }) as ObjectPropertyNode;
  }

  private parseObjectKey(): IdentifierNode | LiteralNode {
    if (this.at(ScriptTokenKind.Identifier)) {
      return this.createIdentifier(this.consume());
    }
    if (this.at(ScriptTokenKind.StringLiteral) || this.at(ScriptTokenKind.NumberLiteral)) {
      return this.createLiteral(this.consume());
    }
    return this.createIdentifierFromError(this.expected("XS116", "Expected object property key."));
  }

  private parseIndexExpression(object: ScriptNode, optional: boolean): IndexExpressionNode {
    const open = this.consume(ScriptTokenKind.OpenBracket);
    const index = this.parseExpression();
    const close = this.at(ScriptTokenKind.CloseBracket)
      ? this.consume(ScriptTokenKind.CloseBracket)
      : this.current();
    if (close.kind !== ScriptTokenKind.CloseBracket) {
      this.report("XS117", "Expected ']' after index expression.", close);
    }
    return this.node("IndexExpression", object.startToken, close, [object, index], {
      object,
      index,
      ...(optional ? { optional } : {}),
    }) as IndexExpressionNode;
  }

  private parseCallExpression(callee: ScriptNode, optional: boolean): CallExpressionNode {
    const open = this.consume(ScriptTokenKind.OpenParen);
    const args: ScriptNode[] = [];

    while (!this.at(ScriptTokenKind.EndOfFile) && !this.at(ScriptTokenKind.CloseParen)) {
      args.push(this.parseExpression());
      if (this.at(ScriptTokenKind.Comma)) {
        this.consume();
        continue;
      }
      if (!this.at(ScriptTokenKind.CloseParen)) {
        this.report("XS107", "Expected ',' between call arguments.", this.current());
        break;
      }
    }

    const close = this.at(ScriptTokenKind.CloseParen)
      ? this.consume(ScriptTokenKind.CloseParen)
      : this.current();
    if (close.kind !== ScriptTokenKind.CloseParen) {
      this.report("XS108", "Expected ')' after call arguments.", close);
    }

    return this.node("CallExpression", callee.startToken, close, [callee, ...args], {
      callee,
      args,
      openToken: open,
      ...(optional ? { optional } : {}),
    }) as CallExpressionNode;
  }

  private tryParseArrowParams(): IdentifierNode[] | undefined {
    const open = this.consume(ScriptTokenKind.OpenParen);
    const params: IdentifierNode[] = [];
    while (!this.at(ScriptTokenKind.EndOfFile) && !this.at(ScriptTokenKind.CloseParen)) {
      if (!this.at(ScriptTokenKind.Identifier)) {
        return undefined;
      }
      params.push(this.createIdentifier(this.consume()));
      if (this.at(ScriptTokenKind.Comma)) {
        this.consume();
        continue;
      }
      if (!this.at(ScriptTokenKind.CloseParen)) {
        return undefined;
      }
    }
    if (!this.at(ScriptTokenKind.CloseParen)) {
      return undefined;
    }
    this.consume(ScriptTokenKind.CloseParen);
    if (!this.at(ScriptTokenKind.Arrow)) {
      return undefined;
    }
    if (params.length !== 1) {
      this.report("XS118", "Only single-parameter arrow callbacks are supported.", open);
    }
    return params;
  }

  private createProgram(body: ScriptNode[]): ProgramNode {
    const first = body[0];
    const eof = this.current();
    return {
      kind: "Program",
      span: first ? this.span(first.startToken, first.endToken ?? eof) : this.span(eof, eof),
      startToken: first?.startToken ?? eof,
      endToken: body.at(-1)?.endToken ?? eof,
      children: body,
      body,
    };
  }

  private createExpressionStatement(expression: ScriptNode): ExpressionStatementNode {
    return {
      kind: "ExpressionStatement",
      span: expression.span,
      startToken: expression.startToken,
      endToken: expression.endToken,
      children: [expression],
      expression,
    };
  }

  private createIdentifier(
    token: ScriptToken,
    name: string = token.text,
    startToken: ScriptToken = token,
  ): IdentifierNode {
    return this.node("Identifier", startToken, token, [], { name }) as IdentifierNode;
  }

  private createIdentifierFromError(error: ScriptNode): IdentifierNode {
    return {
      kind: "Identifier",
      name: "",
      span: error.span,
      startToken: error.startToken,
      endToken: error.endToken,
      children: [error],
    };
  }

  private createLiteral(token: ScriptToken): LiteralNode {
    return this.node("Literal", token, token, [], {
      raw: token.text,
      value: literalValue(token),
    }) as LiteralNode;
  }

  private createUnaryExpression(operator: ScriptToken, argument: ScriptNode): UnaryExpressionNode {
    return this.node("UnaryExpression", operator, argument.endToken, [argument], {
      operator: operator.text,
      argument,
    }) as UnaryExpressionNode;
  }

  private createPostfixExpression(argument: ScriptNode, operator: ScriptToken): PostfixExpressionNode {
    return this.node("PostfixExpression", argument.startToken, operator, [argument], {
      operator: operator.text,
      argument,
    }) as PostfixExpressionNode;
  }

  private createMemberExpression(
    object: ScriptNode,
    property: IdentifierNode,
    optional = false,
  ): MemberExpressionNode {
    return this.node("MemberExpression", object.startToken, property.endToken, [object, property], {
      object,
      property,
      ...(optional ? { optional } : {}),
    }) as MemberExpressionNode;
  }

  private createBinaryExpression(
    left: ScriptNode,
    operator: ScriptToken,
    right: ScriptNode,
  ): BinaryExpressionNode {
    return this.node("BinaryExpression", left.startToken, right.endToken, [left, right], {
      operator: operator.text,
      left,
      right,
    }) as BinaryExpressionNode;
  }

  private createAssignmentExpression(
    left: ScriptNode,
    operator: ScriptToken,
    right: ScriptNode,
  ): AssignmentExpressionNode {
    return this.node("AssignmentExpression", left.startToken, right.endToken, [left, right], {
      operator: operator.text,
      left,
      right,
    }) as AssignmentExpressionNode;
  }

  private createConditionalExpression(
    test: ScriptNode,
    question: ScriptToken,
    consequent: ScriptNode,
    alternate: ScriptNode,
  ): ConditionalExpressionNode {
    return this.node("ConditionalExpression", test.startToken, alternate.endToken ?? question, [
      test,
      consequent,
      alternate,
    ], {
      test,
      consequent,
      alternate,
    }) as ConditionalExpressionNode;
  }

  private createArrowFunctionExpression(
    params: IdentifierNode[],
    arrow: ScriptToken,
    body: ScriptNode,
  ): ArrowFunctionExpressionNode {
    return this.node("ArrowFunctionExpression", params[0]?.startToken ?? arrow, body.endToken, [
      ...params,
      body,
    ], {
      params,
      body,
    }) as ArrowFunctionExpressionNode;
  }

  private expected(code: string, message: string): ErrorNode {
    const token = this.current();
    this.report(code, message, token);
    if (!this.at(ScriptTokenKind.EndOfFile)) {
      this.consume();
    }
    return this.node("Error", token, token, []) as ErrorNode;
  }

  private node(
    kind: ScriptNodeKind,
    startToken: ScriptToken | undefined,
    endToken: ScriptToken | undefined,
    children: ScriptNode[],
    extra: Record<string, unknown> = {},
  ): ScriptNode {
    return {
      kind,
      span: this.span(startToken, endToken),
      startToken,
      endToken,
      children,
      ...extra,
    } as ScriptNode;
  }

  private binaryPrecedence(kind: ScriptTokenKind): number {
    switch (kind) {
      case ScriptTokenKind.Equal:
        return 1;
      case ScriptTokenKind.NullishCoalescing:
        return 2;
      case ScriptTokenKind.LogicalOr:
        return 3;
      case ScriptTokenKind.LogicalAnd:
        return 4;
      case ScriptTokenKind.EqualEqual:
      case ScriptTokenKind.EqualEqualEqual:
      case ScriptTokenKind.ExclamationEqual:
      case ScriptTokenKind.ExclamationEqualEqual:
        return 5;
      case ScriptTokenKind.LessThan:
      case ScriptTokenKind.LessThanEqual:
      case ScriptTokenKind.GreaterThan:
      case ScriptTokenKind.GreaterThanEqual:
        return 6;
      case ScriptTokenKind.Plus:
      case ScriptTokenKind.Minus:
        return 7;
      case ScriptTokenKind.Star:
      case ScriptTokenKind.Slash:
      case ScriptTokenKind.Percent:
        return 8;
      default:
        return 0;
    }
  }

  private peekNonTriviaKind(distance: number): ScriptTokenKind {
    return this.tokens[this.offset + distance]?.kind ?? ScriptTokenKind.EndOfFile;
  }

  private recoverToStatementBoundary(): void {
    while (!this.at(ScriptTokenKind.EndOfFile) && !this.at(ScriptTokenKind.Semicolon)) {
      this.consume();
    }
  }

  private consume(expectedKind?: ScriptTokenKind): ScriptToken {
    const token = this.current();
    if (expectedKind && token.kind !== expectedKind) {
      this.report("XS109", `Expected ${expectedKind}.`, token);
    }
    this.offset++;
    return token;
  }

  private at(kind: ScriptTokenKind): boolean {
    return this.current().kind === kind;
  }

  private current(): ScriptToken {
    return this.tokens[this.offset] ?? this.tokens[this.tokens.length - 1];
  }

  private report(code: string, message: string, token: ScriptToken): void {
    this.diagnostics.push(createErrorDiagnostic(code, message, token.span));
  }

  private span(startToken: ScriptToken | undefined, endToken: ScriptToken | undefined): SourceSpan {
    const fallback = this.current().span;
    return {
      sourceId: startToken?.span.sourceId ?? endToken?.span.sourceId ?? fallback.sourceId,
      start: startToken?.span.start ?? endToken?.span.start ?? fallback.start,
      end: endToken?.span.end ?? startToken?.span.end ?? fallback.end,
    };
  }
}

function literalValue(token: ScriptToken): string | number | boolean | null | undefined {
  switch (token.kind) {
    case ScriptTokenKind.NumberLiteral:
      return Number(token.value ?? token.text);
    case ScriptTokenKind.StringLiteral:
      return token.value ?? "";
    case ScriptTokenKind.TrueKeyword:
      return true;
    case ScriptTokenKind.FalseKeyword:
      return false;
    case ScriptTokenKind.NullKeyword:
      return null;
    case ScriptTokenKind.UndefinedKeyword:
      return undefined;
    default:
      return token.text;
  }
}
