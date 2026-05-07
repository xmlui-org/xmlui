# Installation

This page covers different ways to install and set up your project.

## Using create-xmlui-app

The fastest way to start a new project is with the official scaffolding tool:

```bash
npx create-xmlui-app my-app --template docs
cd my-app
npm start
```

## Manual Installation

If you prefer to set up a project by hand:

### 1. Create a directory

```bash
mkdir my-docs && cd my-docs
npm init -y
```

### 2. Install XMLUI and the docs packages

```bash
npm install xmlui xmlui-search xmlui-docs-blocks
```

### 3. Create the entry point

Create `index.ts`:

```ts
import { startApp } from "xmlui";
import search from "xmlui-search";
import docsBlocks from "xmlui-docs-blocks";

export const runtime = import.meta.glob(`/src/**`, { eager: true });
const usedExtensions = [search, docsBlocks];
startApp(runtime, usedExtensions);
```

### 4. Create the markup

Create `src/Main.xmlui`:

```xml
<App>
  <Pages>
    <Page url="/">
      <DocumentPage content="{appGlobals.docsContent['introduction']}" />
    </Page>
  </Pages>
</App>
```

### 5. Add some Markdown

Create `content/docs/introduction.md` and write your first page.

### 6. Start the dev server

```bash
npx xmlui start
```

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js     | 18.x    | 20.x+       |
| npm         | 9.x     | 10.x+       |
| Browser     | Chrome 100+, Firefox 100+, Safari 15+ | Latest |

## Troubleshooting

**Port already in use**
```bash
npx xmlui start --port 3001
```

**Missing dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```
