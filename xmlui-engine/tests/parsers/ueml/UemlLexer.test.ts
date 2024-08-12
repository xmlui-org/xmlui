import { describe, expect, it } from "vitest";
import { UemlTokenType } from "@parsers/ueml/UemlToken";
import { UemlLexer} from "@parsers/ueml/UemlLexer";
import { UemlInputStream } from "@parsers/ueml/UemlInputStream";

describe("Ueml Lexer - tokens", () => {
  const commentCases = [
    "<!-- Comment -->",
    "<!-- Comment - c -->",
    "<!-- Comment --c -->",
    "<!-- Comment --comment --- comment -->",
    "<!-- \rComment --comment \r\n--- comment \t\t\n-->",
  ];
  commentCases.forEach((c) => {
    it(`Token ${c} #1`, () => {
      const source = c;
      const wLexer = new UemlLexer(new UemlInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(UemlTokenType.Comment);
      expect(next.text).equal(source);
      expect(next.location.startPosition).equal(0);
      expect(next.location.endPosition).equal(source.length);
      expect(next.location.startLine).equal(1);
      expect(next.location.endLine).equal(1);
      expect(next.location.startColumn).equal(0);
      expect(next.location.endColumn).equal(source.length);
    });

    it(`Token ${c} #2`, () => {
      const source = ` \t \r ${c}`;
      const wLexer = new UemlLexer(new UemlInputStream(source));

      // --- Act
      const next = wLexer.get(false);

      // --- Assert
      expect(next.type).equal(UemlTokenType.Comment);
      expect(next.text).equal(c);
      expect(next.location.startPosition).equal(5);
      expect(next.location.endPosition).equal(source.length);
      expect(next.location.startLine).equal(1);
      expect(next.location.endLine).equal(1);
      expect(next.location.startColumn).equal(6);
      expect(next.location.endColumn).equal(source.length);
    });

    it(`Token ${c} #3`, () => {
      const source = `${c} \t \r `;
      const wLexer = new UemlLexer(new UemlInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(UemlTokenType.Comment);
      expect(next.text).equal(c);
      expect(next.location.startPosition).equal(0);
      expect(next.location.endPosition).equal(c.length);
      expect(next.location.startLine).equal(1);
      expect(next.location.endLine).equal(1);
      expect(next.location.startColumn).equal(0);
      expect(next.location.endColumn).equal(c.length);
    });
  });

  const miscCases = [
    { src: "<", exp: UemlTokenType.OpenNodeStart},
    { src: "</", exp: UemlTokenType.CloseNodeStart},
    { src: ">", exp: UemlTokenType.NodeEnd},
    { src: "/>", exp: UemlTokenType.NodeClose},
    { src: "=", exp: UemlTokenType.Equal},
    { src: ":", exp: UemlTokenType.Colon},
  ]
  miscCases.forEach((c) => {
    it(`Token ${c.src} #1`, () => {
      const source = c.src;
      const wLexer = new UemlLexer(new UemlInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(c.exp);
      expect(next.text).equal(source);
      expect(next.location.startPosition).equal(0);
      expect(next.location.endPosition).equal(source.length);
      expect(next.location.startLine).equal(1);
      expect(next.location.endLine).equal(1);
      expect(next.location.startColumn).equal(0);
      expect(next.location.endColumn).equal(source.length);
    });
  });

  const stringCases: string[] = [
    "'a\`bc'",
    "'a\`bc'",
    "`a\\\`bc`",
    "''",
    "'abc'",
    "'abc,def,1234:#'",
    '"\\bdef"',
    "''",
    "`abc`",
    "`abc,def,1234:#`",
    '`\\bdef`',
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
    '"\\"def"',
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
    '"abd\\"def"',
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
    '"abd\\""',
    '"abd\\\\"',
    '"abd\\q"',
    '"abd\\x40"',
    '"abd\\u1234"',

    "'abc'",
    "'abc,def,1234:#'",
    "'\\bdef'",
    "'\\S'"
  ];
  stringCases.forEach((c, idx) => {
    it(`String #${idx + 1}: ${c}`, () => {
      // --- Arrange
      const wLexer = new UemlLexer(new UemlInputStream(c));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).equal(UemlTokenType.StringLiteral);
      expect(next.text).equal(c);
      expect(next.location.startPosition).equal(0);
      expect(next.location.endPosition).equal(c.length);
      expect(next.location.startLine).equal(1);
      expect(next.location.endLine).equal(1);
      expect(next.location.startColumn).equal(0);
      expect(next.location.endColumn).equal(c.length);
    });
  });

  it(`HardLiteral #1`, () => {
    const source = "<![CDATA[hello, there]]>";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.HardLiteral);
    expect(next.text).equal(source);
    expect(next.location.startPosition).equal(0);
    expect(next.location.endPosition).equal(source.length);
    expect(next.location.startLine).equal(1);
    expect(next.location.endLine).equal(1);
    expect(next.location.startColumn).equal(0);
    expect(next.location.endColumn).equal(source.length);
  });

  it(`HardLiteral #2`, () => {
    const source = "<![CDATA[hello]]>thisId";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.HardLiteral);
    expect(next.text).equal("<![CDATA[hello]]>");
    expect(follower.type).equal(UemlTokenType.Identifier);
    expect(follower.text).equal("thisId");
  });

  it(`HardLiteral #3`, () => {
    const source = `<![CDATA[hel
lo "~&']]>thisId`;
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.HardLiteral);
    expect(next.text).equal("<![CDATA[hel\nlo \"~&']]>");
    expect(follower.type).equal(UemlTokenType.Identifier);
    expect(follower.text).equal("thisId");
  });

  it(`HardLiteral #4`, () => {
    const source = "<![CDATA[hello]]><![CDATA[world]]>";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.HardLiteral);
    expect(next.text).equal("<![CDATA[hello]]>");
    expect(follower.type).equal(UemlTokenType.HardLiteral);
    expect(follower.text).equal("<![CDATA[world]]>");
  });

  it(`ScriptLiteral #1`, () => {
    const source = "<script>hello, there</script>";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.ScriptLiteral);
    expect(next.text).equal(source);
    expect(next.location.startPosition).equal(0);
    expect(next.location.endPosition).equal(source.length);
    expect(next.location.startLine).equal(1);
    expect(next.location.endLine).equal(1);
    expect(next.location.startColumn).equal(0);
    expect(next.location.endColumn).equal(source.length);
  });

  it(`ScriptLiteral #2`, () => {
    const source = "<script>hello</script>thisId";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.ScriptLiteral);
    expect(next.text).equal("<script>hello</script>");
    expect(follower.type).equal(UemlTokenType.Identifier);
    expect(follower.text).equal("thisId");
  });

  it(`ScriptLiteral #3`, () => {
    const source = `<script>hel
lo "~&'</script>thisId`;
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.ScriptLiteral);
    expect(next.text).equal("<script>hel\nlo \"~&'</script>");
    expect(follower.type).equal(UemlTokenType.Identifier);
    expect(follower.text).equal("thisId");
  });

  it(`ScriptLiteral #4`, () => {
    const source = "<script>hello</script><script>world</script>";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();
    const follower = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.ScriptLiteral);
    expect(next.text).equal("<script>hello</script>");
    expect(follower.type).equal(UemlTokenType.ScriptLiteral);
    expect(follower.text).equal("<script>world</script>");
  });

  it(`ScriptLiteral #5`, () => {
    const source = "<script>a < b</script>";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.ScriptLiteral);
    expect(next.text).equal("<script>a < b</script>");
  });

  it(`nbsp #1`, () => {
    const source = "'\S'";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.StringLiteral);
    expect(next.text).equal(source);
    expect(next.location.startPosition).equal(0);
    expect(next.location.endPosition).equal(source.length);
    expect(next.location.startLine).equal(1);
    expect(next.location.endLine).equal(1);
    expect(next.location.startColumn).equal(0);
    expect(next.location.endColumn).equal(source.length);
  });

  it(`nbsp #1`, () => {
    const source = "'\n\r\\S'";
    const wLexer = new UemlLexer(new UemlInputStream(source));

    // --- Act
    const next = wLexer.get();

    // --- Assert
    expect(next.type).equal(UemlTokenType.StringLiteral);
    expect(next.text).equal(source);
    expect(next.location.startPosition).equal(0);
    expect(next.location.endPosition).equal(source.length);
    expect(next.location.startLine).equal(1);
    expect(next.location.endLine).equal(1);
    expect(next.location.startColumn).equal(0);
    expect(next.location.endColumn).equal(source.length);
  });
});
