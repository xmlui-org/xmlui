import { describe, expect, it } from "vitest";

import { Parser } from "../../../src/parsers/scripting/Parser";
import {
  T_BINARY_EXPRESSION,
  T_CALCULATED_MEMBER_ACCESS_EXPRESSION,
  T_CONDITIONAL_EXPRESSION,
  T_FUNCTION_INVOCATION_EXPRESSION,
  T_IDENTIFIER,
  T_LITERAL,
  T_MEMBER_ACCESS_EXPRESSION,
  T_SEQUENCE_EXPRESSION,
  T_UNARY_EXPRESSION,
  UnaryExpression,
} from "../../../src/components-core/script-runner/ScriptingSourceTree";

describe("Parser - unary expressions", () => {
  const unaryCases = [
    { src: "+a", op: "+", exp: T_IDENTIFIER },
    { src: "-a", op: "-", exp: T_IDENTIFIER },
    { src: "!a", op: "!", exp: T_IDENTIFIER },
    { src: "~a", op: "~", exp: T_IDENTIFIER },
    { src: "typeof a", op: "typeof", exp: T_IDENTIFIER },
    { src: "delete a", op: "delete", exp: T_IDENTIFIER },

    { src: "+3", op: "+", exp: T_LITERAL },
    { src: "-3.14", op: "-", exp: T_LITERAL },
    { src: "!0b1111", op: "!", exp: T_LITERAL },
    { src: "~0xa123", op: "~", exp: T_LITERAL },
    { src: 'typeof "abc"', op: "typeof", exp: T_LITERAL },
    { src: 'delete "abc"', op: "delete", exp: T_LITERAL },

    { src: "+!a", op: "+", exp: T_UNARY_EXPRESSION },
    { src: "-!a", op: "-", exp: T_UNARY_EXPRESSION },
    { src: "!!a", op: "!", exp: T_UNARY_EXPRESSION },
    { src: "~!a", op: "~", exp: T_UNARY_EXPRESSION },
    { src: "typeof !a", op: "typeof", exp: T_UNARY_EXPRESSION },
    { src: "delete !a", op: "delete", exp: T_UNARY_EXPRESSION },

    { src: "+(a+b)", op: "+", exp: T_BINARY_EXPRESSION },
    { src: "-(a+b)", op: "-", exp: T_BINARY_EXPRESSION },
    { src: "!(a+b)", op: "!", exp: T_BINARY_EXPRESSION },
    { src: "~(a+b)", op: "~", exp: T_BINARY_EXPRESSION },
    { src: "typeof (a+b)", op: "typeof", exp: T_BINARY_EXPRESSION },
    { src: "delete (a+b)", op: "delete", exp: T_BINARY_EXPRESSION },

    { src: "+(a, b)", op: "+", exp: T_SEQUENCE_EXPRESSION },
    { src: "-(a, b)", op: "-", exp: T_SEQUENCE_EXPRESSION },
    { src: "!(a, b)", op: "!", exp: T_SEQUENCE_EXPRESSION },
    { src: "~(a, b)", op: "~", exp: T_SEQUENCE_EXPRESSION },
    { src: "typeof (a, b)", op: "typeof", exp: T_SEQUENCE_EXPRESSION },
    { src: "delete (a, b)", op: "delete", exp: T_SEQUENCE_EXPRESSION },

    { src: "+(a ? b : c)", op: "+", exp: T_CONDITIONAL_EXPRESSION },
    { src: "-(a ? b : c)", op: "-", exp: T_CONDITIONAL_EXPRESSION },
    { src: "!(a ? b : c)", op: "!", exp: T_CONDITIONAL_EXPRESSION },
    { src: "~(a ? b : c)", op: "~", exp: T_CONDITIONAL_EXPRESSION },
    { src: "typeof (a ? b : c)", op: "typeof", exp: T_CONDITIONAL_EXPRESSION },
    { src: "delete (a ? b : c)", op: "delete", exp: T_CONDITIONAL_EXPRESSION },

    { src: "+c(a, b)", op: "+", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "-c(a, b)", op: "-", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "!c(a, b)", op: "!", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "~c(a, b)", op: "~", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "typeof c(a, b)", op: "typeof", exp: T_FUNCTION_INVOCATION_EXPRESSION },
    { src: "delete c(a, b)", op: "delete", exp: T_FUNCTION_INVOCATION_EXPRESSION },

    { src: "+a.b", op: "+", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "-a.b", op: "-", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "!a.b", op: "!", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "~a.b", op: "~", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "typeof a.b", op: "typeof", exp: T_MEMBER_ACCESS_EXPRESSION },
    { src: "delete a.b", op: "delete", exp: T_MEMBER_ACCESS_EXPRESSION },

    { src: "+a[b]", op: "+", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "-a[b]", op: "-", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "!a[b]", op: "!", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "~a[b]", op: "~", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "typeof a[b]", op: "typeof", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
    { src: "delete a[b]", op: "delete", exp: T_CALCULATED_MEMBER_ACCESS_EXPRESSION },
  ];
  unaryCases.forEach((c) => {
    it(`Unary: ${c.src}`, () => {
      // --- Arrange
      const wParser = new Parser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr).not.equal(null);
      if (!expr) return;
      expect(expr.type).equal(T_UNARY_EXPRESSION);
      const unary = expr as UnaryExpression;
      expect(unary.op).equal(c.op);
      expect(unary.expr.type).equal(c.exp);
    });
  });
});
