import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve(process.cwd(), process.env.XMLUI_STATIC_ROOT ?? "dist-ssg");
const port = Number(process.env.XMLUI_SSG_PORT ?? process.env.XMLUI_STATIC_PORT ?? 8080);
const fallbackFile = process.env.XMLUI_SSG_FALLBACK ?? "200.html";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const resourceExtensions = new Set([
  ".css",
  ".csv",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".mjs",
  ".png",
  ".svg",
  ".txt",
  ".webp",
  ".woff",
  ".woff2",
  ".xml",
]);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const filePath = resolveRequest(pathname);
  if (!filePath) {
    response.writeHead(404, noCache({ "content-type": "text/plain; charset=utf-8" }));
    response.end("Not found");
    return;
  }
  response.writeHead(200, noCache({
    "content-type": mimeTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
  }));
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SSG preview server listening on http://127.0.0.1:${port} from ${root}`);
});

function resolveRequest(pathname) {
  const normalized = pathname || "index.html";
  const candidates = [
    normalized,
    join(normalized, "index.html"),
    `${normalized}.html`,
  ];
  for (const candidate of candidates) {
    const filePath = safeResolve(candidate);
    if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
      return filePath;
    }
  }
  if (resourceExtensions.has(extname(normalized).toLowerCase())) {
    return undefined;
  }
  return safeResolve(fallbackFile);
}

function safeResolve(relativePath) {
  const filePath = normalize(resolve(root, relativePath));
  if (!filePath.startsWith(`${root}${sep}`) && filePath !== root) {
    return undefined;
  }
  return filePath;
}

function noCache(headers) {
  return {
    ...headers,
    "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
  };
}

