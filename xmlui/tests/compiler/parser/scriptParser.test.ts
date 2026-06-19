import { describe, expect, it } from "vitest";

import {
  findScriptNodeAtOffset,
  parseScriptEventHandler,
  parseScriptExpression,
  type AssignmentExpressionNode,
  type BinaryExpressionNode,
  type CallExpressionNode,
  type ConditionalExpressionNode,
  type IdentifierNode,
  type IndexExpressionNode,
  type MemberExpressionNode,
  type ObjectExpressionNode,
  type PostfixExpressionNode,
  type ProgramNode,
  type ScriptNode,
  type UnaryExpressionNode,
} from "../../../src/parser";

describe("ScriptParser expression mode", () => {
  it("parses literals and identifiers with stable spans", () => {
    const number = parseScriptExpression("0", { sourceId: "expr.xmlui" });
    const identifier = parseScriptExpression("count", { sourceId: "expr.xmlui" });

    expect(number.diagnostics).toEqual([]);
    expect(number.node).toMatchObject({
      kind: "Literal",
      value: 0,
      raw: "0",
      span: { sourceId: "expr.xmlui", start: 0, end: 1 },
    });
    expect(identifier.node).toMatchObject({
      kind: "Identifier",
      name: "count",
      span: { sourceId: "expr.xmlui", start: 0, end: 5 },
    });
  });

  it("parses member access and logical expressions used in mixed text", () => {
    const result = parseScriptExpression("$props.label || 'Click to increment'");

    expect(result.diagnostics).toEqual([]);
    expect(result.node.kind).toBe("BinaryExpression");
    const binary = result.node as BinaryExpressionNode;
    expect(binary.operator).toBe("||");
    expect(binary.right).toMatchObject({
      kind: "Literal",
      value: "Click to increment",
    });
    expect(binary.left.kind).toBe("MemberExpression");
    const member = binary.left as MemberExpressionNode;
    expect(member.object).toMatchObject({
      kind: "Identifier",
      name: "$props",
    });
    expect(member.property.name).toBe("label");
  });

  it("honors precedence and grouping", () => {
    const precedence = parseScriptExpression("a || b && c");
    const grouped = parseScriptExpression("(a || b) && c");

    expect(precedence.diagnostics).toEqual([]);
    expect(grouped.diagnostics).toEqual([]);
    expect((precedence.node as BinaryExpressionNode).operator).toBe("||");
    expect(((precedence.node as BinaryExpressionNode).right as BinaryExpressionNode).operator).toBe(
      "&&",
    );
    expect((grouped.node as BinaryExpressionNode).operator).toBe("&&");
    expect(((grouped.node as BinaryExpressionNode).left as BinaryExpressionNode).operator).toBe(
      "||",
    );
  });

  it("parses arithmetic, comparisons, nullish, and ternary expressions", () => {
    const arithmetic = parseScriptExpression("count + 1 * 2");
    const comparison = parseScriptExpression("count >= 2 ? 'many' : 'one'");
    const nullish = parseScriptExpression("label ?? 'fallback'");

    expect(arithmetic.diagnostics).toEqual([]);
    expect((arithmetic.node as BinaryExpressionNode).operator).toBe("+");
    expect(((arithmetic.node as BinaryExpressionNode).right as BinaryExpressionNode).operator).toBe(
      "*",
    );

    expect(comparison.diagnostics).toEqual([]);
    expect(comparison.node.kind).toBe("ConditionalExpression");
    expect(((comparison.node as ConditionalExpressionNode).test as BinaryExpressionNode).operator).toBe(
      ">=",
    );

    expect(nullish.diagnostics).toEqual([]);
    expect((nullish.node as BinaryExpressionNode).operator).toBe("??");
  });

  it("parses arrays, objects, index access, optional members, and arrows", () => {
    const array = parseScriptExpression("[{ label: 'One' }, { label: 'Two' }]");
    const object = parseScriptExpression("{ name, 'title': user?.profile?.title }");
    const indexed = parseScriptExpression("items?.[index].label");
    const mapped = parseScriptExpression("items.map(item => item.label).join(', ')");

    expect(array.diagnostics).toEqual([]);
    expect(array.node.kind).toBe("ArrayExpression");

    expect(object.diagnostics).toEqual([]);
    expect((object.node as ObjectExpressionNode).properties).toHaveLength(2);
    expect((object.node as ObjectExpressionNode).properties[0]).toMatchObject({
      kind: "ObjectProperty",
      shorthand: true,
    });

    expect(indexed.diagnostics).toEqual([]);
    expect(indexed.node.kind).toBe("MemberExpression");
    const indexedObject = (indexed.node as MemberExpressionNode).object as IndexExpressionNode;
    expect(indexedObject.kind).toBe("IndexExpression");
    expect(indexedObject.optional).toBe(true);

    expect(mapped.diagnostics).toEqual([]);
    expect(mapped.node.kind).toBe("CallExpression");
    const joinMember = (mapped.node as CallExpressionNode).callee as MemberExpressionNode;
    const mapCall = joinMember.object as CallExpressionNode;
    expect(mapCall.args[0]).toMatchObject({
      kind: "ArrowFunctionExpression",
      params: [expect.objectContaining({ name: "item" })],
    });
  });

  it("parses calls, unary expressions, assignments, and postfix increments", () => {
    const call = parseScriptExpression("save(count)");
    const unary = parseScriptExpression("!count");
    const assignment = parseScriptExpression("count = 1");
    const postfix = parseScriptExpression("count++");

    expect(call.diagnostics).toEqual([]);
    expect((call.node as CallExpressionNode).callee).toMatchObject({
      kind: "Identifier",
      name: "save",
    });
    expect((call.node as CallExpressionNode).args).toHaveLength(1);

    expect(unary.diagnostics).toEqual([]);
    expect((unary.node as UnaryExpressionNode).operator).toBe("!");

    expect(assignment.diagnostics).toEqual([]);
    expect((assignment.node as AssignmentExpressionNode).operator).toBe("=");

    expect(postfix.diagnostics).toEqual([]);
    expect((postfix.node as PostfixExpressionNode).operator).toBe("++");
  });

  it("maps embedded expression spans back to the containing xmlui source", () => {
    const result = parseScriptExpression("count++", {
      originSpan: {
        sourceId: "Main.xmlui",
        start: 100,
        end: 107,
      },
    });

    expect(result.node.span).toEqual({
      sourceId: "Main.xmlui",
      start: 100,
      end: 107,
    });
    expect(result.node.startToken?.span.generatedFrom).toEqual({
      sourceId: "anonymous.xmlui",
      start: 0,
      end: 5,
    });
  });

  it("supports AST cursor lookup", () => {
    const result = parseScriptExpression("$props.label || count");
    const lookup = findScriptNodeAtOffset(result.node, 2);

    expect(lookup?.chainAtPos.map((node) => node.kind)).toEqual([
      "BinaryExpression",
      "MemberExpression",
      "Identifier",
    ]);
    expect((lookup?.chainAtPos.at(-1) as IdentifierNode).name).toBe("$props");
  });

  it("reports the previous script node when the cursor is between child nodes", () => {
    const result = parseScriptExpression("$props.label || count");
    const lookup = findScriptNodeAtOffset(result.node, 13);

    expect(lookup?.chainAtPos.map((node) => node.kind)).toEqual(["BinaryExpression"]);
    expect(lookup?.chainBeforePos?.map((node) => node.kind)).toEqual([
      "BinaryExpression",
      "MemberExpression",
      "Identifier",
    ]);
    expect((lookup?.chainBeforePos?.at(-1) as IdentifierNode).name).toBe("label");
  });

  it("reports malformed expressions without throwing", () => {
    const missingProperty = parseScriptExpression("$props.");
    const missingParen = parseScriptExpression("save(count");

    expect(missingProperty.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS103",
          message: "Expected property name after '.'.",
        }),
      ]),
    );
    expect(missingParen.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS108",
          message: "Expected ')' after call arguments.",
        }),
      ]),
    );
  });

  it("keeps a recoverable member expression for incomplete member access", () => {
    const result = parseScriptExpression("$props.");

    expect(result.node.kind).toBe("MemberExpression");
    const member = result.node as MemberExpressionNode;
    expect(member.object).toMatchObject({
      kind: "Identifier",
      name: "$props",
    });
    expect(member.property).toMatchObject({
      kind: "Identifier",
      name: "",
      children: [expect.objectContaining({ kind: "Error" })],
    });
    expect(member.span).toEqual({
      sourceId: "anonymous.xmlui",
      start: 0,
      end: 7,
    });
  });

  it("keeps postfix update children and spans stable", () => {
    const result = parseScriptExpression("count++");

    expect(result.diagnostics).toEqual([]);
    expect(result.node).toMatchObject({
      kind: "PostfixExpression",
      operator: "++",
      span: { sourceId: "anonymous.xmlui", start: 0, end: 7 },
      children: [
        expect.objectContaining({
          kind: "Identifier",
          name: "count",
          span: { sourceId: "anonymous.xmlui", start: 0, end: 5 },
        }),
      ],
    });
  });

  it("preserves a literal node for unterminated strings while reporting diagnostics", () => {
    const result = parseScriptExpression("'unterminated");

    expect(result.node).toMatchObject({
      kind: "Literal",
      raw: "'unterminated",
      value: "unterminated",
      span: { sourceId: "anonymous.xmlui", start: 0, end: 13 },
    });
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS002",
          message: "Unterminated string literal.",
          span: { sourceId: "anonymous.xmlui", start: 0, end: 13 },
        }),
      ]),
    );
  });

  it("keeps a recoverable binary expression for incomplete logical expressions", () => {
    const result = parseScriptExpression("count ||");

    expect(result.node.kind).toBe("BinaryExpression");
    const binary = result.node as BinaryExpressionNode;
    expect(binary).toMatchObject({
      operator: "||",
      left: expect.objectContaining({ kind: "Identifier", name: "count" }),
      right: expect.objectContaining({ kind: "Error" }),
      span: { sourceId: "anonymous.xmlui", start: 0, end: 8 },
    });
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS105",
          message: "Expected expression.",
          span: { sourceId: "anonymous.xmlui", start: 8, end: 8 },
        }),
      ]),
    );
  });
});

