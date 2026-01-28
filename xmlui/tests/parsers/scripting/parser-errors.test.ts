import { describe, it } from "vitest";
import { Parser } from "../../../src/parsers/scripting/Parser";

describe("Parser - error cases", () => {
  const issueCases = [
    { src: "2+3:", issue: "eof" },
    { src: "a ??", issue: "W001" },
    { src: "(a+b) ||", issue: "W001" },
    { src: "!a &&", issue: "W001" },
    { src: "(a+b) |", issue: "W001" },
    { src: "!a &", issue: "W001" },
    { src: "(a+b) ^", issue: "W001" },
    { src: "!a ==", issue: "W001" },
    { src: "(a+b) !=", issue: "W001" },
    { src: "(a+b) <", issue: "W001" },
    { src: "(a+b) <=", issue: "W001" },
    { src: "(a+b) >", issue: "W001" },
    { src: "(a+b) >=", issue: "W001" },
    { src: "(a+b) >>", issue: "W001" },
    { src: "(a+b) <<", issue: "W001" },
    { src: "(a+b) >>>", issue: "W001" },
    { src: "(a+b) +", issue: "W001" },
    { src: "(a+b) -", issue: "W001" },
    { src: "(a+b) *", issue: "W001" },
    { src: "(a+b) /", issue: "W001" },
    { src: "(a+b) %", issue: "W001" },
    { src: "func(", issue: "W001" },
    { src: "obj.", issue: "W001" },
    { src: "obj[", issue: "W001" },

    { src: "dummy.", issue: "W003" },

    { src: "{", issue: "W004" },
    { src: "{ abc: 123,", issue: "W004" },
    { src: "{ abc: 123", issue: "W004" },

    { src: "obj[abc", issue: "W005" },

    { src: "func(", issue: "W006" },
    { src: "func(123", issue: "W006" },
    { src: "func(123,", issue: "W006" },
    { src: "func(123, abs", issue: "W006" },

    { src: "{ [a: 123 }", issue: "W005" },
    { src: "{ {a: 12}: 123 }", issue: "W007" },
    { src: "{ a+b: 123 }", issue: "W007" },

    { src: "{ abc", issue: "W008" },
    { src: "{ abc 123", issue: "W008" },
  ];
  issueCases.forEach((c) => {
    it(`Issue: ${c.src}/${c.issue}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      try {
        wParser.parseExpr();
        if (wParser.isEof) {
          if (c.issue === "eof") {
            return;
          }
        } else {
          if (c.issue === "eof") {
            throw new Error("EOF issue expected");
          }
        }
      } catch (err) {
        return;
      }
      throw new Error("Error expected");
    });
  });
});
