# Parser Plan Diff 03

## Prompt

Follow the VS Code standards in the original project and create a VS Code
extension with syntax highlighting that uses the current parser. Before doing
that, create a snapshot.

## Edits

- Created the second parser-plan snapshot before starting the VS Code extension
  work.
- Added a parser-backed VS Code extension package with XMLUI language
  registration, TextMate grammar fallback, language configuration, and semantic
  token support.
- Reused the current parser for semantic token collection across XMLUI markup,
  attributes, text, comments, mixed text expressions, and event handlers.
- Added extension build, type-check, and semantic-token tests.

## Prompt

Move the VS Code folder into `tools`. In the VS Code package's `package.json`,
add a `build:vsix` command so a VSIX file can be created and installed in
VS Code.

## Edits

- Moved the VS Code extension package into `tools/vscode`.
- Updated the root workspace configuration and scripts to use `tools/vscode`.
- Added `build:vsix` to package the extension with `vsce package`.
- Adjusted extension packaging so the generated VSIX includes the bundled
  extension, grammar, language configuration, README, and license without
  pulling unrelated monorepo files.
- Verified extension tests, type checking, build, and VSIX packaging.