describe("ScriptParser event-handler mode", () => {
  it("parses count++ as an expression statement list", () => {
    const result = parseScriptEventHandler("count++");

    expect(result.diagnostics).toEqual([]);
    expect(result.node.kind).toBe("Program");
    expect((result.node as ProgramNode).body).toHaveLength(1);
    expect(firstExpression(result.node).kind).toBe("PostfixExpression");
  });

  it("parses multiple semicolon-separated event-handler statements", () => {
    const result = parseScriptEventHandler("count++; save(count)");

    expect(result.diagnostics).toEqual([]);
    expect(result.node.body.map((statement) => statement.kind)).toEqual([
      "ExpressionStatement",
      "ExpressionStatement",
    ]);
    expect(firstExpression(result.node).kind).toBe("PostfixExpression");
    expect(secondExpression(result.node).kind).toBe("CallExpression");
  });

  it("maps malformed event-handler diagnostics to the containing attribute value", () => {
    const result = parseScriptEventHandler("count++ save(count)", {
      originSpan: {
        sourceId: "Main.xmlui",
        start: 42,
        end: 60,
      },
    });

    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS102",
          message: "Expected ';' between event-handler statements.",
          span: expect.objectContaining({ sourceId: "Main.xmlui", start: 50, end: 54 }),
        }),
      ]),
    );
    expect(result.node.kind).toBe("Program");
  });
});

function firstExpression(program: ProgramNode): ScriptNode {
  return program.body[0].children![0];
}

function secondExpression(program: ProgramNode): ScriptNode {
  return program.body[1].children![0];
}
