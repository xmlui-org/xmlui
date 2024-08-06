import { describe, expect, it } from "vitest";
import { resolveIdentifiers } from "@parsers/scripting-exp/id-resolution";
import { Parser } from "@parsers/scripting-exp/Parser";
import { ResolutionScope } from "@parsers/scripting-exp/ResolutionScope";

describe("Dependency resolution", () => {
  const stmtCases = [
    { src: "var v1 = x", exp: { v1: ["x"]} },
    { src: "var v1 = x; var v2 = v1;", exp: { v1: ["x"]} },
    { src: "var v1 = x; var v2 = y;", exp: { v1: ["x"], v2: ["y"]} },
    { src: "function v1() {x}; var v2 = y;", exp: { v1: ["x"], v2: ["y"]} },
    { src: "function v1() {x}; function v2() { let x; y = x;}", exp: { v1: ["x"], v2: []} },
    { src: "function v1() {x}; function v2() { let x; y;}", exp: { v1: ["x"], v2: ["y"]} },
    { src: "var v1 = x.push(a)", exp: { v1: ["a", "x"]} },
    { src: "var v1 = x.push(123)", exp: { v1: ["x"]} },
  ];

  stmtCases.forEach((c) => {
    it(`Resolve dependencies for ${c.src}`, () => {
      const dps = collectDependencies(c.src);
      Object.keys(c.exp).forEach((key) => {
        expect(dps.topLevelDeps[key]).deep.equal((c.exp as { [key: string]: string[] })[key]);
      });
    });
  });
});


function collectDependencies(source: string, referenceTrackedApi: Record<string, any> = {}): ResolutionScope {
  const parser = new Parser(source);
  const stmts = parser.parseStatements();
  return resolveIdentifiers(stmts!, referenceTrackedApi);
}
