import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import type {
  ConstStatement,
  Literal} from "../../../src/components-core/script-runner/ScriptingSourceTree";
import {
  T_CONST_STATEMENT,
  T_LITERAL,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - regex literals", () => {
  it("null", () => {
    // --- Arrange
    const wParser = new Parser("null");

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr).not.equal(null);
    if (!expr) return;
    expect(expr.type).equal(T_LITERAL);
  });

  const regExpCases = [
    /\w+/g,
    /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+\[{\]}\\|;:'",.<>\/?\s]+)/g,
    /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    /^\s*\*\/$/,
    /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
    /^(\t|(\ \ ))*\ \*\/\s*$/,
    /[=><!~?:&|+\-*\/\^%]+/,
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    /\d+(_+\d+)*/,
    /[0-7]+(_+[0-7]+)*/,
    /[0-1]+(_+[0-1]+)*/,
    /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
    /[(){}\[\]\$\^|\-*+?\.]/,
    /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
    /\d/, // Match any digit
    /\D/, // Match any non-digit character
    /\w/, // Match any word character
    /\W/, // Match any non-word character
    /\s/, // Match any whitespace character
    /\S/, // Match any non-whitespace character
    /a/, // Match a specific character
    /abc/, // Match a specific sequence of characters
    /./, // Match any character except newline
    /a*/, // Match zero or more occurrences of a character
    /a+/, // Match one or more occurrences of a character
    /a?/, // Match zero or one occurrence of a character
    /a{3}/, // Match a specific number of occurrences of a character
    /a{2,4}/, // Match a range of occurrences of a character
    /[abc]/, // Match any character in a character class
    /[^abc]/, // Match any character not in a character class
    /[a-z]/, // Match any character in a range
    /[^a-z]/, // Match any character not in a range
    /^/, // Match the start of a string
    /$/, // Match the end of a string
    /\b/, // Match the start of a word
    /\b\w/, // Match the end of a word
    /\B/, // Match a word boundary not at the start or end of a word
    /(abc)/, // Match a group of characters
    /(abc|def)/, // Match either of two patterns
    /.+?/, // Match any character except newline in a non-greedy way
    /.+/i, // Match any character except newline in a case-insensitive manner
    /a(?=b)/, // Match a character only if it is followed by another character
    /a(?!b)/, // Match a character only if it is not followed by another character
    /(?<=a)b/, // Match a character only if it is preceded by another character
    /(?<!a)b/, // Match a character only if it is not preceded by another character
    /\p{Sc}/u, // Match a character with a specific Unicode property
    /\P{Sc}/u, // Match a character without a specific Unicode property
    /\p{Script=Hiragana}/u, // Match a character with a specific Unicode script property
    /\P{Script=Hiragana}/u, // Match a character without a specific Unicode script property
    /\u{1F602}/u, // Match a Unicode character by its code point
    /\p{General_Category=Letter}/u, // Match a character with a specific Unicode property value
    /\P{General_Category=Letter}/u, // Match a character without a specific Unicode property value
    /[^abc]/i, // Match any character except those in a character class ignoring case
    /[^a-z]/i, // Match any character except those in a range ignoring case
    /\x41/, // Match a digit in hexadecimal format
    /\o101/, // Match a digit in octal format
    /\b01000001\b/, // Match a digit in binary format
    /\p{Dash}/u, // Match a character with a specific Unicode binary property value
    /\P{Dash}/u, // Match a character without a specific Unicode binary property value
    /\p{L}/u, // Match a character with a specific Unicode property value using shorthand
    /\P{L}/u, // Match a character without a specific Unicode property value using shorthand
    /[:digit:]/u, // Match a character with a specific Unicode property value using POSIX syntax
    /[^:digit:]/u, // Match a character without a specific Unicode property value using POSIX syntax
  ];

  regExpCases.forEach((regExp) => {
    it(`RegExp: ${regExp}`, () => {
      const parser = new Parser(regExp.toString());
      const result = parser.parseExpr()!;

      expect(result.type).toBe(T_LITERAL);
      const literal = result as Literal;
      expect(literal.value instanceof RegExp).equal(true);
      expect(literal.value).toStrictEqual(regExp);
    });

    it(`RegExp in statement: ${regExp} #1`, () => {
      const parser = new Parser(`const a = ${regExp};`);
      const result = parser.parseStatements()!;

      expect(result.length).toBe(1);
      const stmt = result[0] as ConstStatement;
      expect(stmt.decls[0].expr!.type).equal(T_LITERAL);
      const literal = stmt.decls[0].expr as Literal;
      expect(literal.value instanceof RegExp).equal(true);
      expect(literal.value).toStrictEqual(regExp);
    });

    it(`RegExp in statement: ${regExp} #2`, () => {
      const parser = new Parser(`const a = ''.match(${regExp}) + 120;`);
      const result = parser.parseStatements()!;

      expect(result.length).toBe(1);
      expect(result[0].type).toBe(T_CONST_STATEMENT);
    });
  });
});
