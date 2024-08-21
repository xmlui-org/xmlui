import { describe, expect, it } from "vitest";
import { resolveIdentifiers } from "@components-core/script-runner-exp/id-resolution";
import { parsePropertyValue } from "@parsers/scripting-exp/property-parsing";
import { Parser } from "@parsers/scripting-exp/Parser";

describe("ID resolution", () => {
  it("PropertyValue does not extend scope", () => {
    // --- Act
    const scope = resolveIdentifiers({ type: "SPV", value: "test" });

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("SingleExpressionValue extends scope", () => {
    // --- Act
    const source = "{myId}";
    const exprValue = parsePropertyValue(source)!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("CompoundExpressionValue extends scope #1", () => {
    // --- Act
    const source = "abc{myId}";
    const exprValue = parsePropertyValue(source)!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("CompoundExpressionValue extends scope #2", () => {
    // --- Act
    const source = "{myId}abc";
    const exprValue = parsePropertyValue(source)!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("CompoundExpressionValue extends scope #3", () => {
    // --- Act
    const source = "{myId}abc{otherId}";
    const exprValue = parsePropertyValue(source)!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect(scope.topLevelNames["myId"]).toBe(true);
    expect(scope.topLevelNames["otherId"]).toBe(true);
  });

  it("Identifier extends scope", () => {
    // --- Act
    const parser = new Parser("myId");
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  const unaryCases = ["!", "-", "+", "~", "typeof", "delete"];
  unaryCases.forEach((c) =>
    it(`Unary op extends scope: ${c}`, () => {
      // --- Act
      const parser = new Parser(`${c} myId`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );

  const binaryCases = [
    "**",
    "*",
    "/",
    "%",
    "+",
    "-",
    "<<",
    ">>",
    ">>>",
    "<",
    "<=",
    ">",
    ">=",
    "==",
    "===",
    "!=",
    "!==",
    "&",
    "|",
    "^",
    "&&",
    "||",
    "??",
    "in",
  ];
  binaryCases.forEach((c) =>
    it(`Binary op extends scope #1: ${c}`, () => {
      // --- Act
      const parser = new Parser(`myId ${c} 123`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );
  binaryCases.forEach((c) =>
    it(`Binary op extends scope #2: ${c}`, () => {
      // --- Act
      const parser = new Parser(`123 ${c} myId`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );

  it("Conditional op extends scope #1", () => {
    // --- Act
    const parser = new Parser(`myId ? 123 : 234`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Conditional op extends scope #2", () => {
    // --- Act
    const parser = new Parser(`123 ? myId : 234`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Conditional op extends scope #3", () => {
    // --- Act
    const parser = new Parser(`123 ? 234 : myId`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Sequence expr extends scope #1", () => {
    // --- Act
    const parser = new Parser(`myId, 123`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Sequence expr extends scope #2", () => {
    // --- Act
    const parser = new Parser(`123, myId`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Function invocation extends scope #1", () => {
    // --- Act
    const parser = new Parser(`myId(123)`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Function invocation extends scope #2", () => {
    // --- Act
    const parser = new Parser(`myId(myArg)`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect(scope.topLevelNames["myId"]).toBe(true);
    expect(scope.topLevelNames["myArg"]).toBe(true);
  });

  it("Member access extends scope #1", () => {
    // --- Act
    const parser = new Parser(`myId.123`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Calculated member access extends scope #1", () => {
    // --- Act
    const parser = new Parser(`myId[123]`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Calculated member access extends scope #2", () => {
    // --- Act
    const parser = new Parser(`myId[myIdx]`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect(scope.topLevelNames["myId"]).toBe(true);
    expect(scope.topLevelNames["myIdx"]).toBe(true);
  });

  it("Array literal extends scope #1", () => {
    // --- Act
    const parser = new Parser(`[myId]`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Array literal extends scope #2", () => {
    // --- Act
    const parser = new Parser(`[myId, myOther]`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect(scope.topLevelNames["myId"]).toBe(true);
    expect(scope.topLevelNames["myOther"]).toBe(true);
  });

  it("Object literal extends scope #1", () => {
    // --- Act
    const parser = new Parser(`{ myId: 123}`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Object literal extends scope #2", () => {
    // --- Act
    const parser = new Parser(`{ myId }`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Object literal extends scope #3", () => {
    // --- Act
    const parser = new Parser(`{ myId: myId }`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Object literal extends scope #4", () => {
    // --- Act
    const parser = new Parser(`{ [123]: myId }`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Object literal extends scope #5", () => {
    // --- Act
    const parser = new Parser(`{ [myId]: 123 }`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Object literal extends scope #6", () => {
    // --- Act
    const parser = new Parser(`{ [myId]: myOther }`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect(scope.topLevelNames["myId"]).toBe(true);
    expect(scope.topLevelNames["myOther"]).toBe(true);
  });

  it("Spread expression extends scope", () => {
    // --- Act
    const parser = new Parser(`...myId`);
    const exprValue = parser.parseExpr()!;
    const scope = resolveIdentifiers(exprValue);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  const asgnCases = [
    "=",
    "+=",
    "-=",
    "**=",
    "*=",
    "/=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "^=",
    "|=",
    "&&=",
    "||=",
    "??=",
  ];
  asgnCases.forEach((c) =>
    it(`Assignment extends scope #1: ${c}`, () => {
      // --- Act
      const parser = new Parser(`myId ${c} 123`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );
  asgnCases.forEach((c) =>
    it(`Assignment extends scope #2: ${c}`, () => {
      // --- Act
      const parser = new Parser(`123 ${c} myId`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );

  const prePostCases = ["++", "--"];
  prePostCases.forEach((c) =>
    it(`Prefix op extends scope #1: ${c}`, () => {
      // --- Act
      const parser = new Parser(`${c}myId`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );

  prePostCases.forEach((c) =>
    it(`Postfix op extends scope #1: ${c}`, () => {
      // --- Act
      const parser = new Parser(`myId${c}`);
      const exprValue = parser.parseExpr()!;
      const scope = resolveIdentifiers(exprValue);

      // --- Assert
      expect(Object.keys(scope.topLevelNames).length).toBe(1);
      expect(scope.topLevelNames["myId"]).toBe(true);
    })
  );

  it("Block extends top scope", () => {
    // --- Act
    const parser = new Parser(`{ let i = myGlobal; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myGlobal"]).toBe(true);
  });

  it("Block covers top scope #1", () => {
    // --- Act
    const parser = new Parser(`
      { 
        const myGlobal = 123;
        { let i = myGlobal; }
      }
      `);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Block covers top scope #2", () => {
    // --- Act
    const parser = new Parser(`
      {
        { 
          const myGlobal = 123;
          { let i = myGlobal; }
        }
      }  
      `);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Block covers top scope #3", () => {
    // --- Act
    const parser = new Parser(`
      {
        let myGlobal = 123;
        { 
          { let i = myGlobal; }
        }
      }  
      `);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Let creates new scope", () => {
    // --- Act
    const parser = new Parser(`let myId`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Let initializer extends scope", () => {
    // --- Act
    const parser = new Parser(`let myId = myGlobal`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myGlobal"]).toBe(true);
  });

  it("Let covers top scope", () => {
    // --- Act
    const parser = new Parser(`let myGlobal; let myId = myGlobal`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Const creates new scope", () => {
    // --- Act
    const parser = new Parser(`const myId = 3`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Const initializer extends scope", () => {
    // --- Act
    const parser = new Parser(`const myId = myGlobal`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myGlobal"]).toBe(true);
  });

  it("Const covers top scope", () => {
    // --- Act
    const parser = new Parser(`let myGlobal; const myId = myGlobal`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Var statements extends scope #1", () => {
    // --- Act
    const parser = new Parser(`var myId = 1`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect((scope.topLevelNames["myId"] as any).type).toBe("IdE");
  });

  it("Var statements extends scope #2", () => {
    // --- Act
    const parser = new Parser(`var myId = myGlobal`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect((scope.topLevelNames["myId"] as any).type).toBe("IdE");
    expect(scope.topLevelNames["myGlobal"]).toBe(true);
  });

  it("Var statements extends scope #2", () => {
    // --- Act
    const parser = new Parser(`var myId = 1, myGlobal = 2`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect((scope.topLevelNames["myId"] as any).type).toBe("IdE");
    expect((scope.topLevelNames["myGlobal"] as any).type).toBe("IdE");
  });

  it("If extends scope #1", () => {
    // --- Act
    const parser = new Parser(`if (myId) 123;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("If extends scope #2", () => {
    // --- Act
    const parser = new Parser(`if (123) myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("If extends scope #3", () => {
    // --- Act
    const parser = new Parser(`if (123) 234; else myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Return extends scope", () => {
    // --- Act
    const parser = new Parser(`return myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("While extends scope #1", () => {
    // --- Act
    const parser = new Parser(`while (myId);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("While extends scope #2", () => {
    // --- Act
    const parser = new Parser(`while (123) myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("While extends scope #3", () => {
    // --- Act
    const parser = new Parser(`while (123) { myId; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Do..While extends scope #1", () => {
    // --- Act
    const parser = new Parser(`do {} while (myId);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Do..While extends scope #2", () => {
    // --- Act
    const parser = new Parser(`do myId; while (123);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Do..While extends scope #3", () => {
    // --- Act
    const parser = new Parser(`do { myId } while (123);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For extends scope #1", () => {
    // --- Act
    const parser = new Parser(`for (myId = 0; 123; 234);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For does not extend scope #1", () => {
    // --- Act
    const parser = new Parser(`for (let myId = 0; 123; 234);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("For extends scope #2", () => {
    // --- Act
    const parser = new Parser(`for (let i = 0; i < myId; i++);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For extends scope #3", () => {
    // --- Act
    const parser = new Parser(`for (let i = 0; i < 100; myId++);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For extends scope #4", () => {
    // --- Act
    const parser = new Parser(`for (let i = 0; i < 100; i++) myId++;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..in extends scope #1", () => {
    // --- Act
    const parser = new Parser(`for (myId in [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect((scope.topLevelNames["myId"] as any).type).toBe("IdE");
  });

  it("For..in does not extend scope #2", () => {
    // --- Act
    const parser = new Parser(`for (let myId in [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("For..in does not extend scope #3", () => {
    // --- Act
    const parser = new Parser(`for (const myId in [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("For..in extends scope #4", () => {
    // --- Act
    const parser = new Parser(`for (let i in myId);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..in extends scope #5", () => {
    // --- Act
    const parser = new Parser(`for (let i in [123, 234]) myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..in extends scope #6", () => {
    // --- Act
    const parser = new Parser(`for (let i in [123, 234]) { myId; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..of extends scope #1", () => {
    // --- Act
    const parser = new Parser(`for (myId of [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect((scope.topLevelNames["myId"] as any).type).toBe("IdE");
  });

  it("For..of does not extend scope #2", () => {
    // --- Act
    const parser = new Parser(`for (let myId of [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("For..of does not extend scope #3", () => {
    // --- Act
    const parser = new Parser(`for (const myId of [123, 456]);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("For..of extends scope #4", () => {
    // --- Act
    const parser = new Parser(`for (let i of myId);`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..of extends scope #5", () => {
    // --- Act
    const parser = new Parser(`for (let i of [123, 234]) myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("For..of extends scope #6", () => {
    // --- Act
    const parser = new Parser(`for (let i of [123, 234]) { myId; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Switch extends scope #1", () => {
    // --- Act
    const parser = new Parser(`switch (myId) { case 123: break; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Switch extends scope #2", () => {
    // --- Act
    const parser = new Parser(`switch (123) { case myId: break; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Switch extends scope #3", () => {
    // --- Act
    const parser = new Parser(`switch (123) { case 123: myId; break; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Switch extends scope #4", () => {
    // --- Act
    const parser = new Parser(`switch (123) { case 123: break; default: myId; break; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Throw extends scope", () => {
    // --- Act
    const parser = new Parser(`throw myId;`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Try extends scope #1", () => {
    // --- Act
    const parser = new Parser(`try { myId; } catch (e) { 123; } finally { 234; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Try extends scope #2", () => {
    // --- Act
    const parser = new Parser(`try { 123; } catch (e) { myId; } finally { 234; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Try extends scope #3", () => {
    // --- Act
    const parser = new Parser(`try { 123; } catch (e) { 123; } finally { myId; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Try does not extend scope #4", () => {
    // --- Act
    const parser = new Parser(`try { 123; } catch (myId) { 123; } finally { 234; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Function id extends scope #1", () => {
    // --- Act
    const parser = new Parser(`function myFunc() {}`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect((scope.topLevelNames["myFunc"] as any).type).toBe("FuncD");
  });

  it("Function arg does not extend scope #2", () => {
    // --- Act
    const parser = new Parser(`function myFunc(myId) {}`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect((scope.topLevelNames["myFunc"] as any).type).toBe("FuncD");
  });

  it("Function body extends scope #3", () => {
    // --- Act
    const parser = new Parser(`function myFunc(myId) { myOther; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(2);
    expect((scope.topLevelNames["myFunc"] as any).type).toBe("FuncD");
    expect(scope.topLevelNames["myOther"]).toBe(true);
  });

  it("Import extends scope #1", () => {
    // --- Act
    const parser = new Parser(`import { myId } from "module";`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myId"]).toBe(true);
  });

  it("Import extends scope #2", () => {
    // --- Act
    const parser = new Parser(`import { myId as myAlias } from "module";`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myAlias"]).toBe(true);
  });

  it("Arrow arg does not extend scope #1", () => {
    // --- Act
    const parser = new Parser(`(myId) => {}`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(0);
  });

  it("Arrow body extends scope #2", () => {
    // --- Act
    const parser = new Parser(`(myId) => { myOther; }`);
    const stmts = parser.parseStatements()!;
    const scope = resolveIdentifiers(stmts);

    // --- Assert
    expect(Object.keys(scope.topLevelNames).length).toBe(1);
    expect(scope.topLevelNames["myOther"]).toBe(true);
  });
});
