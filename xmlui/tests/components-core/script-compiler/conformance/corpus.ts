/**
 * The XMLScript conformance corpus.
 *
 * Every entry is executed twice — once by the interpreter, once by the compiler — and
 * both the returned value and the resulting local context must agree. A construct that
 * merely *compiles* is not covered; it has to mean the same thing either way.
 *
 * Cases are written to exercise AST node types, not scenarios. `node-coverage.ts` derives
 * which types each snippet actually reaches by walking its parsed tree, and
 * `coverage.test.ts` fails when a declared type has no case. That is deliberate: the
 * hand-written parity lists this replaces had hundreds of cases and still missed regular
 * expressions, `await` and destructured parameters, because nobody was counting against
 * the language.
 */

export type CorpusCase = {
  name: string;
  /** A binding is an expression; a statement case is an event-handler body. */
  kind: "binding" | "statement";
  source: string;
  context?: Record<string, any>;
  expected?: unknown;
  /**
   * The construct does not compile today. The value is the substring the compiler's
   * refusal must contain, so a case cannot quietly start or stop failing: closing the gap
   * makes this assertion fail, which is the reminder to move the case to `expected`.
   */
  knownFallback?: string;
  /** Both paths must reject it — pinning a language boundary rather than a gap. */
  expectThrows?: true;
};

