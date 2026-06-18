# XMLUI Parser Plan

Status: direction set  
Parent plan: `.plans/master-plan.md`, section `3. Markup Parser`

## Scope

The parser work should move toward a fully fledged XMLUI parser family. This
includes XMLUI markup plus embedded XMLUI expressions and event handlers. The
first implementation should still cover only what the initial Vite dev-server
examples require, but the architecture must be the architecture we can keep as
the parser grows.

The parser is not just a compiler front end: it must also be the future
language-server front end, so the VS Code extension should be able to reuse the
same scanners, syntax trees, diagnostics, source-location helpers, and token
classification without a significant redesign.

Required now:

- parse enough XML to handle elements, attributes, comments, self-closing tags,
  text nodes, and nested children;
- preserve source locations for elements, attributes, text, expressions, and
  event handlers;
- understand the special root tags `<App>` and `<Component>`;
- split attributes by prefix:
  - normal props;
  - `var.*` local variables;
  - `global.*` global variables;
  - `on*` event handlers;
- parse text nodes with mixed literal text and `{expression}` segments.

Old XMLUI source to learn from:

- `InputStream`: tracks absolute position, line, and column while exposing
  `peek`, lookahead, `get`, and source slicing;
- `createScanner`: reads the source, emits XMLUI tokens, keeps token start/end
  positions and token values, and reports scanner diagnostics;
- `createXmlUiParser` / `parseXmlUiMarkup`: drives the scanner with a small
  recursive parser, builds a syntax tree, records recoverable diagnostics, and
  creates error nodes instead of throwing on ordinary syntax errors;
- `SyntaxKind`: uses one shared enum for trivia, tokens, and syntax nodes;
- `Node`: stores `start`, `pos`, `end`, optional leading trivia, children, and
  helper methods such as `findTokenAtOffset`;
- `findTokenAtOffset`: lets editor services answer "what token is under or
  before the cursor?";
- `nodeToComponentDef`: transforms the syntax tree into runtime component
  definitions after parsing;
- scripting `Lexer` and `Parser`: parse expressions and event handler statements
  from an input stream, preserve token positions, and attach start/end tokens to
  script AST nodes;
- existing language-server services: completion, hover, definition, folding,
  formatting, and diagnostics all consume the parser tree and token lookup
  helpers.

Use the same shape of architecture, but not the full surface area. The first
implementation should be a deliberately small pipeline:

1. `InputStream`
   - Owns the source text and cursor.
   - Supports `peek`, `advance`, `slice`, `eof`, and absolute offsets.
   - Keeps line/column mapping available through a source map helper, but the
     parser itself should store source IDs plus absolute offsets.

2. `MarkupLexer` / `MarkupScanner`
   - Emits a `Token` with `kind`, `start`, `pos`, `end`, and optional `value`.
   - Preserves trivia as trivia tokens rather than discarding it permanently.
   - Has a scanner-only mode so syntax highlighting can tokenize a document
     without requiring a successful parse.
   - Reports unterminated strings/comments and unknown characters as
     diagnostics with source ranges.
   - Emits token classifications suitable for LSP from the beginning, while
     keeping them as parser-native token metadata rather than hard-wiring the
     parser to a VS Code-specific protocol shape.

3. `MarkupParser`
   - Consumes scanner tokens and builds a concrete syntax tree.
   - Produces `ParseResult { node, diagnostics }`.
   - Recovers from common malformed XML so editor services can still work on
     incomplete documents.
   - Creates nodes for elements, tag names, attribute lists, attributes,
     attribute keys, text, comments/trivia, content lists, and error spans.

4. `ScriptLexer` / `ScriptParser`
   - Parses embedded XMLUI expressions and event handlers instead of treating
     them as opaque strings.
   - Supports both expression mode and statement/event-handler mode.
   - Accepts an origin span from the markup parser so diagnostics and source
     maps can point back into the containing `.xmlui` file.
   - Preserves script token ranges and node ranges for compiler transforms,
     LSP semantic tokens, hover, diagnostics, and later debugging.
   - Initially needs only the expression/event features used by the counter
     examples, such as literals, identifiers, member access, logical operators,
     postfix increment, and expression statements.

