# Future Plan: Fragment Shorthand Markup

Status: proposed future work

## Scope

Add XMLUI markup support for `<>` and `</>` as a shorthand for `<Fragment>` and
`</Fragment>`.

The shorthand must support every feature that an explicit `<Fragment>` supports:

- child grouping without adding layout DOM;
- attribute-bearing omitted-tag Fragment openers such as
  `< id="a" when="{ok}">x</>` and `<id="a">x</>`;
- attributes such as `id`, `testId`, `when`, layout/style props, and future
  universal props;
- `var.*` local variable declarations;
- `global.*` global variable declarations wherever Fragment is allowed to carry
  globals;
- `on*` event handlers if Fragment/event semantics exist at the time of
  implementation;
- nested shorthand fragments;
- mixed shorthand and explicit Fragment nesting;
- source spans, diagnostics, LSP token lookup, and debug/source-map behavior.

React compatibility note:

- JSX fragment shorthand supports `<>...</>` only; it does not allow attributes
  on the shorthand opener.
- XMLUI should keep `<>...</>` compatible with JSX for the attribute-free form,
  but deliberately extend the shorthand with omitted-tag attribute openers such
  as `<id="a">...</>` and `< id="a">...</>` so it can preserve all existing
  Fragment capabilities.

Non-goals:

- Do not introduce a new runtime component type.
- Do not change explicit `<Fragment>` behavior.
- Do not make `<>...</>` a top-level multi-root escape hatch. Treat shorthand
  exactly as if `<Fragment>` had been written: accept it in the same locations
  where explicit Fragment is accepted, and reject it in the same locations where
  explicit Fragment is rejected.

## Compatibility Baseline

Original XMLUI sources to re-check before implementation:

- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/scanner.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/parser.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/transform.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/fixtures.ts`

Observed old behavior:

- `Fragment` is a normal component name in the parse tree and transform output.
- Fragment rendering is special at the component renderer layer: it renders its
  children directly through React Fragment semantics.
- `var.*` declarations on Fragment are widely used by old tests and the test bed.
- Global declarations are parsed through the same attribute path as every other
  element and are rejected only in contexts where globals are already illegal.

The rewrite currently has the relevant implementation points in:

- `xmlui/src/parser/markup/syntaxKind.ts`
- `xmlui/src/parser/markup/scanner.ts`
- `xmlui/src/parser/markup/parser.ts`
- `xmlui/src/parser/markup/syntaxNode.ts`
- `xmlui/src/compiler/parseXmlui.ts`
- `xmlui/src/runtime/rendering/builtins.tsx`
- `xmlui/tests/compiler/parser/markupScanner.test.ts`
- `xmlui/tests/compiler/parser/markupParser.test.ts`
- `xmlui/tests/compiler/parseXmlui.test.ts`
- `xmlui/tests/e2e/*.spec.ts`

## Design

Treat shorthand fragments as syntax sugar for the component name `Fragment`.
Normalize to `Fragment` before compiler/runtime behavior is selected, so all
existing Fragment features travel through the same attribute, binding, scope,
rendering, and diagnostics paths.

Keep source information distinct:

- syntax/token nodes should preserve the literal `<>` and `</>` ranges;
- semantic tag-name helpers should return `Fragment` for shorthand elements;
- diagnostics should name the semantic component as Fragment while displaying
  the exact source token being discussed, such as `</>` or `</Fragment>`;
- compiler output should use `type: "Fragment"` with normal source ranges.

This keeps LSP/editor features honest about what the user typed while avoiding a
parallel runtime concept.

## Planned Code Modifications

1. Extend markup syntax kinds.
   - Add `FragmentOpen` and `FragmentClose` token kinds to
     `xmlui/src/parser/markup/syntaxKind.ts`, or equivalent names if the parser
     already has a better naming convention by then.
   - Classify both as punctuation.
   - Keep existing `OpenNodeStart`, `CloseNodeStart`, `NodeEnd`, and `NodeClose`
     unchanged for normal elements and self-closing tags.

2. Update the markup scanner.
   - In `xmlui/src/parser/markup/scanner.ts`, recognize `<>` in content mode as
     one `FragmentOpen` token and switch to content mode immediately.
   - Recognize `</>` in content mode as one `FragmentClose` token and keep or
     restore content mode immediately.
   - Keep `< id="a" when="{ok}">` tokenized through the existing
     `OpenNodeStart`, attribute, and `NodeEnd` tokens; the parser will
     reinterpret this omitted tag-name form as an attribute-bearing Fragment
     opener.
   - Keep `<id="a">` tokenized as `OpenNodeStart`, `Identifier`, `Equal`,
     `StringLiteral`, and `NodeEnd`; the parser must reinterpret the leading
     lowercase identifier as an attribute key, not a tag name, when it is
     followed by `=`, `.`, or `:` in an attribute-key shape.
   - Treat `< >...</>` as equivalent to `<>...</>` only if that does not conflict
     with the attribute-bearing omitted-tag form.
   - Do not tokenize `<>` as `OpenNodeStart` + `NodeEnd`.
   - Do not tokenize `</>` as `CloseNodeStart` + `NodeEnd`.
   - Preserve comments/trivia behavior around the new tokens.
   - Confirm that `< />`, `< / >`, `</ >`, and `< /` remain syntax errors; they
     are not shorthand fragments.

3. Update concrete syntax parsing.
   - In `xmlui/src/parser/markup/parser.ts`, teach `parseContentList` to treat
     `FragmentOpen` like an element opener and `FragmentClose` like a content
     list terminator.
   - In `parseElement`, branch before the normal tag-name path:
     - for `FragmentOpen`, create an `Element` node whose opening child is the
       shorthand token and whose synthetic or semantic tag name resolves to
       `Fragment`;
     - for `OpenNodeStart` followed by a syntactically valid attribute list and
       then `NodeEnd`, create an attribute-bearing shorthand Fragment element;
     - for `OpenNodeStart Identifier Equal ...`, treat the identifier as the
       first attribute key only when it starts with lowercase; `<id="a">...</>`
       is Fragment shorthand, while `<Id="a">...</Id>` remains a component tag
       named `Id`;
     - parse content exactly like normal non-self-closing elements;
     - require `FragmentClose` as the closer;
     - keep malformed omitted-name tags as missing-tag-name errors unless they
       close cleanly as an attribute-bearing Fragment opener.
   - Implement the attribute-bearing forms as `<attr="value">...</>` and
     `< attr="value">...</>`, where the first attribute name must start with a
     lowercase letter when no whitespace separates it from `<`.
   - Make sure attributes on omitted-tag Fragment openers reuse the normal
     attribute parser and transform path, including dotted names such as
     `var.count`, `global.shared`, and `method.reset`.
   - Add parser helpers:
     - `isFragmentOpenToken(nodeOrToken)`;
     - `isFragmentCloseToken(nodeOrToken)`;
     - `semanticTagName(node, source)`, returning `Fragment` for shorthand;
     - `displayElementTokenForDiagnostic(node, source)`, returning the exact
       author-written token such as `<>`, `</>`, `<Fragment>`, or `</Fragment>`.
   - Diagnostic wording should combine both views. Example: `Fragment opened as
     <> must be closed with </>, but found </Fragment>.`

4. Preserve source tree and LSP behavior.
   - In `xmlui/src/parser/markup/syntaxNode.ts` and LSP helpers if needed, make
     `findTokenAtOffset` return `FragmentOpen`/`FragmentClose` when the cursor is
     on shorthand delimiters.
   - Keep synthetic semantic names out of raw `getNodeText` for token nodes.
   - Ensure `toDebugString` exposes the shorthand tokens and, if a synthetic
     `TagName` node is used, clearly marks it so future LSP code can avoid
     offering edits at a non-existent source span.

5. Update compiler transform.
   - In `xmlui/src/compiler/parseXmlui.ts`, replace direct `tagName(node,
     source)` calls with a semantic tag-name helper that maps shorthand elements
     to `Fragment`.
   - Ensure `transformElement` still uses the existing attribute splitting path
     for props, `var.*`, `global.*`, `on*`, and `method.*`.
   - Ensure namespace resolution is skipped for shorthand Fragment; `<>` is
     always the built-in Fragment, not a namespaced component.
   - Keep `rangeOf(node)` as the literal shorthand span from `<>` to `</>`.

6. Verify runtime rendering.
   - Confirm `xmlui/src/runtime/rendering/builtins.tsx` has a `Fragment`
     renderer. If it does not, add one matching old XMLUI behavior: render
     children directly with React fragments and no layout wrapper.
   - Do not special-case shorthand at runtime; runtime should only see
     `type: "Fragment"`.

7. Update docs/examples only after behavior lands.
   - Add a short note to `xmlui/src/components/Fragment/Fragment.md` showing the
     shorthand and one attribute/variable example.
   - Add one routed example under `xmlui/src/examples/fragment-shorthand/Main.xmlui`
     if E2E coverage uses routed examples.

## React Syntax Check And XMLUI Extension

Checked locally with the TypeScript TSX parser:

- `<>x</>` parses successfully.
- `<></>` parses successfully.
- `< >x</>` parses successfully.
- `< key="a">x</>` is a parse error.
- `< />`, `< / >`, `</ >`, and `< /` are parse errors.

Use this XMLUI grammar:

- `<>...</>` is the attribute-free shorthand for `<Fragment>...</Fragment>`.
- `<id="a">...</>` is the no-whitespace attribute-bearing shorthand for
  `<Fragment id="a">...</Fragment>` because `id` starts with lowercase and is
  immediately followed by `=`.
- `< id="a" when="{enabled}">...</>` is the attribute-bearing shorthand for
  `<Fragment id="a" when="{enabled}">...</Fragment>`.
- `<when="{enabled}">...</>` is valid for the same reason.
- `< var.count="{0}" global.shared="{1}">...</>` is valid and follows the same
  variable/global handling as explicit Fragment.
- `<Id="a">...</Id>` is still a component tag named `Id`, not Fragment shorthand.
- `</>` is always the closing token.
- `< >...</>` may be accepted as whitespace-tolerant shorthand only if scanner
  recovery remains clean and the form cannot be confused with a missing
  attribute list.

Compatibility risks:

- Attribute-bearing shorthand intentionally diverges from React/JSX.
- `< attr="value">` currently reports a missing tag name. Reinterpreting it as
  Fragment may hide some authoring mistakes.
- `<id="a">` currently looks like a tag named `id` followed by an attribute
  value. Reinterpreting lowercase tag-name-plus-equals as Fragment shorthand is
  intentional, but it means lowercase custom component names cannot be followed
  immediately by `=` and still parse as tags.
- To reduce accidental acceptance, only treat `<...>` or `< ...>` as Fragment
  when the first item after `<` is a syntactically valid attribute and the
  opener closes cleanly with `>`. Malformed cases should retain useful
  missing-tag diagnostics.

## Unit Test Titles

Parser/scanner tests:

- `tokenizes empty fragment shorthand as FragmentOpen and FragmentClose tokens`
- `tokenizes shorthand fragment with surrounding trivia without dropping comments`
- `does not treat spaced malformed fragment delimiters as shorthand tokens`
- `parses empty fragment shorthand into an Element with semantic tag name Fragment`
- `parses nested shorthand fragments and matches each </> to the nearest shorthand opener`
- `parses shorthand Fragment inside explicit Fragment and explicit Fragment inside shorthand Fragment`
- `reports a missing shorthand closing token when <> is not closed`
- `reports a mismatched normal closing tag when <> is closed with </Fragment>`
- `reports a mismatched shorthand closing token when <Fragment> is closed with </>`
- `parses attribute-bearing shorthand Fragment opener with id and when attributes`
- `parses no-whitespace lowercase attribute-bearing shorthand Fragment opener`
- `does not parse no-whitespace uppercase identifier followed by equals as Fragment shorthand`
- `parses attribute-bearing shorthand Fragment opener with var and global declarations`
- `reports a missing tag name for malformed omitted-tag openers that are not valid attribute-bearing fragments`
- `preserves cursor lookup for FragmentOpen and FragmentClose tokens`
- `debug tree preserves literal shorthand delimiters while semantic tag name is Fragment`

Compiler tests:

- `parseXmlui lowers <>...</> to an XmluiElement with type Fragment`
- `parseXmlui preserves shorthand Fragment source range from <> through </>`
- `parseXmlui applies normal props from an attribute-bearing shorthand Fragment opener`
- `parseXmlui applies var declarations from an attribute-bearing shorthand Fragment opener`
- `parseXmlui applies global declarations from an attribute-bearing shorthand Fragment opener in App scope`
- `parseXmlui parses when as a normal Fragment prop on an attribute-bearing shorthand opener`
- `parseXmlui parses event handler attributes on an attribute-bearing shorthand Fragment opener`
- `parseXmlui keeps shorthand Fragment out of namespace resolution even inside xmlns scope`

Runtime/component tests:

- `shorthand Fragment renders multiple children without adding a wrapper element`
- `shorthand Fragment inherits parent styling context like explicit Fragment`
- `attribute-bearing shorthand Fragment exposes id or testId like explicit Fragment`
- `attribute-bearing shorthand Fragment when attribute toggles all grouped children together`
- `attribute-bearing shorthand Fragment local var updates from child event handlers and rerenders dependents`
- `nested attribute-bearing shorthand Fragment vars shadow outer vars like explicit Fragment`
- `attribute-bearing shorthand Fragment global var updates from child event handlers and rerenders global dependents`

## E2E Test Case Titles

- `fragment shorthand renders grouped sibling text nodes without an extra layout wrapper`
- `attribute-bearing fragment shorthand with id renders a queryable grouped child region without adding a wrapper`
- `attribute-bearing fragment shorthand with when hides and shows an entire child group after a button click`
- `attribute-bearing fragment shorthand with var.count lets a child button increment local state and update sibling text`
- `nested attribute-bearing fragment shorthand scopes local variables independently and updates only the clicked group`
- `attribute-bearing fragment shorthand with global.shared lets one group update state read by another group`
- `fragment shorthand can wrap user-defined component children while preserving projected child scope`
- `fragment shorthand can be nested inside explicit Fragment and explicit Fragment can be nested inside shorthand Fragment`
- `fragment shorthand in a routed app survives navigation and remounts with expected state initialization`
- `malformed omitted-tag opener that is not a valid attribute-bearing fragment shows a descriptive missing tag-name diagnostic`
- `malformed fragment shorthand shows a compile overlay with a descriptive missing closing token diagnostic`

## Verification Commands

Run the focused checks first:

```sh
npm --workspace xmlui test -- xmlui/tests/compiler/parser/markupScanner.test.ts
npm --workspace xmlui test -- xmlui/tests/compiler/parser/markupParser.test.ts
npm --workspace xmlui test -- xmlui/tests/compiler/parseXmlui.test.ts
npx playwright test xmlui/tests/e2e/fragment-shorthand.spec.ts --config xmlui/playwright.config.ts
```

Then run the parser/runtime regression slice:

```sh
npm --workspace xmlui test -- xmlui/tests/compiler
npx playwright test xmlui/tests/e2e/expression-updates.spec.ts xmlui/tests/e2e/counter-globals.spec.ts xmlui/tests/e2e/udc-composition.spec.ts --config xmlui/playwright.config.ts
```

## Resolved Decisions

- Accept shorthand exactly wherever explicit `<Fragment>` is accepted; reject it
  wherever explicit `<Fragment>` is rejected.
- In diagnostics, mention the semantic component name `Fragment`, and display
  the exact element token involved, such as `</>` or `</Fragment>`.
