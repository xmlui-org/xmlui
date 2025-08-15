import { describe, expect, it } from "vitest";
import { Lexer } from "../../../src/parsers/scripting/Lexer";
import { InputStream } from "../../../src/parsers/common/InputStream";
import { TokenType } from "../../../src/parsers/scripting/TokenType";

describe("Lexer - miscellaneous", () => {
  it("Empty", () => {
    // --- Arrange
    const source = "";
    const wLexer = new Lexer(new InputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(TokenType.Eof);
    expect(next.text).equal(source);
    expect(next.startPosition).equal(0);
    expect(next.endPosition).equal(source.length);
    expect(next.startLine).equal(1);
    expect(next.endLine).equal(1);
    expect(next.startColumn).equal(0);
    expect(next.endColumn).equal(source.length);
  });

  const miscCases = [
    { src: "...", exp: TokenType.Spread },
    { src: ";", exp: TokenType.Semicolon },
    { src: "/", exp: TokenType.Divide },
    { src: "**", exp: TokenType.Exponent },
    { src: "*", exp: TokenType.Multiply },
    { src: "%", exp: TokenType.Remainder },
    { src: "+", exp: TokenType.Plus },
    { src: "-", exp: TokenType.Minus },
    { src: "^", exp: TokenType.BitwiseXor },
    { src: "|", exp: TokenType.BitwiseOr },
    { src: "||", exp: TokenType.LogicalOr },
    { src: "&", exp: TokenType.BitwiseAnd },
    { src: "&&", exp: TokenType.LogicalAnd },
    { src: ",", exp: TokenType.Comma },
    { src: "(", exp: TokenType.LParent },
    { src: ")", exp: TokenType.RParent },
    { src: ":", exp: TokenType.Colon },
    { src: "[", exp: TokenType.LSquare },
    { src: "]", exp: TokenType.RSquare },
    { src: "?", exp: TokenType.QuestionMark },
    { src: "??", exp: TokenType.NullCoalesce },
    { src: "?.", exp: TokenType.OptionalChaining },
    { src: "{", exp: TokenType.LBrace },
    { src: "}", exp: TokenType.RBrace },
    { src: "=", exp: TokenType.Assignment },
    { src: "==", exp: TokenType.Equal },
    { src: "===", exp: TokenType.StrictEqual },
    { src: "!", exp: TokenType.LogicalNot },
    { src: "!=", exp: TokenType.NotEqual },
    { src: "!==", exp: TokenType.StrictNotEqual },
    { src: "<", exp: TokenType.LessThan },
    { src: "<=", exp: TokenType.LessThanOrEqual },
    { src: "<<", exp: TokenType.ShiftLeft },
    { src: ">", exp: TokenType.GreaterThan },
    { src: ">=", exp: TokenType.GreaterThanOrEqual },
    { src: ">>", exp: TokenType.SignedShiftRight },
    { src: ">>>", exp: TokenType.ShiftRight },
    { src: ".", exp: TokenType.Dot },
    { src: "thisId", exp: TokenType.Identifier },
    { src: "_other145$", exp: TokenType.Identifier },
    { src: "$loader", exp: TokenType.Identifier },
    { src: "Infinity", exp: TokenType.Infinity },
    { src: "NaN", exp: TokenType.NaN },
    { src: "true", exp: TokenType.True },
    { src: "false", exp: TokenType.False },
    { src: "$item", exp: TokenType.Identifier },
    { src: "null", exp: TokenType.Null },
    { src: "undefined", exp: TokenType.Undefined },
    { src: "in", exp: TokenType.In },
    { src: "+=", exp: TokenType.AddAssignment },
    { src: "-=", exp: TokenType.SubtractAssignment },
    { src: "**=", exp: TokenType.ExponentAssignment },
    { src: "*=", exp: TokenType.MultiplyAssignment },
    { src: "/=", exp: TokenType.DivideAssignment },
    { src: "%=", exp: TokenType.RemainderAssignment },
    { src: "<<=", exp: TokenType.ShiftLeftAssignment },
    { src: ">>=", exp: TokenType.SignedShiftRightAssignment },
    { src: ">>>=", exp: TokenType.ShiftRightAssignment },
    { src: "&=", exp: TokenType.BitwiseAndAssignment },
    { src: "&&=", exp: TokenType.LogicalAndAssignment },
    { src: "^=", exp: TokenType.BitwiseXorAssignment },
    { src: "|=", exp: TokenType.BitwiseOrAssignment },
    { src: "||=", exp: TokenType.LogicalOrAssignment },
    { src: "??=", exp: TokenType.NullCoalesceAssignment },
    { src: "=>", exp: TokenType.Arrow },
    { src: "++", exp: TokenType.IncOp },
    { src: "--", exp: TokenType.DecOp },
    { src: "let", exp: TokenType.Let },
    { src: "const", exp: TokenType.Const },
    { src: "var", exp: TokenType.Var },
    { src: "if", exp: TokenType.If },
    { src: "else", exp: TokenType.Else },
    { src: "return", exp: TokenType.Return },
    { src: "break", exp: TokenType.Break },
    { src: "continue", exp: TokenType.Continue },
    { src: "do", exp: TokenType.Do },
    { src: "while", exp: TokenType.While },
    { src: "for", exp: TokenType.For },
    { src: "of", exp: TokenType.Of },
    { src: "try", exp: TokenType.Try },
    { src: "catch", exp: TokenType.Catch },
    { src: "finally", exp: TokenType.Finally },
    { src: "throw", exp: TokenType.Throw },
    { src: "switch", exp: TokenType.Switch },
    { src: "case", exp: TokenType.Case },
    { src: "default", exp: TokenType.Default },
    { src: "delete", exp: TokenType.Delete },
    { src: "function", exp: TokenType.Function },
    { src: "as", exp: TokenType.As },
  ];
  miscCases.forEach(c => {
    it(`Token ${c.src} #1`, () => {
      const source = c.src;
      const wLexer = new Lexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(source);
      expect(next.startPosition).equal(0);
      expect(next.endPosition).equal(source.length);
      expect(next.startLine).equal(1);
      expect(next.endLine).equal(1);
      expect(next.startColumn).equal(0);
      expect(next.endColumn).equal(source.length);
    });

    it(`Token ${c.src} #2`, () => {
      const source = ` \t \r ${c.src}`;
      const wLexer = new Lexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(c.src);
      expect(next.startPosition).equal(5);
      expect(next.endPosition).equal(source.length);
      expect(next.startLine).equal(1);
      expect(next.endLine).equal(1);
      expect(next.startColumn).equal(5);
      expect(next.endColumn).equal(source.length);
    });

    it(`Token ${c.src} #3`, () => {
      const source = ` /* c */ ${c.src}`;
      const wLexer = new Lexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(c.src);
      expect(next.startPosition).equal(9);
      expect(next.endPosition).equal(source.length);
      expect(next.startLine).equal(1);
      expect(next.endLine).equal(1);
      expect(next.startColumn).equal(9);
      expect(next.endColumn).equal(source.length);
    });

    it(`Token ${c.src} #4`, () => {
      const source = `${c.src} \t \r `;
      const wLexer = new Lexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(c.src);
      expect(next.startPosition).equal(0);
      expect(next.endPosition).equal(c.src.length);
      expect(next.startLine).equal(1);
      expect(next.endLine).equal(1);
      expect(next.startColumn).equal(0);
      expect(next.endColumn).equal(c.src.length);
    });

    it(`Token ${c.src} #5`, () => {
      const source = `${c.src} // c`;
      const wLexer = new Lexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();
      const trail1 = wLexer.get(true);
      const trail2 = wLexer.get(true);
      const trail3 = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(c.src);
      expect(next.startPosition).equal(0);
      expect(next.endPosition).equal(c.src.length);
      expect(next.startLine).equal(1);
      expect(next.endLine).equal(1);
      expect(next.startColumn).equal(0);
      expect(next.endColumn).equal(c.src.length);
      expect(trail1.type).equal(TokenType.Ws);
      expect(trail2.type).equal(TokenType.EolComment);
      expect(trail3.type).equal(TokenType.Eof);
    });
  });
});