5. XMLUI transform
   - Converts the concrete syntax tree into the current experiment's runtime IR.
   - Splits attributes into props, `var.*`, `global.*`, and `on*` handlers.
   - Parses mixed text into literal and expression segments for rendering.
   - Handles `<App>` and `<Component>` as document-level XMLUI concepts.

Initial token and node set:

- trivia: whitespace, newline, comments;
- tokens: identifier, `<`, `</`, `>`, `/>`, `=`, `.`, quoted string, text,
  end-of-file, unknown;
- syntax nodes: document/content list, element, tag name, attribute list,
  attribute, attribute key, text, error.

The `.` token is enough for `var.count` and `global.count`. Namespace `:` can
wait until an experiment requires it, but the tree shape should not make it
hard to add later.

Initial script token and node set:

- tokens: identifiers, numeric and string literals, `true`, `false`, `null`,
  `undefined`, `$`, `.`, `(`, `)`, `[`, `]`, `{`, `}`, `,`, `;`, `:`, `?`,
  `||`, `&&`, `!`, `=`, `++`, and end-of-file;
- expression nodes: identifier, literal, member access, function invocation,
  unary/prefix/postfix operator, binary/logical expression, conditional
  expression if needed by tests;
- statement nodes: expression statement and statement list.

Script grammar should expand in increments, but it should already be a real
parser with its own scanner, AST, diagnostics, and tests.

Simplify for this experiment:

- no `<property>` helper tag;
- no `<event>` helper tag;
- no `<variable>` helper tag;
- no `<global>` helper tag;
- no `<Slot>`;
- no CDATA;
- no namespaces;
- no loaders;
- no `when`;
- no responsive props;
- no layout props;
- no full parser-level diagnostic catalog beyond clear syntax failures needed
  for the examples.

## Language-Server Contract

The parser must be LSP-ready even before the VS Code extension exists.

Required parser contracts:

- `SourceSpan` is the canonical range representation:
  `sourceId`, `start`, `end`, optional `line`, `column`, and optional generated
  mapping metadata;
- offsets are always local to the referenced source file so large apps with many
  `.xmlui` files do not need a single global coordinate space;
- every token and node has stable `start`, `pos`, and `end` positions;
- leading trivia is preserved enough for formatting, folding, and comments;
- `getText(node)` or an equivalent source-slice helper is available;
- `findTokenAtOffset(root, offset)` returns the chain under the cursor and, when
  the cursor is between tokens, the chain before the cursor;
- diagnostics include a stable code, message, `pos`, `end`, and optional context
  range;
- ordinary syntax errors return a partial tree plus diagnostics instead of
  throwing;
- scanner-only tokenization remains available for syntax highlighting and
  semantic token support;
- embedded expression/event ASTs keep their own token lookup and source spans,
  mapped back to the markup attribute value or text expression segment that
  contains them.

This keeps the future LSP work incremental:

- syntax highlighting can start from scanner tokens;
- diagnostics can start from parser diagnostics;
- completion and hover can use `findTokenAtOffset`;
- expression completion, hover, and diagnostics can use embedded script ASTs;
- folding and formatting can use the concrete syntax tree and trivia;
- definition/navigation can later use the same parse tree plus component-module
  resolution.

## Mixed Text Representation

Mixed text should stay close to the current XMLUI behavior unless a later
experiment proves a better representation. The markup parser should preserve the
raw text node and source span. The XMLUI transform should derive a mixed value
representation from that raw text:

- literal text segments keep their original text and span;
- `{expression}` segments keep the full span including braces and an inner
  expression span excluding braces;
