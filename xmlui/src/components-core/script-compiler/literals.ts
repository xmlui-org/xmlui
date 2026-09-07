/**
 * Rendering literals into generated JavaScript.
 *
 * The parser is the only producer of literal values, and the only non-primitive it
 * produces is a `RegExp` (`Parser.parseRegExpLiteral`). Everything else is a string,
 * number, bigint, boolean, `null` or `undefined`.
 *
 * That one exception used to go through `JSON.stringify`, which renders a regular
 * expression as `{}` — so `text.replace(/ /g, "-")` compiled to a call with an empty
 * object as its pattern and quietly returned the text unchanged. Wrong answers, no error,
 * no fallback marker: the compiler reported success. Both targets now render regular
 * expressions as real ones.
 */

/** True for values `JSON.stringify` round-trips faithfully. A `RegExp` does not. */
export function isJsonSerializableLiteral(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    typeof value === "boolean" ||
    typeof value === "undefined"
  );
}

/**
 * A regular expression as a JavaScript expression that rebuilds it.
 *
 * `new RegExp(...)` rather than a `/.../` literal: the pattern needs no re-escaping of
 * delimiters, and an empty pattern has no literal spelling at all, since `//` starts a
 * comment.
 *
 * Each evaluation builds a fresh instance, which is what a regular expression literal
 * does in JavaScript. That matters for `g` and `y` patterns, whose `lastIndex` would
 * otherwise carry from one evaluation to the next.
 */
export function regExpToJs(value: RegExp): string {
  return `new RegExp(${JSON.stringify(value.source)}, ${JSON.stringify(value.flags)})`;
}

/**
 * Serializes an AST node as a JavaScript object literal for embedding in generated code.
 *
 * The lazy-arrow paths in both targets emit an arrow's AST inline so the interpreter can
 * walk it later. The destination is JavaScript source, not JSON, so a regular expression
 * can be written as an expression that rebuilds it — no marker left in the data, no
 * reviver, and no change to how the interpreter reads a literal.
 *
 * `JSON.stringify` still does the work, so escaping, key ordering and `undefined`
 * handling are unchanged; regular expressions are routed through a placeholder that is
 * chosen only after checking it appears nowhere in the node's own serialized form, so it
 * cannot collide with string data in the script being compiled.
 */
export function serializeAstForJs(node: unknown): string {
  const plain = JSON.stringify(node);
  if (plain === undefined || !plain.includes("{}")) {
    // --- No `{}` anywhere means no RegExp was flattened, and nothing else in an AST
    // --- serializes to one. Skip the second pass.
    return plain;
  }
  const token = createUniqueToken(plain);
  const found: RegExp[] = [];
  let json = JSON.stringify(node, (_key, value) =>
    value instanceof RegExp ? `${token}${found.push(value) - 1}` : value,
  );
  // --- Plain string substitution, not a pattern: the marker is arbitrary text and would
  // --- otherwise have to be escaped for use as one. Each marker occurs exactly once.
  for (let index = 0; index < found.length; index++) {
    json = json.split(`"${token}${index}"`).join(regExpToJs(found[index]));
  }
  return json;
}

/** A marker the serialized node provably does not already contain. */
function createUniqueToken(serialized: string): string {
  let token = "$xmluiRegExp$";
  while (serialized.includes(token)) {
    token += "$";
  }
  return token;
}
