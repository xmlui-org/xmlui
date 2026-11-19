// Load one URL in Playwright's WebKit and measure the renderer's memory as it settles.
//
//   node measure.cjs <url> <label> [--settle 180] [--every 30] [--headless]
//
// Prints one JSON line: the web-content process's macOS `footprint` sampled every
// `--every` seconds for `--settle` seconds, the median of the last three samples,
// the reclaimable total and the dirty memory by category at the end, the DOM size,
// and whether the page rendered.
//
// `footprint` (not RSS) is what Activity Monitor shows and what memory pressure
// acts on. RSS also counts memory WebKit freed but hasn't returned to macOS,
// which `footprint` reports separately as "reclaimable".

const { execFileSync } = require("node:child_process");
const { webkit } = require("playwright");

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : dflt;
}
const url = process.argv[2];
const label = process.argv[3];
const settle = Number(arg("--settle", "180"));
const every = Number(arg("--every", "30"));
const headless = process.argv.includes("--headless");

// --- Web-content processes of Playwright's WebKit build (never the user's Safari)
function webContentPids() {
  try {
    const out = execFileSync("pgrep", ["-f", "ms-playwright/webkit.*WebContent"], { encoding: "utf8" });
    return new Set(out.split("\n").filter(Boolean).map(Number));
  } catch {
    return new Set();
  }
}

function toMB(n, unit) {
  const v = Number(n);
  if (unit === "GB") return v * 1024;
  if (unit === "MB") return v;
  if (unit === "KB") return v / 1024;
  return v / 1048576; // B
}

function footprint(pid) {
  const out = execFileSync("footprint", ["-p", String(pid)], { encoding: "utf8" });
  const total = /Footprint:\s*([\d.]+)\s*(B|KB|MB|GB)/.exec(out);
  const categories = [];
  let reclaimableMB = 0;
  const size = "([\\d.]+)\\s*(B|KB|MB|GB)";
  const row = new RegExp(`^\\s*${size}\\s+${size}\\s+${size}\\s+\\d+\\s+(.+)$`);
  for (const line of out.split("\n")) {
    const m = row.exec(line);
    if (!m || m[7].trim() === "TOTAL") continue;
    const dirty = toMB(m[1], m[2]);
    reclaimableMB += toMB(m[5], m[6]);
    categories.push({ category: m[7].trim(), dirtyMB: Math.round(dirty * 10) / 10 });
  }
  return {
    mb: total ? Math.round(toMB(total[1], total[2])) : null,
    reclaimableMB: Math.round(reclaimableMB),
    categories,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const before = webContentPids();
  const browser = await webkit.launch({ headless });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(url, { waitUntil: "networkidle" });
  const rendered = await page
    .getByText("Ticks: 0")
    .waitFor({ timeout: 60_000 })
    .then(() => true)
    .catch(() => false);

  // --- This page's renderer: a new web-content process (the largest, if several)
  const fresh = [...webContentPids()].filter((p) => !before.has(p));
  let pid = null;
  let best = -1;
  for (const p of fresh) {
    const { mb } = footprint(p);
    if (mb !== null && mb > best) {
      best = mb;
      pid = p;
    }
  }
  if (!pid) {
    console.log(JSON.stringify({ label, error: "no WebContent process found", fresh }));
    await browser.close();
    process.exit(1);
  }

  const samples = [];
  for (let t = 0; t <= settle; t += every) {
    if (t > 0) await sleep(every * 1000);
    samples.push(footprint(pid).mb);
  }
  const last3 = samples.slice(-3).sort((a, b) => a - b);
  const final = footprint(pid);
  const domNodes = await page.evaluate(() => document.getElementsByTagName("*").length);
  console.log(
    JSON.stringify({
      label,
      pid,
      rendered,
      errors,
      domNodes,
      samples,
      medianMB: last3[Math.floor(last3.length / 2)],
      reclaimableMB: final.reclaimableMB,
      top: final.categories.sort((a, b) => b.dirtyMB - a.dirtyMB).slice(0, 8),
    }),
  );
  await browser.close();
})();
