import { describe, expect, it } from "vitest";
import { Lexer } from "@parsers/scripting/Lexer";
import { InputStream } from "@parsers/common/InputStream";
import { Parser } from "@parsers/scripting/Parser";
import { TokenType } from "@abstractions/scripting/Token";

describe("Parser - regression", () => {
  it("Lexer 'toString'", () => {
    // --- Arrange
    const source = "toString";
    const wLexer = new Lexer(new InputStream(source));

    // --- Act
    const token = wLexer.get();

    // --- Assert
    expect(token.type).equal(TokenType.Identifier);
  });

  it("Object literal + conditional: 'true.toString()'", () => {
    // --- Act
    const wParser = new Parser("{ x: a ? b : c, y: 1}");
    const expr = wParser.parseExpr()!;

    // --- Assert
    expect(expr.type).equal("OLitE");
  });
});
