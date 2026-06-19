import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(process.cwd(), "dist-production");
const port = Number(process.env.XMLUI_PRODUCTION_MEASURE_PORT ?? 5185);

if (!existsSync(join(root, "index.html"))) {
  throw new Error("dist-production/index.html was not found. Run npm run build:production first.");
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const relativePath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = normalize(resolve(root, relativePath));
  if (!filePath.startsWith(`${root}${sep}`) && filePath !== root) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  if (!existsSync(filePath)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

await new Promise((resolveListen) => server.listen(port, "127.0.0.1", resolveListen));

try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const examples = [
    {
      name: "counterComponents",
      readyText: "Standalone counter with components",
      actionRole: "button",
      actionName: "Standalone increment: 0",
      resultText: "Standalone increment: 1",
    },
    {
      name: "styleMutation",
      readyText: "Standalone style mutation",
      actionRole: "button",
      actionName: "Toggle standalone style",
      resultText: "Mode: compact",
    },
    {
      name: "routingState",
      readyText: "Standalone routing counter",
      actionRole: "button",
      actionName: "Count: 0",
      resultText: "Count: 1",
    },
  ];
  const measurements = [];

  for (const example of examples) {
    const startedAt = Date.now();
    await page.goto(`http://127.0.0.1:${port}/?example=${example.name}`);
    await page.getByText(example.readyText, { exact: true }).waitFor();
    const firstRenderMs = Date.now() - startedAt;
    const actionStartedAt = Date.now();
    await page.getByRole(example.actionRole, { name: example.actionName }).click();
    await page.getByText(example.resultText, { exact: true }).waitFor();
    measurements.push({
      example: example.name,
      firstRenderMs,
      interactionMs: Date.now() - actionStartedAt,
    });
  }

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    bundleBytes: await collectBundleBytes(root),
    examples: measurements,
  };
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}

async function collectBundleBytes(directory) {
  const entries = {};
  await visit(directory);
  return entries;

  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
        continue;
      }
      const relative = absolute.slice(directory.length + 1);
      entries[relative] = (await stat(absolute)).size;
    }
  }
}