- the inner expression is parsed by `ScriptParser` in expression mode;
- transform output can expose a compact value shape for runtime rendering while
  retaining debug/source metadata for diagnostics, source maps, and LSP.

This mirrors the current transform-oriented model, but makes expression segments
first-class enough for compilation and editor features.

## Implementation Steps

Each step should be independently implementable and should leave the project in
a working state. A step is complete only when its focused unit tests pass and
the existing parser/runtime tests still pass.

1. Parser package layout and shared source primitives — completed
   - Create the parser module structure under the `xmlui` package.
   - Add shared `SourceId`, `SourceSpan`, diagnostic, token, and text-source
     types.
   - Add an `InputStream` with absolute offsets, line/column lookup, `peek`,
     lookahead, `advance`, `slice`, and EOF handling.
   - Tests: source slicing, offset movement, line/column lookup, EOF behavior,
     and multi-source span creation.

2. Markup token kinds and scanner-only API — completed
   - Define the initial markup `SyntaxKind` / token kind set.
   - Implement `MarkupScanner.scan()` and a scanner-only `tokenizeMarkup()`
     helper.
   - Preserve trivia tokens and comments.
   - Attach parser-native LSP classification metadata to tokens.
   - Tests: tokenization of the three counter examples, trivia/comment
     preservation, string values, token spans, and syntax-highlighting
     classifications.

3. Markup scanner diagnostics — completed
   - Report unknown characters, unterminated strings, and unterminated comments
     as diagnostics instead of throwing.
   - Keep tokenization useful after an error when possible.
   - Tests: malformed examples produce stable diagnostic codes and ranges while
     still returning tokens.

4. Concrete syntax tree model — completed
   - Add syntax node types for document/content list, element, tag name,
     attribute list, attribute, attribute key, text, trivia/comment attachment,
     and error spans.
   - Add `getText(node)` and tree debug helpers.
   - Add `findTokenAtOffset(root, offset)` with chain-under-cursor and
     chain-before-cursor results.
   - Tests: node range invariants, text slicing, debug output snapshots if
     useful, and token lookup inside and between tokens.

5. Markup parser happy path — completed
   - Parse nested elements, self-closing elements, attributes, text nodes, and
     comments/trivia into the concrete syntax tree.
   - Enforce a single document root only as far as the initial examples need.
   - Tests: tree shape and source ranges for local counter, component counter,
     global-shadowing counter, and small self-closing/comment cases.

6. Markup parser recovery — completed
   - Add recovery for missing closing tags, mismatched tag names, missing
     attribute names, missing `=`, and missing attribute values.
   - Insert error nodes where useful for editor features.
   - Tests: each recovery case returns a partial tree, stable diagnostics, and
     useful token lookup near the error.

7. Script token kinds and scanner-only API — completed
   - Define the initial script token set needed by expressions and event
     handlers in the examples.
   - Implement `ScriptScanner` and `tokenizeScript()` with source spans mapped
     to the containing `.xmlui` span.
   - Attach parser-native LSP classification metadata to script tokens.
   - Tests: tokenization and classification for `{0}`, `{count}`,
     `{$props.label || 'Click to increment'}`, and `count++`.

8. Script expression parser — completed
   - Implement expression mode for literals, identifiers, `$`-prefixed names,
     member access, calls, unary operators, logical/binary operators, postfix
     increment, and grouping.
   - Keep AST node spans and token lookup data.
   - Tests: AST shape, precedence, source spans, and diagnostics for malformed
     expressions.

9. Script event-handler parser — completed
   - Implement statement/event-handler mode with expression statements and
     statement lists.
   - Keep the door open for later statements without adding them now.
   - Tests: `count++` parses as an event-handler statement list, and malformed
     event handlers map diagnostics back to the containing attribute value.

10. Mixed text segmentation — completed
    - Derive literal and `{expression}` segments from raw text nodes.
    - Parse expression segments with `ScriptParser` expression mode.
    - Preserve both the full brace span and the inner expression span.
    - Tests: literal-only text, expression-only text, mixed text before/after an
      expression, multiple expressions, and malformed expression diagnostics.

