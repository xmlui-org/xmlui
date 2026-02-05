# serve-optimized

A static file server for previewing optimized XMLUI applications with SPA fallback when there's no html file to the requested url. Proper resource 404 handling.

## Features

- 🚀 **Smart Routing**: Handles both exact file paths and clean URLs
- 🔄 **SPA Fallback**: Non-resource routes fallback to `index.html`
- 🚫 **Proper 404s**: Resource files (images, JSON, CSS, etc.) return real 404s
- 📝 **Request Logging**: detailed logging of all requests and responses
- 🔌 **Port Management**: Smart port handling with fallbacks

## Usage

After installing it (an `npm install` on the monorepo does that), the `serve-optimized` bin will be available for `npx`.

```bash
npx serve-optimized ./public

npx serve-optimized ./public --port 8080
```

### Port Behavior

- **No port specified**: Tries port 3000 first, then fallback to OS-assigned port
- **Explicit port**: Fails with error if port is taken (non-zero exit code)

## Routing Logic

The server follows this resolution order:

1. **Exact File Match**: `/assets/main.js` → serves `assets/main.js`
2. **Clean Path → Index**: `/blog/post` → tries `blog/post/index.html`
3. **Clean Path → HTML**: `/blog/post` → tries `blog/post.html`
4. **SPA Fallback**: Non-resource routes → serves `index.html`
5. **Resource 404**: Images, JSON, CSS, etc. → returns 404

## Cache Headers
