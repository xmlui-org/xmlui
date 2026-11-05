%-DESC-START

The Inspector shows the app's trace (interactions, API calls, state changes and handler timing) in a viewer that opens in a modal dialog. Add it anywhere a small icon fits, for example in the app header's profile menu:

```xml
<App>
  <AppHeader title="My App">
    <property name="profileMenuTemplate">
      <Inspector />
    </property>
  </AppHeader>
</App>
```

## The viewer files

The viewer is not part of the runtime bundle. It is two files that the app serves next to itself:

| File | Role |
| --- | --- |
| `xmlui/xs-diff.html` | The viewer page, loaded from `src` (default `/xmlui/xs-diff.html`) |
| `xmlui/xmlui-parser.es.js` | The XMLUI parser, imported by the viewer from the same directory |

Both files ship in the `xmlui` npm package under `dist/standalone/`, next to `xmlui-standalone.umd.js`. Use the copies from the same version as the runtime, so the viewer understands the trace format the runtime writes.

If a file is missing, the dialog names it and shows the URL it tried, instead of an empty frame. This also works on hosts that answer a missing file with the app's own `index.html` (SPA fallbacks, the XMLUI dev server): the viewer must contain its parser import, and the parser must not be an HTML page.

## Loading missing files from the CDN

Set `fetchMissing` to load any missing viewer file from jsDelivr:

```xml
<Inspector fetchMissing="true" />
```

Each file is resolved on its own. A local copy always wins; only a missing one is fetched from `https://cdn.jsdelivr.net/npm/xmlui@<version>/dist/standalone/`, where `<version>` is the version of the running runtime. A development build has no released version, so it gets no CDN fallback.

With `fetchMissing`, the trace records where each file came from in an `inspector:resolve` entry (`file`, `source: "local" | "cdn" | "missing"`, `url` or `tried`), so a stale local copy is easy to spot.

`fetchMissing` is off by default: without it, the Inspector never fetches anything from outside the app's own origin.

%-DESC-END