11. XMLUI transform integration — completed
    - Replace the current ad hoc `parseXmlui` internals with
      markup-parse-plus-transform.
    - Preserve the existing runtime-facing IR for the initial examples.
    - Split attributes into props, `var.*`, `global.*`, and `on*` handlers.
    - Attach parsed expression/event ASTs or compiled-ready placeholders where
      runtime code will need them.
    - Tests: existing public parser tests remain almost unchanged, with added
      assertions for source metadata where helpful.

12. Vite plugin and dev-server integration — completed
    - Route `.xmlui` module loading through the new parser pipeline.
    - Ensure diagnostics surface clearly during dev builds.
    - Keep source IDs stable for `Main.xmlui` and user-defined component files.
    - Tests: unit tests for compile integration and existing E2E counter tests.

13. LSP readiness adapters — completed
    - Add parser-core adapters for semantic-token data, diagnostics, and
      cursor lookup without creating the VS Code extension.
    - Keep adapters protocol-shaped but not extension-specific.
    - Tests: semantic token classification snapshots, diagnostic range mapping,
      and cursor lookup across markup and embedded script regions.

14. Compatibility hardening for the first parser slice — completed
    - Compare behavior against old XMLUI parser cases that overlap the initial
      experiment.
    - Add regression tests for any discovered differences that should remain
      compatible.
    - Document intentionally omitted old-parser features in this plan before
      moving to the next experiment.

## Test Requirements

Every parser capability added for the experiment must be covered by unit tests.
Tests should be introduced alongside the feature, not after the parser grows.

Required first tests:

- scanner tokenizes the three counter examples with stable token kinds and
  offsets;
- scanner exposes token classifications suitable for LSP syntax highlighting;
- scanner preserves trivia and comments;
- scanner reports unterminated quoted strings and comments without crashing;
- parser builds a concrete syntax tree for nested elements, self-closing
  elements, attributes, text nodes, and comments/trivia;
- parser records source ranges for tag names, attribute keys, attribute values,
  text, expression-bearing text, and event-handler values;
- parser recovers from missing closing tags, missing attribute values, and tag
  name mismatches with partial trees and diagnostics;
- `findTokenAtOffset` works inside a tag name, inside an attribute name, inside
  an attribute value, in text, and between tokens;
- script scanner tokenizes the expressions and event handlers used in the
  initial examples;
- script parser parses `{0}`, `{count}`, `{$props.label || 'Click to increment'}`,
  and `count++` with stable source spans;
- embedded script diagnostics map back to their containing `.xmlui` source
  ranges;
- transform converts the syntax tree into the existing experiment IR for the
  local counter, component counter, and global-shadowing counter examples.

Existing unit tests can keep their public assertions, but their implementation
should move from the current single-pass parser toward this scanner/parser/
transform pipeline. Add dedicated scanner/parser tests before broadening the
runtime behavior.

## Migration Notes

The current experimental `parseXmlui` implementation is acceptable as a
bootstrap, but it should not be expanded as an ad hoc parser. The next parser
work should replace or refactor it into the layered architecture above, while
keeping the same runtime-facing parse results for the current examples.

The old XMLUI parser contains many features we intentionally leave out now:
namespaces, helper tags, CDATA, script nodes, reusable-component contract
declarations, compound component validation, responsive props, and many
diagnostic codes. Those should return only when an experiment needs them.

## Decisions

- Move toward a full XMLUI parser family, including markup, expressions, and
  event handlers.
- Use source spans that scale to many files and can later map generated code
  back to original `.xmlui` sources.
- Keep mixed text close to the current transform model: preserve raw text, then
  derive literal and expression segments with spans.
- Support LSP from the beginning with scanner token classifications and reusable
  syntax trees, while keeping protocol adapters outside the parser core.
