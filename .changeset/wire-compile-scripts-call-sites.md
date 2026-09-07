---
"xmlui": patch
---

Five evaluation sites now honour `compileScripts`, and synchronous callbacks stop slipping the DOM sandbox.

Each of these built its evaluation context by hand, or called `extractParam` without
options, so the switch never reached them and they ran interpreted whatever the app asked
for — nothing downstream re-derives it. Loader-reference resolution in `ComponentWrapper`
runs for every prop of every node on re-render; `PageableLoader`'s page selectors run twice
per page fetch; `RestApiProxy` evaluates arrow-valued request parameters per request; and
an emulated `Backend`'s operation handlers and helpers run per mock request, where the
scripts are often the largest in the app.

Three of them pass options without an app context on purpose. They resolve loader
references and page selectors, and handing them an app context would widen identifier
resolution and change which expressions resolve — a behaviour change that does not belong
in a wiring fix.

`Backend` reads the settings the build baked in, since it is constructed far from React.
An app that declares `compileScripts` only in its app description and never in
`xmlui.config.json` still gets an interpreted mock backend.

`runCodeSync` is the exception, and deliberately so. Its context carried no options at all,
which was a semantic divergence as much as a performance one: a synchronous callback got
no `strictDomSandbox`, no `allowConsole`, and no config-driven
`defaultToOptionalMemberAccess`, so it slipped the sandbox that asynchronous handlers
enforce. That is fixed. Compilation stays off there: the synchronous statement queue has no
compiled target, so turning it on compiles only the leaf expressions while control flow
stays interpreted, and measured over the shapes this serves — `Table` `rowDisabledPredicate`,
`List` `groupBy`, `Slider` `valueFormat`, all evaluated per row per render — that is 1.3×
to 1.7× slower, not faster. It will inherit the switch once a compiled target for
synchronous statements exists.
