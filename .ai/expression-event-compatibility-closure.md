# Expression/Event Compiler Slice: Compatibility Closure

Source baseline: `/Users/dotneteer/source/xmlui`

## Implemented Compatibility Surface

- XMLUI expressions and event handlers are parsed through the rewrite's script
  scanner/parser rather than runtime string evaluation.
- The initial expression subset supports numeric literals, string literals,
  identifier reads, `$props.member`, logical OR, and `count++` event handlers.
- Identifier reads resolve through XMLUI scope metadata:
  local variables, inherited local variables, globals, and `$props`.
- Local variables shadow globals.
- Component files may reference app-level globals implicitly, matching the
  initial global-counter component experiment.
- `$props.member` uses optional member-read behavior in compiled execution.
- `count++` compiles to explicit local/global reads and writes with invalidation
  metadata.
- The runtime path for the initial examples no longer uses dynamic
  `Function(...)` or `with(scope)`.
- VS Code semantic tokens now distinguish XMLUI script variables, special names,
  member names, write targets, operators, numbers, strings, markup tags,
  attributes, comments, and text.
- VS Code diagnostics surface the first parser or semantic diagnostic for an
  open `.xmlui` document.

## Intentional Omissions

- The full XMLUI script language remains deferred: async handlers, statement
  queues, imports, functions, arrow callbacks, member assignment, arrays,
  objects, calls, ternaries, nullish coalescing, optional chaining, sandbox
  policy, timers, and browser/global restrictions are not implemented yet.
- Diagnostics currently stop at the first parse/semantic error in the compiler
  path. Future language-server work should collect multiple diagnostics from a
  partial tree.
- The VS Code extension uses parser/compiler helpers directly and is not yet a
  standalone language server process.
- Source maps for generated JavaScript are represented only as spans and
  generated source strings in metadata; full source-map emission is deferred.
- Type contracts, metadata-aware completions, hover, rename, definition, and
  component API semantics are deferred.

## Verification

- Compiler unit tests cover parser recovery, scope creation, semantic binding,
  write analysis, IR lowering, expression compilation, event compilation,
  compiler-pipeline integration, and diagnostics.
- VS Code tests cover semantic tokens and diagnostic conversion.
- E2E tests cover the global-counter example with shared global state and local
  shadowing.
