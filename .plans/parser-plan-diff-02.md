# Parser Plan Diff 02

## Prompt

Continue with Steps 1 and 2 after taking the parser-plan snapshot.

## Edits

- Added parser source primitives, diagnostics, token types, markup token kinds,
  and scanner-only tokenization.
- Added source primitive and markup scanner tests.
- Marked Steps 1 and 2 complete.

## Prompt

Continue with Steps 3 and 4.

## Edits

- Hardened markup scanner diagnostics for unknown characters, unterminated
  strings, and unterminated comments.
- Added concrete syntax tree utilities, debug output, text lookup, and
  `findTokenAtOffset`.
- Added scanner diagnostics and syntax-node tests.
- Marked Steps 3 and 4 complete.

## Prompt

Continue with Steps 5 and 6.

## Edits

- Added the markup parser happy path for nested elements, self-closing
  elements, attributes, text nodes, comments, and trivia.
- Added parser recovery for missing closing tags, mismatched tags, missing
  attribute names, missing equals signs, and missing attribute values.
- Added markup parser tests.
- Marked Steps 5 and 6 complete.

## Prompt

Continue with Step 7.

## Edits

- Added script token kinds and scanner-only tokenization.
- Added source-span mapping from embedded script ranges back to containing
  `.xmlui` files.
- Added script scanner tests for initial expressions and event handlers.
- Marked Step 7 complete.

## Prompt

Continue with Steps 8 and 9.

## Edits

- Added the script AST model and expression parser.
- Added event-handler parsing as statement lists.
- Added AST source spans, diagnostics, cursor lookup, and parser tests.
- Marked Steps 8 and 9 complete.

## Prompt

Continue with Steps 10 and 11.

## Edits

- Added mixed text segmentation with embedded expression parsing.
- Replaced the old ad hoc XMLUI compiler parser internals with the new
  markup-parse-plus-transform pipeline.
- Preserved runtime-facing strings while attaching parsed expression and event
  metadata.
- Added mixed text and transform integration tests.
- Marked Steps 10 and 11 complete.

## Prompt

Complete the parser implementation.

## Edits

- Routed compiler module source IDs through the parser pipeline.
- Added parser-core LSP adapters for semantic tokens, diagnostics, and cursor
  context.
- Added compile integration, LSP adapter, and compatibility hardening tests.
- Marked Steps 12, 13, and 14 complete.
