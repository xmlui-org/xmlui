# Code Injection Prevention

XMLUI evaluates every expression in your markup through a custom AST
interpreter — never through the browser's `eval`. The JavaScript constructs
that turn arbitrary strings into executable code are denied, so a malicious
or accidental string in your data cannot become live code in your app.

## What problems this prevents

- A value pulled from an API or user input cannot be turned into running code
  through `eval("...")`, `new Function("...")`, or the `Function` constructor.
- WebAssembly compilation paths (`WebAssembly.compile`,
  `WebAssembly.instantiate`, the `WebAssembly.Module` and
  `WebAssembly.Instance` constructors) are blocked, so binary code cannot be
  smuggled in via a string.
- A `debugger;` statement embedded in an expression is rejected at parse
  time, so untrusted markup cannot drop the user's browser into the
  debugger.
- The "no code injection" guarantee that comes with managed runtimes (like
  the JVM or CLR) now extends to your XMLUI markup, not just to the
  framework's own internals.

## How it works

XMLUI ships its own scripting parser and tree-walking interpreter. Inline
expressions in your markup are parsed into an AST and evaluated by that
interpreter — the JavaScript engine never sees a `Function` or `eval` call
on your behalf. The four code-injection families (`eval`, `Function`,
`WebAssembly`, `debugger`) are listed in an internal banned-functions table
and refused at evaluation time; `debugger` is additionally rejected by the
parser before any code runs.

This protection is always on. There is no opt-out flag and no warn-only
mode, because allowing any of these primitives would defeat the rest of the
managed-React guarantees.

## Related

- [DOM API Isolation](/docs/managed-react/dom-api-isolation)
- [XSS Protection](/docs/managed-react/xss-protection)
- [Managed React Overview](/docs/managed-react/overview)
