import { spawn } from "node:child_process";

const port = Number(process.env.XMLUI_PREVIEW_SSG_TEST_PORT ?? 43219);
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["../xmlui/scripts/preview-ssg.mjs"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    XMLUI_SSG_PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

try {
  await waitForPreview();

  await assertResponse("/", {
    status: 200,
    includes: ["data-xmlui-component=\"App\"", "Display milestone"],
    contentType: "text/html",
  });
  await assertResponse("/docs/intro", {
    status: 200,
    includes: ["data-xmlui-component=\"App\"", "Introduction"],
    contentType: "text/html",
  });
  await assertResponse("/docs/reference/components/Table", {
    status: 200,
    includes: ["data-xmlui-component=\"App\"", "Table"],
    contentType: "text/html",
  });
  await assertResponse("/unknown-preview-route", {
    status: 200,
    includes: ["data-xmlui-component=\"App\""],
    contentType: "text/html",
  });
  await assertResponse("/feed.rss", {
    status: 200,
    includes: ["<title>XMLUI Blog</title>"],
    contentType: "application/rss+xml",
  });
  await assertResponse("/sitemap.xml", {
    status: 200,
    includes: ["https://docs.xmlui.org/docs"],
    contentType: "application/xml",
  });
  await assertResponse("/resources/logo.svg", {
    status: 200,
    includes: ["<svg"],
    contentType: "image/svg+xml",
  });
  await assertResponse("/missing-preview-resource.css", {
    status: 404,
    includes: ["Not found"],
    contentType: "text/plain",
  });
  await assertResponse("/missing-preview-resource.rss", {
    status: 404,
    includes: ["Not found"],
    contentType: "text/plain",
  });

  console.log(`Verified SSG preview server at ${baseUrl}.`);
} finally {
  server.kill();
}

async function waitForPreview() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    if (server.exitCode !== null) {
      throw new Error(`SSG preview server exited early with code ${server.exitCode}:\n${output}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server starts listening.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for SSG preview server:\n${output}`);
}

async function assertResponse(path, { status, includes, contentType }) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();
  if (response.status !== status) {
    throw new Error(`${path}: expected status ${status}, got ${response.status}`);
  }
  const actualContentType = response.headers.get("content-type") ?? "";
  if (!actualContentType.includes(contentType)) {
    throw new Error(`${path}: expected content-type to include ${contentType}, got ${actualContentType}`);
  }
  for (const marker of includes) {
    if (!text.includes(marker)) {
      throw new Error(`${path}: expected response body to include ${JSON.stringify(marker)}`);
    }
  }
}
