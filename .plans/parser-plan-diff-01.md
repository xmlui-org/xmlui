# Parser Plan Diff 01

## Prompt

Return to the parser plan. Review how the original project's parser works with
an input stream, lexer, and parser. Use a similar architecture, limited to the
parts required by the initial experiment. Ensure the parser can directly support
future LSP work for the VS Code extension without requiring a new parser or a
significant architectural change. Make sure all parser additions are unit
tested.

## Edits

- Added original-parser findings covering `createScanner`, `createXmlUiParser`,
  `SyntaxKind`, `Node`, `findTokenAtOffset`, `nodeToComponentDef`, and existing
  language-server consumers.
- Defined a small but extensible parser pipeline: input stream, markup scanner,
  markup parser, XMLUI transform, source ranges, diagnostics, and token lookup.
- Added LSP-readiness requirements and initial scanner/parser/transform test
  expectations.

## Prompt

Clarifications: move toward a fully fledged XMLUI parser, including XMLUI
markup and XMLUI expression/event-handler parsing. Use a source-location shape
that supports large XMLUI apps with many source files. Keep mixed text close to
the current project representation unless there is a better framework design.
Support LSP from the beginning.

## Edits

- Reframed the plan as a parser family covering markup, embedded expressions,
  and event handlers.
- Added `SourceSpan` as the canonical range shape for multi-file apps and
  future source maps.
- Added script lexer/parser scope, embedded diagnostics mapping, and mixed text
  segmentation rules.
- Converted open questions into recorded decisions.

## Prompt

Split the parser-plan work into smaller steps that can be implemented
separately.

## Edits

- Added a fourteen-step implementation roadmap, each with a separately
  testable scope.
- Ordered the work from shared source primitives through markup scanning,
  markup parsing, script scanning/parsing, mixed text, transform integration,
  Vite integration, LSP adapters, and compatibility hardening.
