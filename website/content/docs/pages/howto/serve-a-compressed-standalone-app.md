# Serve a compressed standalone app

Serve `xmlui-standalone.umd.js.br` or `xmlui-standalone.umd.js.gz` automatically while keeping the normal script URL in `index.html`.

A standalone XMLUI app starts by loading the XMLUI runtime with a regular `<script>` tag. The browser does not need to know that a compressed runtime file exists. Instead, the server receives a request for `xmlui-standalone.umd.js`, checks the browser's `Accept-Encoding` header, and can respond with a precompressed sibling file such as `xmlui-standalone.umd.js.br` or `xmlui-standalone.umd.js.gz`.

The response still represents the original JavaScript resource. The server must send the compressed bytes with the matching `Content-Encoding` header, keep the JavaScript content type, and include `Vary: Accept-Encoding` so shared caches do not mix compressed and uncompressed responses. The browser decompresses the response before executing it.

## Build the runtime files

The standalone runtime build creates the plain runtime and its precompressed variants:

```bash
npm --prefix xmlui run build:xmlui-standalone
```

Copy the generated files into your standalone app next to each other:

```text
dist/
  index.html
  Main.xmlui
  config.json
  components/
  xmlui/
    xmlui-standalone.umd.js
    xmlui-standalone.umd.js.gz
    xmlui-standalone.umd.js.br
```

Keep the uncompressed `.js` file. It is the canonical URL, and it is the fallback for clients or tools that do not request gzip or Brotli.

## Point index.html at the plain URL

Do not put `.gz` or `.br` in the script `src`. Use the ordinary runtime URL:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>XMLUI Standalone App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="/xmlui/xmlui-standalone.umd.js"></script>
  </body>
</html>
```

The server decides whether that request is answered by the `.br`, `.gz`, or plain `.js` file.

## Serve with http-server

The `http-server` package can serve precompressed sibling files when gzip and Brotli support are enabled:

```bash
npx http-server ./dist --gzip --brotli -p 8080 -c-1
```

The short flags are equivalent:

```bash
npx http-server ./dist -g -b -p 8080 -c-1
```

With both flags enabled, `http-server` tries Brotli first when the browser accepts it, then gzip, then the uncompressed file. The `-c-1` flag disables local caching while you test header behavior.

Check the response headers with `curl`:

```bash
curl -I -H "Accept-Encoding: br" \
  http://localhost:8080/xmlui/xmlui-standalone.umd.js
```

The response should include headers like these:

```http
HTTP/1.1 200 OK
Content-Type: application/javascript
Content-Encoding: br
Vary: Accept-Encoding
```

Ask for gzip to test the gzip path:

```bash
curl -I -H "Accept-Encoding: gzip" \
  http://localhost:8080/xmlui/xmlui-standalone.umd.js
```

## Serve with Express

If your app already uses Express, use middleware that understands precompressed static files. The `express-static-gzip` package serves `.gz` files by default and can serve Brotli files when `enableBrotli` is enabled:

```bash
npm install express express-static-gzip
```

```js
import express from "express";
import expressStaticGzip from "express-static-gzip";

const app = express();

app.use(
  "/",
  expressStaticGzip("dist", {
    enableBrotli: true,
    orderPreference: ["br", "gzip"],
  }),
);

app.listen(8080, () => {
  console.log("Listening on http://localhost:8080");
});
```

This keeps `index.html` unchanged. Requests for `/xmlui/xmlui-standalone.umd.js` are matched against the files in `dist/xmlui/`, and the middleware chooses a compressed sibling file only when the request advertises support for that encoding.

## Other Node.js static servers

Some Node.js static servers compress responses on the fly instead of serving the `.br` and `.gz` files generated at build time. That still reduces transfer size, but it spends CPU during requests and may use different compression settings than the build.

For example, Express' `compression` middleware and packages such as `node-http-server --compression` negotiate gzip or Brotli dynamically:

```js
import compression from "compression";
import express from "express";

const app = express();

app.use(compression());
app.use(express.static("dist"));

app.listen(8080);
```

Use this pattern when you cannot precompress during the build. Use `http-server --gzip --brotli`, `express-static-gzip`, a CDN, or a reverse proxy when you want to serve the generated `.br` and `.gz` assets directly.

Common static servers such as Vercel's `serve` are useful for quick local file serving. Before relying on them for this exact pattern, check that the package version or hosting layer explicitly supports precompressed sibling-file negotiation. If it does not, keep the plain script URL and put a compression-aware server, proxy, or CDN in front of it.

## Key points

**Keep the script URL uncompressed**: Reference `/xmlui/xmlui-standalone.umd.js` from `index.html`. Let the server negotiate which file bytes to send.

**Prefer Brotli when available**: Brotli usually produces a smaller JavaScript payload than gzip. Keep gzip as a compatibility fallback.

**Set the right headers**: A precompressed JavaScript response needs `Content-Encoding: br` or `Content-Encoding: gzip`, `Content-Type: application/javascript`, and `Vary: Accept-Encoding`.

**Keep the plain runtime file**: The `.js` file is needed for clients that do not accept compressed encodings and for tooling that reads files directly from disk.

**Do not mix this up with on-the-fly compression**: Precompressed files are created during the build and served as-is. Runtime compression middleware compresses each eligible response while the server is running.

---

## See also

- [Lazy-load images for performance](/docs/howto/lazy-load-images-for-performance) - reduce initial page weight for image-heavy pages
- [Render Markdown content as a page](/docs/howto/render-markdown-content-as-a-page) - serve static content files into an XMLUI app
- [Hosted Deployment](/docs/guides/hosted-deployment) - deploy XMLUI apps to hosting environments
