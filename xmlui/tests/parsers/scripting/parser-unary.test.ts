import { describe, expect, it } from "vitest";

import { Parser } from "@parsers/scripting/Parser";
import { UnaryExpression } from "@abstractions/scripting/ScriptingSourceTree";

describe("Parser - unary expressions", () => {
  const unaryCases = [
    { src: "+a", op: "+", exp: "IdE" },
    { src: "-a", op: "-", exp: "IdE" },
    { src: "!a", op: "!", exp: "IdE" },
    { src: "~a", op: "~", exp: "IdE" },
    { src: "typeof a", op: "typeof", exp: "IdE" },
    { src: "delete a", op: "delete", exp: "IdE" },

    { src: "+3", op: "+", exp: "LitE" },
    { src: "-3.14", op: "-", exp: "LitE" },
    { src: "!0b1111", op: "!", exp: "LitE" },
    { src: "~0xa123", op: "~", exp: "LitE" },
    { src: "typeof \"abc\"", op: "typeof", exp: "LitE" },
    { src: "delete \"abc\"", op: "delete", exp: "LitE" },

    { src: "+!a", op: "+", exp: "UnaryE" },
    { src: "-!a", op: "-", exp: "UnaryE" },
    { src: "!!a", op: "!", exp: "UnaryE" },
    { src: "~!a", op: "~", exp: "UnaryE" },
    { src: "typeof !a", op: "typeof", exp: "UnaryE" },
    { src: "delete !a", op: "delete", exp: "UnaryE" },

    { src: "+(a+b)", op: "+", exp: "BinaryE" },
    { src: "-(a+b)", op: "-", exp: "BinaryE" },
    { src: "!(a+b)", op: "!", exp: "BinaryE" },
    { src: "~(a+b)", op: "~", exp: "BinaryE" },
    { src: "typeof (a+b)", op: "typeof", exp: "BinaryE" },
    { src: "delete (a+b)", op: "delete", exp: "BinaryE" },

    { src: "+(a, b)", op: "+", exp: "SeqE" },
    { src: "-(a, b)", op: "-", exp: "SeqE" },
    { src: "!(a, b)", op: "!", exp: "SeqE" },
    { src: "~(a, b)", op: "~", exp: "SeqE" },
    { src: "typeof (a, b)", op: "typeof", exp: "SeqE" },
    { src: "delete (a, b)", op: "delete", exp: "SeqE" },

    { src: "+(a ? b : c)", op: "+", exp: "CondE" },
    { src: "-(a ? b : c)", op: "-", exp: "CondE" },
    { src: "!(a ? b : c)", op: "!", exp: "CondE" },
    { src: "~(a ? b : c)", op: "~", exp: "CondE" },
    { src: "typeof (a ? b : c)", op: "typeof", exp: "CondE" },
    { src: "delete (a ? b : c)", op: "delete", exp: "CondE" },

    { src: "+c(a, b)", op: "+", exp: "InvokeE" },
    { src: "-c(a, b)", op: "-", exp: "InvokeE" },
    { src: "!c(a, b)", op: "!", exp: "InvokeE" },
    { src: "~c(a, b)", op: "~", exp: "InvokeE" },
    { src: "typeof c(a, b)", op: "typeof", exp: "InvokeE" },
    { src: "delete c(a, b)", op: "delete", exp: "InvokeE" },

    { src: "+a.b", op: "+", exp: "MembE" },
    { src: "-a.b", op: "-", exp: "MembE" },
    { src: "!a.b", op: "!", exp: "MembE" },
    { src: "~a.b", op: "~", exp: "MembE" },
    { src: "typeof a.b", op: "typeof", exp: "MembE" },
    { src: "delete a.b", op: "delete", exp: "MembE" },

    { src: "+a[b]", op: "+", exp: "CMembE" },
    { src: "-a[b]", op: "-", exp: "CMembE" },
    { src: "!a[b]", op: "!", exp: "CMembE" },
    { src: "~a[b]", op: "~", exp: "CMembE" },
    { src: "typeof a[b]", op: "typeof", exp: "CMembE" },
    { src: "delete a[b]", op: "delete", exp: "CMembE" },
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
      expect(expr.type).equal("UnaryE");
      const unary = expr as UnaryExpression;
      expect(unary.operator).equal(c.op);
      expect(unary.operand.type).equal(c.exp);
      expect(unary.source).equal(c.src);
    });
  });
});
