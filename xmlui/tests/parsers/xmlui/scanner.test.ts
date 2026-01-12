import { describe, expect, it } from "vitest";
import { SyntaxKind } from "../../../src/parsers/xmlui-parser/syntax-kind";
import { createScanner } from "../../../src/parsers/xmlui-parser/scanner";
import type { ScannerDiagnosticMessage } from "../../../src/parsers/xmlui-parser/diagnostics";
import { CharacterCodes } from "../../../src/parsers/xmlui-parser/CharacterCodes";

describe("XMLUI scanner - tokens", () => {
  const miscCases = [
    { src: "<", exp: SyntaxKind.OpenNodeStart },
    { src: "</", exp: SyntaxKind.CloseNodeStart },
    { src: ">", exp: SyntaxKind.NodeEnd },
    { src: "/>", exp: SyntaxKind.NodeClose },
    { src: "=", exp: SyntaxKind.Equal },
    { src: ":", exp: SyntaxKind.Colon },
    { src: "&amp;", exp: SyntaxKind.AmpersandEntity },
    { src: "&lt;", exp: SyntaxKind.LessThanEntity },
    { src: "&gt;", exp: SyntaxKind.GreaterThanEntity },
    { src: "&apos;", exp: SyntaxKind.SingleQuoteEntity },
    { src: "&quot;", exp: SyntaxKind.DoubleQuoteEntity },
  ];
  miscCases.forEach((c) => {
    it(`Token (with skipTrivia) ${c.src} #1`, () => {
      const scanner = createScanner(true, c.src);

      // --- Act
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();

      // --- Assert
      expect(next).equal(c.exp);
      expect(text).equal(c.src);
      expect(pos).equal(0);
      expect(end).equal(c.src.length);
    });

    it(`Token (with trivia) ${c.src} #1`, () => {
      const scanner = createScanner(false, c.src);

      // --- Act
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();

      // --- Assert
      expect(next).equal(c.exp);
      expect(text).equal(c.src);
      expect(pos).equal(0);
      expect(end).equal(c.src.length);
    });

    it(`Token (with trivia) ${c.src} #2`, () => {
      const scanner = createScanner(false, "  " + c.src + "   ");

      // --- Act
      const trivia1 = scanner.scan();
      const text1 = scanner.getTokenText();
      const pos1 = scanner.getTokenStart();
      const end1 = scanner.getTokenEnd();
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();
      const trivia2 = scanner.scan();
      const text2 = scanner.getTokenText();
      const pos2 = scanner.getTokenStart();
      const end2 = scanner.getTokenEnd();

      // --- Assert
      expect(trivia1).equal(SyntaxKind.WhitespaceTrivia);
      expect(text1).equal("  ");
      expect(pos1).equal(0);
      expect(end1).equal(2);

      expect(next).equal(c.exp);
      expect(text).equal(c.src);
      expect(pos).equal(2);
      expect(end).equal(2 + c.src.length);

      expect(trivia2).equal(SyntaxKind.WhitespaceTrivia);
      expect(text2).equal("   ");
      expect(pos2).equal(2 + c.src.length);
      expect(end2).equal(2 + c.src.length + 3);
    });

    it(`Token (with trivia) ${c.src} #3`, () => {
      const scanner = createScanner(false, "\n" + c.src + "   ");

      // --- Act
      const trivia1 = scanner.scan();
      const text1 = scanner.getTokenText();
      const pos1 = scanner.getTokenStart();
      const end1 = scanner.getTokenEnd();
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();
      const trivia2 = scanner.scan();
      const text2 = scanner.getTokenText();
      const pos2 = scanner.getTokenStart();
      const end2 = scanner.getTokenEnd();

      // --- Assert
      expect(trivia1).equal(SyntaxKind.NewLineTrivia);
      expect(text1).equal("\n");
      expect(pos1).equal(0);
      expect(end1).equal(1);

      expect(next).equal(c.exp);
      expect(text).equal(c.src);
      expect(pos).equal(1);
      expect(end).equal(1 + c.src.length);

      expect(trivia2).equal(SyntaxKind.WhitespaceTrivia);
      expect(text2).equal("   ");
      expect(pos2).equal(1 + c.src.length);
      expect(end2).equal(1 + c.src.length + 3);
    });
  });

  it("Comment (single trivia)", () => {
    const source = "<!-- This is a comment -->";
    const scanner = createScanner(false, source);

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();

    // --- Assert
    expect(next).equal(SyntaxKind.CommentTrivia);
    expect(text).equal(source);
    expect(pos).equal(0);
    expect(end).equal(source.length);
  });

  it("Comment (multiple trivia) #1", () => {
    const source = "<!-- This is a comment -->";
    const scanner = createScanner(false, "  " + source + "   ");

    // --- Act
    const trivia1 = scanner.scan();
    const text1 = scanner.getTokenText();
    const pos1 = scanner.getTokenStart();
    const end1 = scanner.getTokenEnd();
    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();
    const trivia2 = scanner.scan();
    const text2 = scanner.getTokenText();
    const pos2 = scanner.getTokenStart();
    const end2 = scanner.getTokenEnd();

    // --- Assert
    expect(trivia1).equal(SyntaxKind.WhitespaceTrivia);
    expect(text1).equal("  ");
    expect(pos1).equal(0);
    expect(end1).equal(2);

    expect(next).equal(SyntaxKind.CommentTrivia);
    expect(text).equal(source);
    expect(pos).equal(2);
    expect(end).equal(2 + source.length);

    expect(trivia2).equal(SyntaxKind.WhitespaceTrivia);
    expect(text2).equal("   ");
    expect(pos2).equal(2 + source.length);
    expect(end2).equal(2 + source.length + 3);
  });

  const idCases = ["_", "hello", "qwe123", "qwe_123", "abc-def", "abc.def"];
  idCases.forEach((c) => {
    it(`Id (with skipTrivia) ${c} #1`, () => {
      const scanner = createScanner(true, c);

      // --- Act
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();

      // --- Assert
      expect(next).equal(SyntaxKind.Identifier);
      expect(text).equal(c);
      expect(pos).equal(0);
      expect(end).equal(c.length);
    });
  });

  const stringCases: string[] = [
    "'a`bc'",
    "'a`bc'",
    "''",
    "'abc'",
    "'abc,def,1234:#'",
    '"\\bdef"',
    "''",
    "`abc`",
    "`abc,def,1234:#`",
    "`\\bdef`",
    '""',
    '"abc"',
    '"abc,def,1234:#"',
    '"\\bdef"',
    '"\\fdef"',
    '"\\ndef"',
    '"\\rdef"',
    '"\\tdef"',
    '"\\vdef"',
    '"\\0def"',
    '"\\\'def"',
    '"\\\\def"',
    '"\\qdef"',
    '"\\x40def"',
    '"abd\\bdef"',
    '"abd\\fdef"',
    '"abd\\ndef"',
    '"abd\\rdef"',
    '"abd\\tdef"',
    '"abd\\vdef"',
    '"abd\\0def"',
    '"abd\\\'def"',
    '"abd\\\\def"',
    '"abd\\qdef"',
    '"abd\\x40def"',
    '"abd\\b"',
    '"abd\\f"',
    '"abd\\n"',
    '"abd\\r"',
    '"abd\\t"',
    '"abd\\v"',
    '"abd\\0"',
    '"abd\\\'"',
    '"abd\\\\"',
    '"abd\\q"',
    '"abd\\x40"',
    '"abd\\u1234"',

    "'abc'",
    "'abc,def,1234:#'",
    "'\\bdef'",
  ];
  stringCases.forEach((c, idx) => {
    it(`String #${idx + 1}: ${c}`, () => {
      const scanner = createScanner(true, c);

      // --- Act
      const next = scanner.scan();
      const text = scanner.getTokenText();
      const pos = scanner.getTokenStart();
      const end = scanner.getTokenEnd();

      // --- Assert
      expect(next).equal(SyntaxKind.StringLiteral);
      expect(text).equal(c);
      expect(pos).equal(0);
      expect(end).equal(c.length);
    });
  });

  it("EOF #1", () => {
    const source = "";
    const scanner = createScanner(false, "");

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();

    // --- Assert
    expect(next).equal(SyntaxKind.EndOfFileToken);
    expect(text).equal(source);
    expect(pos).equal(0);
    expect(end).equal(0);
  });

  it("EOF #2", () => {
    const source = "";
    const scanner = createScanner(true, "  ");

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();

    // --- Assert
    expect(next).equal(SyntaxKind.EndOfFileToken);
    expect(text).equal(source);
    expect(pos).equal(2);
    expect(end).equal(2);
  });

  it("EOF #3", () => {
    const source = "";
    const scanner = createScanner(false, "  ");

    // --- Act
    const trivia1 = scanner.scan();
    const text1 = scanner.getTokenText();
    const pos1 = scanner.getTokenStart();
    const end1 = scanner.getTokenEnd();

    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();

    // --- Assert
    expect(trivia1).equal(SyntaxKind.WhitespaceTrivia);
    expect(text1).equal("  ");
    expect(pos1).equal(0);
    expect(end1).equal(2);

    expect(next).equal(SyntaxKind.EndOfFileToken);
    expect(text).equal(source);
    expect(pos).equal(2);
    expect(end).equal(2);
  });

  it("Error: unknown token", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(true, "123wer", (err) => {
      msgs.push(err);
    });

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();
    const pos = scanner.getTokenStart();
    const end = scanner.getTokenEnd();

    // --- Assert
    expect(next).equal(SyntaxKind.Unknown);
    expect(text).equal("1");
    expect(msgs.length).equal(1);
    expect(msgs[0].code).equal("W001");
  });

  it("Error: unterminated string literal #1", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(true, "'str", (err) => {
      msgs.push(err);
    });

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();

    // --- Assert
    expect(next).equal(SyntaxKind.StringLiteral);
    expect(text).equal("'str");
    expect(msgs.length).equal(1);
    expect(msgs[0].code).equal("W002");
  });

  it("Error: unterminated string literal #2", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(true, '"str', (err) => {
      msgs.push(err);
    });

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();

    // --- Assert
    expect(next).equal(SyntaxKind.StringLiteral);
    expect(text).equal('"str');
    expect(msgs.length).equal(1);
    expect(msgs[0].code).equal("W002");
  });

  it("Error: unterminated string literal #3", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(true, "`str", (err) => {
      msgs.push(err);
    });

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();

    // --- Assert
    expect(next).equal(SyntaxKind.StringLiteral);
    expect(text).equal("`str");
    expect(msgs.length).equal(1);
    expect(msgs[0].code).equal("W002");
  });

  it("scanTrivia #1", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "");

    // --- Act
    const trivia = scanner.scanTrivia();

    // --- Assert
    expect(trivia).toBe(null);
  });

  it("scanTrivia #2", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "   ");

    // --- Act
    const trivia = scanner.scanTrivia();

    // --- Assert
    expect(trivia).toBe(SyntaxKind.WhitespaceTrivia);
    expect(scanner.getTokenEnd()).toBe(3);
  });

  it("scanTrivia #3", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "<   ");
    scanner.scan();

    // --- Act
    const trivia = scanner.scanTrivia();

    // --- Assert
    expect(trivia).toBe(SyntaxKind.WhitespaceTrivia);
    expect(scanner.getTokenStart()).toBe(1);
    expect(scanner.getTokenEnd()).toBe(4);
  });

  it("scanTrivia #3", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "<id   ");
    scanner.scan();

    // --- Act
    const trivia = scanner.scanTrivia();

    // --- Assert
    expect(trivia).toBe(null);
    expect(scanner.getTokenStart()).toBe(1);
    expect(scanner.getTokenEnd()).toBe(1);
  });

  it("peekChar #1", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "123456");

    // --- Act
    const char = scanner.peekChar();

    // --- Assert
    expect(char).toBe(CharacterCodes._1);
    expect(scanner.getTokenStart()).toBe(0);
    expect(scanner.getTokenEnd()).toBe(0);
  });

  it("peekChar #2", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "123456");
    scanner.scan();
    scanner.scan();

    // --- Act
    const char = scanner.peekChar();

    // --- Assert
    expect(char).toBe(CharacterCodes._3);
    expect(scanner.getTokenEnd()).toBe(2);
  });

  it("peekChar #3", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "123456");

    // --- Act
    const char = scanner.peekChar(4);

    // --- Assert
    expect(char).toBe(CharacterCodes._5);
    expect(scanner.getTokenStart()).toBe(0);
    expect(scanner.getTokenEnd()).toBe(0);
  });

  it("peekChar #4", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const scanner = createScanner(false, "123456");
    scanner.scan();
    scanner.scan();

    // --- Act
    const char = scanner.peekChar(2);

    // --- Assert
    expect(char).toBe(CharacterCodes._5);
    expect(scanner.getTokenEnd()).toBe(2);
  });

  it("CDATA #1", () => {
    const source = "<![CDATA[This is it!]]>";
    const scanner = createScanner(false, source);

    // --- Act
    const next = scanner.scan();

    // --- Assert
    expect(next).toBe(SyntaxKind.CData);
    expect(scanner.getTokenStart()).toBe(0);
    expect(scanner.getTokenEnd()).toBe(source.length);
  });

  it("CDATA #2", () => {
    const source = "   <![CDATA[This is it!]]>";
    const scanner = createScanner(true, source);

    // --- Act
    const next = scanner.scan();

    // --- Assert
    expect(next).toBe(SyntaxKind.CData);
    expect(scanner.getTokenStart()).toBe(3);
    expect(scanner.getTokenEnd()).toBe(source.length);
  });

  it("Error: Unterminated CDATA", () => {
    const msgs: ScannerDiagnosticMessage[] = [];
    const source = "<![CDATA[This is it!]]";
    const scanner = createScanner(true, source, (err) => {
      msgs.push(err);
    });

    // --- Act
    const next = scanner.scan();
    const text = scanner.getTokenText();

    // --- Assert
    expect(next).equal(SyntaxKind.CData);
    expect(text).equal(source);
    expect(msgs.length).equal(1);
    expect(msgs[0].code).equal("W008");
  });
});
