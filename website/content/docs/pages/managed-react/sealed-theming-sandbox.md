# Sealed Theming Sandbox

XMLUI keeps your styling inside a sandbox: every component imports a CSS
module whose class names are mangled, theme values are exposed as
`--xmlui-*` custom properties, and components never read or write the
DOM directly. The sealed theming sandbox closes the two remaining holes
in that boundary — typed validation for theme variables, and a structural
rule table for the `style` prop and the layout shorthand props (`width`,
`padding*`, `margin*`, `zIndex`, …). When a value falls outside what
XMLUI knows how to render, you get a diagnostic — at the point of
failure, with the variable or prop name — instead of a silently dropped
declaration.

## What problems this prevents

- A bad value in a theme override (`backgroundColor-Button: "#abc def"`,
  `padding-Card: "1rim"`) no longer disappears into the browser's
  invalid-declaration trash. The theme validator emits an
  `invalid-theme-value` diagnostic naming the variable, the expected
  shape (`color`, `length`, `duration`, …), and the offending value.
  In strict mode, XMLUI treats the invalid override as if it had not
  been declared, so it cannot mask a lower-priority theme value or a
  component default.
- A theme override that targets a variable no component ever declared
  (`backgroundColor-Buton`) emits an `unknown-theme-variable` warning
  instead of being silently ignored.
- A markup line like `<Stack style="position: fixed; z-index: 99999" />`
  no longer punches a hole through every parent's stacking context. The
  inline-style validator blocks `position: fixed | sticky` and clamps
  out-of-range `zIndex` values against a configurable `maxZIndex`
  ceiling. The legitimate use cases (modal, drawer, toast, popover) are
  framework components that already manage stacking context for you.
- `style="background: url(http://evil.example/x)"` and
  `style="z-index: 9999 !important"` no longer slip through the inline
  channel once `allowInlineRawCss` is off — URLs in styles are a known
  XSS exfil vector, and `!important` would defeat the theme cascade.
- Layout shorthand props no longer accept exotic units. `<Stack
  width="1in" />` warns (and, in strict mode, drops); only the units
  the framework can theme consistently (`px`, `rem`, `em`, `%`, `vw`,
  `vh`, `fr`, `auto`, plus `calc(...)` over the same allowlist) pass
  through.

## How it works

When XMLUI resolves a theme, it also resolves theme-variable references
such as `$color-primary-500` into the CSS custom properties that components
consume. During that same pass, the validator checks every variable against
the `valueType` declared in that variable's metadata using the same rule table
the type-contract verifier uses for component props — so a `color` theme
variable accepts exactly the same values as a `color` prop. The inline-style
boundary funnels every layout-shorthand value and every declaration parsed out
of the `style` prop through the same rule table. Diagnostics surface as
`kind:"theming"` entries on the trace (and as a one-shot toast in strict mode);
blocked declarations in strict mode are dropped before the rule reaches the DOM,
but the rest of the surrounding declarations still apply.

Strict theme-variable validation runs before each theme layer is merged.
That ordering matters: if a child `<Theme>` sets
`backgroundColor-Button="#abc def"`, the invalid value is reported and
removed before it can override the inherited `backgroundColor-Button`
value. The resulting rendering is the same as omitting that one
attribute, while the console and trace still show the diagnostic.

## Diagnostic codes

| Code | When it fires | Default | Strict |
|---|---|---|---|
| `invalid-theme-value` | Theme variable value does not match its declared `valueType`. | warn | error |
| `unknown-theme-variable` | Theme override targets a variable no component or extension declared. | warn | warn (never escalates — third-party extensions may register late) |
| `raw-css-in-prop` | `style` contains a CSS property not in the rule table. | warn | error (unless `allowInlineRawCss: true`) |
| `important-blocked` | `!important` appeared inside `style` while `allowInlineRawCss === false`. | warn | error (declaration dropped) |
| `url-in-style` | `url(...)` value appeared inside `style` while `allowInlineRawCss === false`. | warn | error (declaration dropped) |
| `position-fixed-blocked` | `position: fixed` or `position: sticky` appeared in `style`. | warn | error (declaration dropped) |

The `zIndex` clamp against `maxZIndex` applies in both modes and surfaces
as a `kind:"theming"` warn entry.

## Enabling strict mode

Three `appGlobals` switches govern the sandbox. All three default to a
non-breaking value during the rollout window and flip together in the
next major release.

```json
{
  "appGlobals": {
    "strictTheming": true,
    "allowInlineRawCss": false,
    "maxZIndex": 9999
  }
}
```

- **`strictTheming`** (default `false`) — escalates the theming
  diagnostics above from `warn` to `error` and drops the offending
  declarations before they reach the DOM. `unknown-theme-variable` is
  the one exception: it stays at `warn` even in strict mode so a
  late-loaded extension package is not penalised.
- **`allowInlineRawCss`** (default `true`) — when `false`, the `style`
  prop refuses `url(...)` values and `!important` flags. This is a
  separate toggle from `strictTheming` because some apps (for example
  one that embeds untrusted theme JSON) want the raw-CSS clamp without
  enabling the rest of strict mode.
- **`maxZIndex`** (default `9999`) — ceiling for `zIndex` values
  reachable through the layout-prop channel. Higher values are clamped
  with a warn; raise this if your app is embedded in a shell that
  reserves higher z-indexes for itself.

Validation runs in development builds unconditionally and in production
only when `strictTheming === true`, so production users do not pay the
validator cost unless they have opted in.

Standalone apps use the same verifier and theming validator as built
apps. With `strictTheming: true`, invalid `<Theme>` attributes are
reported in the browser console with messages such as:

```text
[XMLUI Theme] [invalid-theme-value] Theme variable "backgroundColor-Button": Expected a CSS color, got "#abc def".
```

## Migrating away from `style="position: fixed"`

If you reach for `position: fixed` to overlay a panel, switch to the
managed component that already handles the stacking context, focus
trap, and dismiss semantics for you:

- A floating panel anchored to a trigger → `Popover`
- A dialog the user must dismiss → `Modal`
- A slide-in side panel → `Drawer`
- A transient notification → call `toast()` or render a `Toast`

These components use `position: fixed` internally — the framework
declares the intent; your markup expresses the *what*, not the *how*.

## Related

- [Themevars Namespace](/docs/managed-react/themevars-namespace) — the
  naming rule that gives each component (and each extension) its own
  theme-variable prefix.
- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
  — the same `coercionRules` table the theming validator delegates to
  for shared value types.
- [Build-Validation Analyzers](/docs/managed-react/build-validation-analyzers)
  — where future build-time theming rules will surface.
