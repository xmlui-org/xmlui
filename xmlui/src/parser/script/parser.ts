import { createErrorDiagnostic, type ParserDiagnostic } from "../common/diagnostics";
import { SourceText, type SourceSpan } from "../common/source";
import {
  type AssignmentExpressionNode,
  type BinaryExpressionNode,
  type CallExpressionNode,
  type ErrorNode,
  type ExpressionStatementNode,
  type IdentifierNode,
  type LiteralNode,
  type MemberExpressionNode,
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
    let left = this.parsePrefixExpression();

    while (true) {
      if (this.at(ScriptTokenKind.PlusPlus)) {
        const operator = this.consume();
        left = this.createPostfixExpression(left, operator);
        continue;
      }

      if (this.at(ScriptTokenKind.Dot)) {
        this.consume();
        if (!this.at(ScriptTokenKind.Identifier)) {
          const error = this.expected("XS103", "Expected property name after '.'.");
          left = this.createMemberExpression(left, this.createIdentifierFromError(error));
          continue;
        }
        left = this.createMemberExpression(left, this.createIdentifier(this.consume()));
        continue;
      }

      if (this.at(ScriptTokenKind.OpenParen)) {
        left = this.parseCallExpression(left);
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
        return this.createUnaryExpression(this.consume(), this.parseExpression(5));
      case ScriptTokenKind.OpenParen:
        return this.parseGroupedExpression();
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

  private parseCallExpression(callee: ScriptNode): CallExpressionNode {
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
    }) as CallExpressionNode;
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

  private createMemberExpression(object: ScriptNode, property: IdentifierNode): MemberExpressionNode {
    return this.node("MemberExpression", object.startToken, property.endToken, [object, property], {
      object,
      property,
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
      case ScriptTokenKind.LogicalOr:
        return 2;
      case ScriptTokenKind.LogicalAnd:
        return 3;
      default:
        return 0;
    }
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
