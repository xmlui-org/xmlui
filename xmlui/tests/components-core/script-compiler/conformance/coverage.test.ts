import { describe, expect, it } from "vitest";

import { CORPUS } from "./corpus";
import {
  collectLiteralKinds,
  collectNodeTypes,
  readNodeTypeUniverse,
} from "./node-coverage";
import { Parser } from "../../../../src/parsers/scripting/Parser";

/**
 * Coverage measured against the language, not counted in cases.
 *
 * The hand-written parity lists this corpus replaces had hundreds of cases and still
 * missed regular expressions, `await` and destructured parameters — because nothing
 * compared them to the set of node types XMLScript declares. This test does, and fails
 * with the names of anything unreached.
 */
const UNIVERSE = readNodeTypeUniverse();

/**
 * Node types no corpus case can reach, each with the reason. A type may only sit here if
 * it is unreachable by construction — not merely untested.
 */
const UNREACHABLE: Record<string, string> = {
  T_IMPORT_DECLARATION: "module-level only; never appears in the statement lists handed to a compiler target",
  T_IMPORT_SPECIFIER: "part of an import declaration, same reason",
  T_ARROW_EXPRESSION_STATEMENT: "synthesized wrapper around a handler; not a construct anyone writes",
  T_NO_ARG_EXPRESSION: "comma elision and bare `()`; the parser rejects every position that would produce one",
  T_ASYNC_FUNCTION_DECLARATION: "`async function` is rejected by the parser, so it never reaches an AST a case could carry",
};

function parsedTrees() {
  return CORPUS.map((entry) => {
    const parser = new Parser(entry.source);
    return entry.kind === "binding" ? parser.parseExpr() : parser.parseStatements();
  });
}

function coveredNodeTypes(): Set<number> {
  const covered = new Set<number>();
  for (const entry of CORPUS) {
    const parser = new Parser(entry.source);
    const tree = entry.kind === "binding" ? parser.parseExpr() : parser.parseStatements();
    collectNodeTypes(tree, covered);
  }
  return covered;
}

describe("conformance coverage", () => {
  it("reaches every node type XMLScript declares", () => {
    const covered = coveredNodeTypes();
    const missing = [...UNIVERSE.entries()]
      .filter(([type, name]) => !covered.has(type) && !(name in UNREACHABLE))
      .map(([, name]) => name)
      .sort();

    expect(missing).toEqual([]);
  });

  it("only excuses node types that are unreachable by construction", () => {
    // --- Guards the exclusion list against becoming a dumping ground: if a case starts
    // --- covering an excused type, the excuse has to go.
    const covered = coveredNodeTypes();
    const wronglyExcused = Object.keys(UNREACHABLE).filter((name) => {
      const entry = [...UNIVERSE.entries()].find(([, candidate]) => candidate === name);
      return entry ? covered.has(entry[0]) : false;
    });

    expect(wronglyExcused).toEqual([]);
  });

  it("names every excused type, so the list stays a decision and not an oversight", () => {
    for (const name of Object.keys(UNREACHABLE)) {
      expect([...UNIVERSE.values()]).toContain(name);
      expect(UNREACHABLE[name].length).toBeGreaterThan(20);
    }
  });

  /**
   * The second axis. A `T_LITERAL` can carry a string, a number, a boolean, `null`,
   * `undefined` or a regular expression, and the compiler treats the last one completely
   * differently from the rest. Node-type coverage cannot tell them apart — verified:
   * deleting the regex case from the corpus loses no node-type coverage whatsoever — so
   * the miscompile that started this work would have slipped through a corpus that only
   * measured the grammar.
   */
  it("exercises every kind of value a literal can carry", () => {
    const covered = new Set<string>();
    parsedTrees().forEach((tree) => collectLiteralKinds(tree, covered));

    expect([...covered].sort()).toEqual(
      ["boolean", "null", "number", "regexp", "string", "undefined"].sort(),
    );
  });
});
