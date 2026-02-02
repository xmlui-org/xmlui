# @xmlui/serve-optimized

A static file server optimized for XMLUI applications with intelligent SPA fallback and proper resource 404 handling.

## Features

- 🚀 **Smart Routing**: Handles both exact file paths and clean URLs
- 🔄 **SPA Fallback**: Non-resource routes fallback to `index.html`
- 🚫 **Proper 404s**: Resource files (images, JSON, CSS, etc.) return real 404s
- 📝 **Request Logging**: detailed logging of all requests and responses
- 🔌 **Port Management**: Smart port handling with fallbacks
- ⚡ **Performance**: Optimized cache headers for different file types

## Installation

```bash
npm install @xmlui/serve-optimized
```

## Usage

### Basic Usage

```bash
serve-optimized ./public
```

### With Custom Port

```bash
serve-optimized ./public --port 8080
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

## Request Logging

When enabled, the server logs detailed information for each request:

```bash
[2024-02-05T12:00:00.000Z] INFO: Request served {
  method: 'GET',
  pathname: '/components/Avatar',
  statusCode: 200,
  contentType: 'text/html',
  fileSize: 314044,
  responseTime: '15ms',
  userAgent: 'Mozilla/5.0...'
}
```

### Log Levels

- **INFO**: Successful requests and routing decisions
- **WARN**: Suspicious requests (e.g., invalid paths)
- **ERROR**: Server errors and file access issues

## Resource Detection

Files with these extensions are treated as resources and return proper 404s:

- Images: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`
- Assets: `.js`, `.css`, `.woff`, `.woff2`, `.ttf`, `.eot`
- Data: `.json`, `.xml`, `.rss`, `.csv`
- Media: `.mp4`, `.mp3`, `.zip`, `.pdf`

## Cache Headers

Automatic cache headers based on file type:

- **Assets** (images, fonts): `public, max-age=31536000, immutable`
- **Content** (HTML, JS, CSS): `max-age=30, must-revalidate`
- **Dynamic**: `no-store, no-cache, must-revalidate, max-age=0`

## Development

```bash
# Watch mode for development
npm run dev

# Install locally
npm install
npm link
```

## Example Use Cases

### XMLUI Documentation Site

```bash
serve-optimized ./build/client
```

### SPA with API Fallbacks

```bash
serve-optimized ./dist --port 3000
```

### Static Blog with Clean URLs

```bash
serve-optimized ./public/blog --port 8080
```

## License

MIT