export const CORPUS: CorpusCase[] = [
  // --- Literals and identifiers ---------------------------------------------------
  { name: "string literal", kind: "binding", source: "'abc'", expected: "abc" },
  { name: "number literal", kind: "binding", source: "42", expected: 42 },
  { name: "boolean literal", kind: "binding", source: "true", expected: true },
  { name: "null literal", kind: "binding", source: "null", expected: null },
  { name: "undefined", kind: "binding", source: "undefined", expected: undefined },
  { name: "NaN and Infinity", kind: "binding", source: "[isNaN(NaN), Infinity]", expected: [true, Infinity] },
  { name: "regexp literal", kind: "binding", source: "text.replace(/ /g, '-')", context: { text: "a b" }, expected: "a-b" },
  { name: "identifier", kind: "binding", source: "value", context: { value: 7 }, expected: 7 },

  // --- Operators -------------------------------------------------------------------
  { name: "unary", kind: "binding", source: "[-n, +n, !flag, ~n, typeof n]", context: { n: 2, flag: false }, expected: [-2, 2, true, -3, "number"] },
  { name: "binary", kind: "binding", source: "a + b * 2 - 1", context: { a: 3, b: 4 }, expected: 10 },
  { name: "comparison and logical", kind: "binding", source: "(a < b) && (a !== b) || false", context: { a: 1, b: 2 }, expected: true },
  { name: "nullish coalescing", kind: "binding", source: "missing ?? 'fallback'", context: {}, expected: "fallback" },
  { name: "conditional", kind: "binding", source: "flag ? 'y' : 'n'", context: { flag: true }, expected: "y" },
  { name: "sequence", kind: "binding", source: "((a = 1), (a + 1))", context: { a: 0 }, expected: 2 },

  // --- Member access, calls, construction ------------------------------------------
  { name: "member access", kind: "binding", source: "obj.a.b", context: { obj: { a: { b: 5 } } }, expected: 5 },
  { name: "calculated member access", kind: "binding", source: "obj[key]", context: { obj: { k: 9 }, key: "k" }, expected: 9 },
  { name: "optional chaining", kind: "binding", source: "obj?.missing?.deep", context: { obj: {} }, expected: undefined },
  { name: "function invocation", kind: "binding", source: "fn(2, 3)", context: { fn: (a: number, b: number) => a * b }, expected: 6 },
  { name: "new expression", kind: "binding", source: "new Date(0).getTime()", expected: 0 },

  // --- Composite literals ----------------------------------------------------------
  { name: "array literal", kind: "binding", source: "[1, 2, 3]", expected: [1, 2, 3] },
  { name: "object literal", kind: "binding", source: "({ a: 1, ['b']: 2 })", expected: { a: 1, b: 2 } },
  { name: "spread in array and object", kind: "binding", source: "[[...xs, 4], { ...o, b: 2 }]", context: { xs: [1], o: { a: 1 } }, expected: [[1, 4], { a: 1, b: 2 }] },
  { name: "spread in a call", kind: "binding", source: "Math.max(...xs)", context: { xs: [1, 5, 3] }, expected: 5 },
  { name: "template literal", kind: "binding", source: "`${a}-${a + 1}`", context: { a: 1 }, expected: "1-2" },

  // --- Arrows ----------------------------------------------------------------------
  { name: "arrow as a callback", kind: "binding", source: "xs.map(x => x * 2)", context: { xs: [1, 2] }, expected: [2, 4] },
  { name: "arrow with a block body", kind: "binding", source: "xs.filter(x => { return x > 1; })", context: { xs: [1, 2] }, expected: [2] },
  { name: "arrow in value position, then called", kind: "binding", source: "({ f: (x) => x + 1 }).f(1)", expected: 2 },
  { name: "destructured arrow parameter", kind: "binding", source: "xs.map(({ id }) => id)", context: { xs: [{ id: 1 }] }, knownFallback: "destructuring pattern" },
  { name: "rest arrow parameter", kind: "binding", source: "call((...a) => a.length)", context: { call: (f: any) => f(1, 2) }, knownFallback: "spread expression" },
  { name: "async arrow", kind: "binding", source: "xs.map(async x => x)", context: { xs: [1] }, knownFallback: "arrow function" },

  // --- Assignment and update -------------------------------------------------------
  { name: "assignment", kind: "statement", source: "n = 5; return n;", context: { n: 0 }, expected: 5 },
  { name: "compound assignment", kind: "statement", source: "n += 2; n *= 3; return n;", context: { n: 1 }, expected: 9 },
  { name: "logical assignment", kind: "statement", source: "a ||= 4; b ??= 5; return [a, b];", context: { a: 0, b: null }, expected: [4, 5] },
  { name: "prefix and postfix", kind: "statement", source: "const before = n++; const after = ++n; return [before, after, n];", context: { n: 1 }, expected: [1, 3, 3] },
  { name: "delete a member", kind: "statement", source: "delete obj.a; return obj;", context: { obj: { a: 1, b: 2 } }, expected: { b: 2 } },
  // --- Neither path accepts this. The interpreter rejects it with "Evaluation of =
  // --- requires a left-hand value", so it is not valid XMLScript that merely fails to
  // --- compile — earlier audits filed it as a compiler gap, and it is not one.
  { name: "destructuring assignment", kind: "statement", source: "[a, b] = pair; return [a, b];", context: { a: 0, b: 0, pair: [1, 2] }, expectThrows: true },

  // --- Declarations ----------------------------------------------------------------
  { name: "let and const", kind: "statement", source: "let a = 1; const b = 2; return a + b;", expected: 3 },
  // --- `var` parses (`T_VAR_STATEMENT`) and is then discarded by both paths: the
  // --- declaration binds nothing and the compiled output does not emit it at all, so
  // --- `var a = 1; return a;` yields `undefined`. The two agree, so this is parity rather
  // --- than a gap — but it is a language wart worth knowing about, and pinning it here
  // --- means a change in either path has to be deliberate.
  { name: "var is a no-op in both paths", kind: "statement", source: "var a = 1; return a;", expected: undefined },
  { name: "object destructuring declaration", kind: "statement", source: "const { a, b: alias } = o; return a + alias;", context: { o: { a: 1, b: 2 } }, expected: 3 },
  { name: "array destructuring declaration", kind: "statement", source: "const [first, [second]] = xs; return first + second;", context: { xs: [1, [2]] }, expected: 3 },
  { name: "function declaration", kind: "statement", source: "function twice(x) { return x * 2; } return twice(3);", expected: 6 },
  { name: "destructured function parameter", kind: "statement", source: "function pick({ a }) { return a; } return pick(o);", context: { o: { a: 1 } }, knownFallback: "destructur" },

  // --- Control flow ----------------------------------------------------------------
  { name: "empty statement", kind: "statement", source: ";; return 1;", expected: 1 },
  { name: "block statement and scoping", kind: "statement", source: "let a = 1; { let a = 2; } return a;", expected: 1 },
  { name: "if / else", kind: "statement", source: "if (n > 1) { return 'hi'; } else { return 'lo'; }", context: { n: 2 }, expected: "hi" },
  { name: "while with break", kind: "statement", source: "let n = 0; while (true) { n++; if (n > 2) break; } return n;", expected: 3 },
  { name: "do-while with continue", kind: "statement", source: "let n = 0; let s = 0; do { n++; if (n === 2) continue; s += n; } while (n < 4); return s;", expected: 8 },
  { name: "for loop", kind: "statement", source: "let s = 0; for (let i = 0; i < 4; i++) { s += i; } return s;", expected: 6 },
  { name: "for-of", kind: "statement", source: "let s = 0; for (const x of xs) { s += x; } return s;", context: { xs: [1, 2, 3] }, expected: 6 },
  { name: "for-in", kind: "statement", source: "let keys = []; for (const k in o) { keys.push(k); } return keys;", context: { o: { a: 1, b: 2 } }, expected: ["a", "b"] },
  { name: "switch with default", kind: "statement", source: "switch (n) { case 1: return 'one'; case 2: return 'two'; default: return 'other'; }", context: { n: 2 }, expected: "two" },
  { name: "try / catch / finally", kind: "statement", source: "let out = ''; try { throw 'x'; } catch (e) { out += e; } finally { out += 'f'; } return out;", expected: "xf" },
  { name: "throw propagates", kind: "statement", source: "throw new Error('boom');", expectThrows: true },

  // --- Language boundaries ---------------------------------------------------------
  // --- `await` parses, but the interpreter rejects it outright: "XMLUI does not support
  // --- the await operator." So it is not valid XMLScript either, and calling it a
  // --- compiler fallback overstated the gap. XMLUI awaits async calls on its own.
  { name: "await", kind: "statement", source: "const v = await load(); return v;", context: { load: () => Promise.resolve(1) }, expectThrows: true },
];
