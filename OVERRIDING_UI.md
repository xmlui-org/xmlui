# Overriding ui-s by serving `/xmlui/my-component.xmlui`

## Goal

From Gent

> if a user is asking for a URL with path /xmlui/x.y, we look for for x.y in the xmlui subfolder in the app home and serve it.
> The “xmlui” part should be hardcoded. It will always be xmlui.

non-functional req:

- this has to work in bundled(pre-built) mode, like CoreSSH
- Can be turned on and off

## status quo

We are doing client side routing. The ui elements aren't loaded from the server using ajax (fetch) calls.
They are loaded via a single `<script>` tag. Thanks to bundling (which minifies and optimizes the javascript),
every component is in a single js file. Currently bundled xmlui sites can't have overriding components.

## Rambling about ideas for myself

**It is doable!**

The standalone version of xmlui does exactly this, fetching `.xmlui` files from the `/components` directory.

The bundled version can be modified to do the same with performace overhead.
The slowdowns depend on our implementation, but worst case scenario it will be like a standalone app, where there are:

1. Sequential waterfall requests for components that delay first render

```
Client                                      Server
│                                            │
▼                                            │
Request Index.html ─────────────────────────►│
│                                            │
│◄───────────────────────────────────────────▼
│  Main.xmlui                                │
│                                            │
▼                                            │
Request SignIn.xmlui ───────────────────────►│
│                                            │
│◄───────────────────────────────────────────▼
│  SignIn.xmlui                              │
│                                            │
▼                                            │
Request SignInButton.xmlui ─────────────────►│
│                                            │
│◄───────────────────────────────────────────▼
│  SignInButton.xmlui                        │
│                                            │
```

2. Bigger bundle size 4,6Mb

### How to do it?

Vite transforms all the xmlui files to component definitions, because
index.html imports index.ts, which has these lines:

```ts
// index.ts
import { startApp } from "xmlui";
import usedExtensions from "./extensions";

export const runtime = import.meta.glob(`/src/**`, { eager: true });
startApp(runtime, usedExtensions);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, usedExtensions);
  });
}
```

In the StandaloneApp.tsx file:
Let's also try adding fetch-es into the resolveRuntime function which has
projectCompilation.components.push(componentCompilation);
