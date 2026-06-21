# Phase 2 Findings: Core Language and Runtime Semantics

Status: initial compatibility slice implemented

Phase 2 starts closing the behavior behind XMLUI authoring before broad
component work continues.

## Implemented in This Slice

- Added parser/compiler support for documented child event tags:

  ```xml
  <Button>
    <event name="click">
    {
      count++;
    }
    </event>
    Count: {count}
  </Button>
  ```

- Event tags now:
  - lower into the parent component's event bucket;
  - are removed from rendered children;
  - use the same parsed event, compiled JavaScript, invalidation, async
    scheduling, and runtime execution path as `onClick`;
  - support state mutation through the normal event pipeline.

- Raw script children for `<event>` and `<method>` tags no longer go through
  mixed-text expression parsing, so handler blocks with braces are valid.
- Added source-anchored compatibility coverage for null-safe property reads,
  matching the old scripting rule that member access on `null`/`undefined`
  returns `undefined` instead of throwing.

## Old Source Anchors

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/xmlui-parser/transform.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/scripting`

## Remaining Phase 2 Debt

- `COMP-0013`: code-behind modules, including `Globals.xs`,
  `Main.xmlui.xs`, component `.xmlui.xs`, and inline `<script>` declarations.
- `COMP-0014`: full `config.json`/`config.ts` loading and runtime/tooling
  integration.
- `COMP-0015`: old/new performance oracle measurements and thresholds.

## Verification

Verified commands:

```text
npx vitest run tests/compiler/parseXmlui.test.ts tests/compatibility
npm --workspace xmlui run test:e2e -- tests/e2e/event-tags.spec.ts
npm --workspace xmlui run test
npm --workspace xmlui run compatibility:sweep
npm --workspace xmlui run compatibility:perf
```

Results:

- Focused parser/compatibility tests: 4 files, 22 tests passed.
- Focused event-tag E2E: 1 test passed.
- Compiler/runtime test suite: 26 files, 211 tests passed.
- Full compatibility sweep passed, including 55 E2E tests.
- Performance baseline command passed and wrote the latest ignored report.
