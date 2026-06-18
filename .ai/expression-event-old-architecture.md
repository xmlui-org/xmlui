# Expression and Event Parsing: Old XMLUI Findings

Source baseline: `/Users/dotneteer/source/xmlui`

## Scripting Parser

- The old scripting parser is implemented in
  `/Users/dotneteer/source/xmlui/xmlui/src/parsers/scripting/Parser.ts`.
- It is a real JavaScript-like parser over a lexer and input stream, not a
  string-evaluation shortcut.
- It parses both expressions and statement lists, with a broad AST covering
  literals, identifiers, member access, calls, assignments, prefix/postfix
  operators, functions, imports, loops, conditionals, destructuring, templates,
  and async-related syntax.
- Parser errors are collected and exposed through `parser.errors`; ordinary
  parse failures are represented as diagnostics rather than becoming the
  framework's primary control flow.

## Dependency Collection

- Dependency analysis lives primarily in
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/visitors.ts`.
- `collectVariableDependencies` walks the parsed script tree and returns
  dependencies while respecting local block scope.
- Member chains are preserved when they can be represented simply, such as
  `foo.bar`, instead of always collapsing to the root identifier.
- Assignment targets are optional dependency inputs: computed-use analysis can
  include them when runtime write targets need to be available, but reactive
  dependency tracking can omit them to avoid self-triggering writes.

## Optional Member Access

- Member reads are evaluated in
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/eval-tree-common.ts`.
- XMLUI can default member access to optional semantics through
  `evalContext.options?.defaultToOptionalMemberAccess`.
- With that option enabled, `parent.member` behaves like `parent?.member` for
  reads. This is important for expressions such as
  `$props.label || 'Click to increment'`.
- The rewrite should model this as an XMLUI semantic choice in our IR/compiler,
  not as a parser trick.

## Editor Syntax Support

- Old Monaco grammar support embeds `xmluiscript` inside event attributes such
  as `onClick="..."`, value-like attributes, and script/helper tag bodies in
  `/Users/dotneteer/source/xmlui/xmlui/src/syntax/monaco/grammar.monacoLanguage.ts`.
- TextMate grammar files live under
  `/Users/dotneteer/source/xmlui/xmlui/src/syntax/textMate/`.
- The new VS Code extension should continue to translate parser/compiler-owned
  metadata into editor tokens and diagnostics. It should not grow a separate
  expression parser.

## Initial Rewrite Implications

- Keep scanner, parser, semantic binding, dependency collection, and code
  generation as separate stages.
- Preserve source spans on every token and node so compiler diagnostics and LSP
  features can point back to the containing `.xmlui` file.
- Implement only the initial subset now, but keep AST and IR shapes compatible
  with later statements, calls, member chains, optional access, async handlers,
  and sandbox checks.
