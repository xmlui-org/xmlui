# Build-Validation Analyzers

XMLUI's static analyzer catches whole categories of bugs *before*
your app runs. A typo'd component name (`<Buttn>`), an attribute
the component doesn't declare (`labl="…"`), an event that doesn't
exist (`onClik`), a conditional that's always true (`1 ? a : b`),
or an event handler that forgot its parentheses
(`onClick="myAction"`) — all of these reach you as a precise
`file:line:column` diagnostic with a suggested fix, not a silent
no-op at runtime.

The same analyzer pipeline drives three surfaces: the **VS Code
language server** (live red squiggles while you type), the **Vite
plugin** (fail the build on a deliberately broken markup), and a
standalone **`xmlui check`** CLI (so buildless apps can gate CI
the same way). All three share one rule registry — a diagnostic
on a missing prop reads identically in the editor, in the build
log, and in your GitHub Actions output.

## What problems this prevents

- `<Buttn label="Save" />` — unknown component name now fails the
  build (or the LSP highlights it) with the suggestion
  `Did you mean "Button"?`.
- `<Button labl="Save" />` — unknown prop reaches you as a
  warning with suggestion `"label"`, instead of being silently
  dropped at render time.
- `<Button onClik="…" />` — unknown event handler reaches you as
  a warning with suggestion `"onClick"`, instead of never firing.
- `<Button when="1 ? true : false">` — dead conditional gets
  flagged before it ships, catching debug code that nobody
  cleaned up.
- `<Button onClick="myAction" />` — the handler that forgot its
  parens (and therefore does nothing) is caught with suggestion
  `"myAction()"`.

## How it works

Every `.xmlui` file the framework parses also passes through the
analyzer. Each registered rule walks the markup AST (or the
expression AST) and emits structured `BuildDiagnostic` entries
with a stable code (`id-unknown-component`, `expr-handler-no-value`,
…), a severity (`info | warn | error`), a precise location, and
an optional suggested replacement. The walker is the same in all
three surfaces — the only thing that changes is how diagnostics
are presented.

## Rules shipped today

| Code | Default severity | What it catches |
|---|---|---|
| `id-unknown-component` | `error` | Component tag not in the registry. |
| `id-unknown-prop` | `warn` | Prop name not declared by the component. |
| `id-unknown-event` | `warn` | Event handler name not declared by the component. |
| `expr-dead-conditional` | `info` | Conditional whose condition is a constant. |
| `expr-handler-no-value` | `info` | Event-handler body that returns nothing useful (e.g., a bare identifier). |
| `determinism-floating-point-token` | `info` | Floating-point literals in expressions evaluated under deterministic schedulers. |
| `determinism-iteration-order-symbol` | `info` | Iteration helpers that read `Object.getOwnPropertySymbols`. |
| `theming-missing-prefix` | `info` | Theme-variable reference in `style`/`vars` uses an unknown or missing package prefix. |

Additional rule families — `id-unknown-method`, `id-unknown-slot`,
`expr-unused-var`, `expr-unbound-identifier`,
`id-undefined-component-ref`, `id-undefined-form-ref` — are
registered as no-op stubs today and will activate once their
supporting infrastructure (metadata-driven slot declarations and
cross-expression scope tracking from verified type contracts)
is available on those analyzer paths.

## The three surfaces

### VS Code (live diagnostics)

Install the XMLUI VS Code extension. Every `.xmlui` file you
open is analyzed on save (and on edit, debounced); findings
appear in the **Problems** panel and as inline squiggles.
Rules that emit a `suggestions` payload also surface as
quick-fix code actions — clicking *"Replace `Buttn` →
`Button`"* applies the rename.

### Vite plugin (`analyze` option)

In a Vite-built XMLUI app, the `vite-xmlui-plugin` accepts an
`analyze` option:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { xmluiPlugin } from "xmlui/vite";

export default defineConfig({
  plugins: [
    xmluiPlugin({ analyze: "warn" }), // "off" | "warn" (default) | "strict"
  ],
});
```

- `"off"` — analyzer disabled entirely.
- `"warn"` (default) — analyzer runs; `info` and `warn` print
  to the console, `error` fails the build.
- `"strict"` — analyzer runs with severity escalation: every
  rule's `strictSeverity` overrides its default
  (`info → warn → error`).

### `xmlui check` CLI

Buildless (standalone-mode) apps gate CI through the CLI:

```bash
npx xmlui check ./my-app                 # default: gnu format, warn mode
npx xmlui check ./my-app --strict        # escalate severities
npx xmlui check ./my-app --format json   # machine-readable output
npx xmlui check ./my-app --rule id-unknown-component
npx xmlui check ./my-app --no-rule expr-dead-conditional
```

Exit code is non-zero on any `error`-severity diagnostic, so the
CLI plugs straight into a GitHub Actions workflow.

## CI integration in new apps

Every template generated by `create-xmlui-app` ships a ready-to-use
GitHub Actions workflow at `.github/workflows/check.yml` and a
default `xmlui.config.json` that pins each rule's severity. The
workflow runs `xmlui check` on every PR; failing diagnostics block
merge per your repo's branch-protection rules.

The `xmlui.config.json` accepts per-rule overrides:

```jsonc
{
  "analyzer": {
    "rules": {
      "id-unknown-prop": "error",
      "expr-dead-conditional": "off"
    }
  }
}
```

## Suppression directives

Suppression directives are XML comments that silence specific diagnostic codes.
Each directive must name at least one code, and multiple codes can be separated
with spaces.

| Directive | Scope |
|---|---|
| `<!-- xmlui-disable-next-line code -->` | Suppresses `code` on the following source line only. |
| `<!-- xmlui-disable code -->` | Starts a suppression block for `code` on the next source line. |
| `<!-- xmlui-enable code -->` | Ends an active suppression block for `code`; the enable comment line itself is not suppressed. |

```xmlui
<!-- xmlui-disable-next-line id-unknown-component -->
<MyExperimentalThing />

<!-- xmlui-disable id-unknown-prop -->
<Button experimentalProp="…" />
<!-- xmlui-enable id-unknown-prop -->
```

Directives can name more than one code:

```xmlui
<!-- xmlui-disable-next-line id-unknown-prop value-not-in-enum -->
<Button labe="Save" variant="vibrant" />
```

Type-contract diagnostics honor these directives too. For example,
`id-unknown-prop` suppresses the type-contract `unknown-prop` diagnostic, while
verifier-only diagnostics such as `value-not-in-enum` can be suppressed by their
own code.

There is **no blanket disable** (`<!-- xmlui-disable -->` with no
code is intentionally not supported). Suppression must always
name the rule it silences — the analyzer exists precisely to
make rule-by-rule decisions visible.

## Strict mode

Strict mode is opt-in today: pass `--strict` to the CLI or
`analyze: "strict"` to the Vite plugin. When strict is on, every
rule's `strictSeverity` (always one step higher than the default,
capped at `error`) replaces its default severity — so `warn`
findings become build-failing `error`s. The global
`appGlobals.strictBuildValidation` setting that flips strict on
for *every* surface will become the default in the next major
release; for now, choose strict at each call site.

## Related

- Component metadata diagnostics on **prop value types** live in
  [Verified Type Contracts](/docs/managed-react/verified-type-contracts).
- **Reactive cycle** diagnostics live in
  [Reactive Cycle Detection](./reactive-cycle-detection.md).
- **Deprecation** diagnostics live in the
  [Enforced Versioning](/docs/managed-react/enforced-versioning)
  pipeline.
