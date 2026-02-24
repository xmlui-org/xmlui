# Use a local XMLUI framework with the dev server

XMLUI apps can run in two modes:

- **Standalone**: Your app includes a pre-built XMLUI engine file (e.g. `xmlui/0.9.23.js`) and is served by any static web server. See [Structure of an XMLUI app](/app-structure).

- **Dev server**: Your app has a `package.json` that declares `xmlui` as a dependency and uses the `xmlui start` and `xmlui build` CLI commands, which run Vite under the hood. This gives you HMR, the mock server, and other development tooling.

This guide applies to the **dev server** mode. It explains how to point your app at a local clone of the XMLUI repo so that framework changes are reflected immediately without publishing or reinstalling.

## Prerequisites

Your app's `package.json` includes:

```json
{
  "dependencies": {
    "xmlui": "*"
  }
}
```

And the XMLUI repo is cloned as a sibling of your app:

```
parent/
├── xmlui/
│   └── xmlui/       ← the framework package
└── myApp/
    └── node_modules/
```

## Setup

1. Install dependencies (if you haven't already):

```bash
cd myApp
npm install
```

2. Replace the installed `xmlui` package with a symlink to your local clone:

```bash
rm -rf node_modules/xmlui
ln -s ../../xmlui/xmlui node_modules/xmlui
```

3. Verify:

```bash
ls -la node_modules/xmlui
# should show: node_modules/xmlui -> ../../xmlui/xmlui
```

## Notes

- The symlink is **relative**, so it works regardless of absolute path as long as the two repos are siblings.
- Running `npm install` will **overwrite the symlink** with a registry copy. Re-run the `ln -s` command afterward.
- Changes to the local XMLUI source are picked up immediately by Vite's dev server (HMR).
