import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const DEFAULT_URL = "http://localhost:3000/docs/guides/layout";

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    scroll: true,
    checkpoints: 0,
    reloads: 0,
    reloadMode: "direct",
    reloadWaitMs: 5000,
    lifetimeDiagnostics: false,
    pagehideCleanup: false,
    chromeTrace: "",
    searchQueries: ["layout", "stack", "grid"],
    json: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--url") {
      args.url = argv[++i] || args.url;
    } else if (arg.startsWith("--url=")) {
      args.url = arg.slice("--url=".length);
    } else if (arg === "--no-scroll") {
      args.scroll = false;
    } else if (arg === "--checkpoints") {
      args.checkpoints = Number.parseInt(argv[++i] || "0", 10) || 0;
    } else if (arg.startsWith("--checkpoints=")) {
      args.checkpoints = Number.parseInt(arg.slice("--checkpoints=".length), 10) || 0;
    } else if (arg === "--reloads") {
      args.reloads = Number.parseInt(argv[++i] || "0", 10) || 0;
    } else if (arg.startsWith("--reloads=")) {
      args.reloads = Number.parseInt(arg.slice("--reloads=".length), 10) || 0;
    } else if (arg === "--reload-mode") {
      args.reloadMode = argv[++i] || args.reloadMode;
    } else if (arg.startsWith("--reload-mode=")) {
      args.reloadMode = arg.slice("--reload-mode=".length);
    } else if (arg === "--reload-wait-ms") {
      args.reloadWaitMs = Number.parseInt(argv[++i] || "5000", 10) || 5000;
    } else if (arg.startsWith("--reload-wait-ms=")) {
      args.reloadWaitMs = Number.parseInt(arg.slice("--reload-wait-ms=".length), 10) || 5000;
    } else if (arg === "--lifetime-diagnostics") {
      args.lifetimeDiagnostics = true;
    } else if (arg === "--pagehide-cleanup") {
      args.pagehideCleanup = true;
    } else if (arg === "--chrome-trace") {
      args.chromeTrace = argv[++i] || "";
    } else if (arg.startsWith("--chrome-trace=")) {
      args.chromeTrace = arg.slice("--chrome-trace=".length);
    } else if (arg === "--search") {
      args.searchQueries = (argv[++i] || "").split(",").map((item) => item.trim()).filter(Boolean);
    } else if (arg.startsWith("--search=")) {
      args.searchQueries = arg.slice("--search=".length).split(",").map((item) => item.trim()).filter(Boolean);
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: npm run measure:memory -w website -- [options]

Options:
  --url <url>             Page URL to measure. Default: ${DEFAULT_URL}
  --no-scroll             Skip the after-scroll activation measurement.
  --checkpoints <count>   Record samples at evenly spaced scroll positions.
  --reloads <count>       Reload the page and remeasure after each reload.
  --reload-mode <mode>    direct, about-blank, or new-page. Default: direct
  --reload-wait-ms <ms>   Wait time after each reload before measuring. Default: 5000
  --lifetime-diagnostics  Measure same-tab about:blank, page close, and new page behavior.
  --pagehide-cleanup      Diagnostic: clear shadow roots and adopted styles on pagehide.
  --chrome-trace <path>   Record a Chromium memory-infra trace to this JSON file.
  --search <a,b,c>        Search smoke queries. Default: layout,stack,grid
  --json                  Print only the JSON payload.
  --help                  Show this help.

The script expects a local production-like preview to already be running, for example:
  npm run preview-ssg -w website
`);
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getProcessTreeMemory(rootPid) {
  if (!rootPid) return null;
  try {
    const output = execFileSync("ps", ["-axo", "pid=,ppid=,rss=,command="], {
      encoding: "utf8",
    });
    const processes = output
      .trim()
      .split("\n")
      .map((line) => {
        const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/);
        if (!match) return null;
        return {
          pid: Number(match[1]),
          ppid: Number(match[2]),
          rssBytes: Number(match[3]) * 1024,
          command: match[4],
        };
      })
      .filter(Boolean);

    const byParent = new Map();
    for (const process of processes) {
      const children = byParent.get(process.ppid) || [];
      children.push(process);
      byParent.set(process.ppid, children);
    }

    const tree = [];
    const stack = [rootPid];
    const seen = new Set();
    while (stack.length > 0) {
      const pid = stack.pop();
      if (seen.has(pid)) continue;
      seen.add(pid);
      const process = processes.find((item) => item.pid === pid);
      if (process) {
        tree.push(process);
      }
      for (const child of byParent.get(pid) || []) {
        stack.push(child.pid);
      }
    }

    return {
      rootPid,
      processCount: tree.length,
      rssBytes: tree.reduce((sum, process) => sum + process.rssBytes, 0),
      topProcesses: tree
        .toSorted((a, b) => b.rssBytes - a.rssBytes)
        .slice(0, 8)
        .map((process) => ({
          pid: process.pid,
          ppid: process.ppid,
          rssBytes: process.rssBytes,
          command: process.command.slice(0, 160),
        })),
    };
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const browserServer = await chromium.launchServer({
    headless: true,
    args: ["--js-flags=--expose-gc"],
  });
  const browser = await chromium.connect(browserServer.wsEndpoint());
  const browserCdp = await browser.newBrowserCDPSession();

  try {
    let page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const browserPid = browserServer.process()?.pid;
    let cdp;

    async function attachCdpSession() {
      cdp = await page.context().newCDPSession(page);
      await cdp.send("Runtime.enable");
      await cdp.send("HeapProfiler.enable");
    }

    async function installPagehideCleanup() {
      if (!args.pagehideCleanup) return;
      await page.addInitScript(() => {
        window.addEventListener(
          "pagehide",
          () => {
            document.querySelectorAll("*").forEach((element) => {
              const shadowRoot = element.shadowRoot;
              if (!shadowRoot) return;
              try {
                shadowRoot.adoptedStyleSheets = [];
              } catch {}
              shadowRoot.textContent = "";
            });
          },
          { capture: true },
        );
      });
    }

    await installPagehideCleanup();
    await attachCdpSession();

    async function startChromeTrace() {
      if (!args.chromeTrace) return;
      await browserCdp.send("Tracing.start", {
        transferMode: "ReturnAsStream",
        traceConfig: {
          includedCategories: [
            "blink",
            "devtools.timeline",
            "disabled-by-default-memory-infra",
            "disabled-by-default-memory-infra.v8.code_stats",
            "disabled-by-default-v8.gc",
            "v8",
          ],
          memoryDumpConfig: {
            triggers: [
              { mode: "detailed", periodic_interval_ms: 5000 },
            ],
          },
        },
      });
    }

    async function requestChromeMemoryDump(label) {
      if (!args.chromeTrace) return;
      await browserCdp.send("Tracing.requestMemoryDump", {
        deterministic: false,
        levelOfDetail: "detailed",
      }).catch(() => {});
      await page.evaluate((dumpLabel) => {
        performance.mark(`xmlui-memory-dump:${dumpLabel}`);
      }, label).catch(() => {});
    }

    async function stopChromeTrace() {
      if (!args.chromeTrace) return;
      const tracingComplete = new Promise((resolve) => {
        browserCdp.once("Tracing.tracingComplete", resolve);
      });
      await browserCdp.send("Tracing.end");
      const event = await tracingComplete;
      const stream = event.stream;
      let traceJson = "";
      while (stream) {
        const chunk = await browserCdp.send("IO.read", { handle: stream });
        traceJson += chunk.data || "";
        if (chunk.eof) break;
      }
      if (stream) {
        await browserCdp.send("IO.close", { handle: stream }).catch(() => {});
      }
      writeFileSync(args.chromeTrace, traceJson);
    }

    async function openMeasuredPage() {
      page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await installPagehideCleanup();
      await attachCdpSession();
      await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await waitForSettled();
    }

    async function forceGc() {
      await cdp.send("HeapProfiler.collectGarbage");
      await page.evaluate(() => {
        globalThis.gc?.();
      });
      await cdp.send("HeapProfiler.collectGarbage");
    }

    async function waitForSettled() {
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    async function getHeapUsage() {
      await forceGc();
      return cdp.send("Runtime.getHeapUsage");
    }

    async function measure(label) {
      const heap = await getHeapUsage();
      const metrics = await page.evaluate(() => {
        function collectElements(root = document) {
          const elements = [];
          const visitRoot = (currentRoot) => {
            currentRoot.querySelectorAll("*").forEach((element) => {
              elements.push(element);
              if (element.shadowRoot) {
                visitRoot(element.shadowRoot);
              }
            });
          };
          visitRoot(root);
          return elements;
        }

        function reactFiberOf(element) {
          const key = Object.keys(element).find(
            (key) => key.startsWith("__reactFiber$") || key.startsWith("__reactInternalInstance$"),
          );
          return key ? element[key] : null;
        }

        function rootFiberOf(fiber) {
          let current = fiber;
          while (current?.return) {
            current = current.return;
          }
          return current;
        }

        function looksLikeComponentDef(value) {
          return !!value && typeof value === "object" && typeof value.type === "string" &&
            typeof value.uid === "string";
        }

        function scanValue(value, state, depth = 0, seen = new WeakSet()) {
          if (!value || typeof value !== "object" || depth > 8 || seen.has(value)) return;
          seen.add(value);
          if (looksLikeComponentDef(value)) {
            state.componentDefs += 1;
            if (value.debug) state.componentDefsWithDebug += 1;
            if (value.debug?.source) state.componentDefsWithDebugSource += 1;
            if (value.startToken) state.objectsWithStartToken += 1;
            if (value.endToken) state.objectsWithEndToken += 1;
          }
          if (Array.isArray(value)) {
            value.forEach((item) => scanValue(item, state, depth + 1, seen));
            return;
          }
          for (const [key, child] of Object.entries(value)) {
            if (key === "_owner" || key === "_store" || key === "ref" || key === "alternate") continue;
            scanValue(child, state, depth + 1, seen);
          }
        }

        const allElements = collectElements();
        const roots = new Set();
        allElements.forEach((element) => {
          const fiber = reactFiberOf(element);
          const root = fiber && rootFiberOf(fiber);
          if (root) roots.add(root);
        });

        const playgroundContainers = document.querySelectorAll('[class*="nestedAppContainer"]').length;
        const lazyMountedWrappers = document.querySelectorAll(
          '[data-nested-app-lazy-state="mounted"]',
        ).length;
        const lazyHibernatedWrappers = document.querySelectorAll(
          '[data-nested-app-lazy-state="hibernated"]',
        ).length;
        const shadowHosts = allElements.filter((element) => element.shadowRoot).length;
        const visibleShadowHosts = allElements.filter((element) => {
          if (!element.shadowRoot) return false;
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length;
        const styleElements = allElements.filter((element) => element.tagName === "STYLE");
        const styleBlocks = styleElements
          .map((element) => {
            const root = element.getRootNode();
            const text = element.textContent || "";
            return {
              root: root instanceof ShadowRoot ? "shadow" : "document",
              bytes: text.length,
              xmluiCssVarOccurrences: (text.match(/--xmlui-/g) || []).length,
              dataStyleHash: element.getAttribute("data-style-hash"),
              dataStyleRegistry: element.hasAttribute("data-style-registry"),
              preview: text.slice(0, 180).replace(/\s+/g, " "),
            };
          })
          .sort((a, b) => b.bytes - a.bytes);
        const styleTextBytesIncludingShadow = styleBlocks.reduce((sum, block) => sum + block.bytes, 0);
        const xmluiCssVarOccurrencesInStyles = styleBlocks.reduce(
          (sum, block) => sum + block.xmluiCssVarOccurrences,
          0,
        );
        const state = {
          reactFibers: 0,
          componentDefs: 0,
          componentDefsWithDebug: 0,
          componentDefsWithDebugSource: 0,
          objectsWithStartToken: 0,
          objectsWithEndToken: 0,
          playgroundContainers,
          lazyMountedWrappers,
          lazyHibernatedWrappers,
          shadowHosts,
          visibleShadowHosts,
          inactivePlaygrounds: Math.max(0, playgroundContainers - visibleShadowHosts),
          lazyContainerNodes: allElements.filter((element) => {
            const className = String(element.className || "");
            return className.includes("nestedAppPlaceholder");
          }).length,
          hiddenSplitMarkdown: document.querySelectorAll('[class*="splitViewMarkdown"][class*="hidden"]').length,
          codeBlocks: document.querySelectorAll(".global-codeBlock, [class*='codeBlock']").length,
          dataComponentType: document.querySelectorAll("[data-component-type]").length,
          domElementsIncludingShadow: allElements.length,
          styleTagsIncludingShadow: styleElements.length,
          styleTextBytesIncludingShadow,
          xmluiCssVarOccurrencesInStyles,
          largestStyleBlocks: styleBlocks.slice(0, 8),
        };

        const seenFibers = new Set();
        function walk(fiber) {
          if (!fiber || seenFibers.has(fiber)) return;
          seenFibers.add(fiber);
          state.reactFibers += 1;
          scanValue(fiber.memoizedProps, state);
          walk(fiber.child);
          walk(fiber.sibling);
        }
        roots.forEach((root) => walk(root.child));

        const scrollCandidates = [...document.querySelectorAll("*")]
          .filter((element) => element.scrollHeight > element.clientHeight + 100)
          .map((element) => ({
            tag: element.tagName,
            className: String(element.className || ""),
            scrollHeight: element.scrollHeight,
            clientHeight: element.clientHeight,
            scrollTop: element.scrollTop,
          }))
          .sort((a, b) => b.scrollHeight - a.scrollHeight);

        return {
          ...state,
          mainScroller: scrollCandidates[0] || null,
        };
      });

      await requestChromeMemoryDump(label);
      return { label, heap, processMemory: getProcessTreeMemory(browserPid), metrics };
    }

    async function scrollThroughPage() {
      await page.evaluate(async () => {
        const candidates = [...document.querySelectorAll("*")]
          .filter((element) => element.scrollHeight > element.clientHeight + 100)
          .sort((a, b) => b.scrollHeight - a.scrollHeight);
        const scroller = candidates[0] || document.scrollingElement || document.documentElement;
        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        const step = Math.max(250, Math.floor(scroller.clientHeight * 0.75));
        for (let y = 0; y <= maxScroll + step; y += step) {
          scroller.scrollTop = Math.min(y, maxScroll);
          scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      });
      await waitForSettled();
    }

    async function scrollToRatio(ratio) {
      const scrollInfo = await page.evaluate(async (ratio) => {
        const candidates = [...document.querySelectorAll("*")]
          .filter((element) => element.scrollHeight > element.clientHeight + 100)
          .sort((a, b) => b.scrollHeight - a.scrollHeight);
        const scroller = candidates[0] || document.scrollingElement || document.documentElement;
        const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        scroller.scrollTop = Math.round(maxScroll * ratio);
        scroller.dispatchEvent(new Event("scroll", { bubbles: true }));
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          requestedRatio: ratio,
          scrollTop: scroller.scrollTop,
          maxScroll,
          scrollHeight: scroller.scrollHeight,
          clientHeight: scroller.clientHeight,
        };
      }, ratio);
      await waitForSettled();
      return scrollInfo;
    }

    async function measureCheckpoints(count) {
      if (!count || count < 2) return [];
      const samples = [];
      for (let index = 1; index <= count; index++) {
        const ratio = index / count;
        const scrollInfo = await scrollToRatio(ratio);
        const sample = await measure(`checkpoint-${index}/${count}`);
        samples.push({ ...sample, scrollInfo });
      }
      return samples;
    }

    async function measureReloads(count) {
      if (!count || count < 1) return [];
      const samples = [];
      for (let index = 1; index <= count; index++) {
        if (args.reloadMode === "direct") {
          await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
          await waitForSettled();
        } else if (args.reloadMode === "about-blank") {
          await page.goto("about:blank", { waitUntil: "domcontentloaded", timeout: 60000 });
          await waitForSettled();
          await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 60000 });
          await waitForSettled();
        } else if (args.reloadMode === "new-page") {
          await page.close();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await openMeasuredPage();
        } else {
          throw new Error(`Unknown --reload-mode "${args.reloadMode}"`);
        }
        if (args.scroll) {
          await scrollThroughPage();
        }
        if (args.reloadWaitMs > 0) {
          await page.waitForTimeout(args.reloadWaitMs);
        }
        samples.push(await measure(`after-reload-${index}`));
      }
      return samples;
    }

    async function searchSmoke(queries) {
      const results = [];
      if (queries.length === 0) return results;

      for (const query of queries) {
        await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K").catch(() => {});
        await page.waitForTimeout(200);
        const openSearchButton = page.getByText("Open search").first();
        if (await openSearchButton.isVisible().catch(() => false)) {
          await openSearchButton.click().catch(() => {});
          await page.waitForTimeout(200);
        }
        const input = page.locator("input[type='search'], input[placeholder*='Search' i], input[aria-label*='Search' i]").first();
        const foundInput = await input.count().then((count) => count > 0).catch(() => false);
        if (!foundInput) {
          results.push({ query, ok: false, reason: "search input not found" });
          continue;
        }
        await input.fill(query).catch(() => {});
        await page.waitForTimeout(300);
        const bodyText = await page.locator("body").innerText({ timeout: 2000 }).catch(() => "");
        results.push({ query, ok: bodyText.toLowerCase().includes(query.toLowerCase()) });
        await page.keyboard.press("Escape").catch(() => {});
      }
      return results;
    }

    async function processOnlySample(label) {
      return {
        label,
        processMemory: getProcessTreeMemory(browserPid),
      };
    }

    async function measureLifetimeDiagnostics() {
      const samples = [];

      await page.goto("about:blank", { waitUntil: "domcontentloaded", timeout: 60000 });
      await waitForSettled();
      samples.push(await measure("after-about-blank"));

      await page.close();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      samples.push(await processOnlySample("after-page-close"));

      await openMeasuredPage();
      samples.push(await measure("new-page-in-same-browser-initial"));
      if (args.scroll) {
        await scrollThroughPage();
        samples.push(await measure("new-page-in-same-browser-after-scroll"));
      }

      return samples;
    }

    await startChromeTrace();
    let output;
    try {
      await page.goto(args.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await waitForSettled();
      const initial = await measure("initial");
      const search = await searchSmoke(args.searchQueries);
      const checkpoints = args.scroll ? await measureCheckpoints(args.checkpoints) : [];
      const afterScroll = args.scroll ? (await scrollThroughPage(), await measure("after-scroll")) : null;
      const reloads = await measureReloads(args.reloads);
      const lifetimeDiagnostics = args.lifetimeDiagnostics
        ? await measureLifetimeDiagnostics()
        : [];

      output = {
        url: args.url,
        measuredAt: new Date().toISOString(),
        initial,
        checkpoints,
        afterScroll,
        reloads,
        lifetimeDiagnostics,
        search,
        chromeTrace: args.chromeTrace || undefined,
      };
    } finally {
      await stopChromeTrace();
    }

    if (args.json) {
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log(`Memory measurement for ${args.url}`);
      console.log("");
      printSample(initial);
      if (checkpoints.length > 0) printCheckpointSummary(initial, checkpoints);
      if (afterScroll) printSample(afterScroll);
      reloads.forEach((sample) => printSample(sample));
      lifetimeDiagnostics.forEach((sample) => printSample(sample));
      if (search.length > 0) {
        console.log("");
        console.log("Search smoke:");
        search.forEach((result) => {
          console.log(`- ${result.query}: ${result.ok ? "ok" : `failed (${result.reason || "query not observed"})`}`);
        });
      }
      console.log("");
      console.log(JSON.stringify(output, null, 2));
    }
  } finally {
    await browser.close();
    await browserServer.close();
  }
}

function printSample(sample) {
  if (!sample.heap) {
    console.log(`${sample.label}:`);
    if (sample.processMemory) {
      console.log(`- Process RSS: ${formatBytes(sample.processMemory.rssBytes)}`);
      console.log(`- Process count: ${sample.processMemory.processCount}`);
    }
    return;
  }
  const combined = sample.heap.usedSize + sample.heap.embedderHeapUsedSize;
  console.log(`${sample.label}:`);
  console.log(`- JS heap: ${formatBytes(sample.heap.usedSize)}`);
  console.log(`- Embedder heap: ${formatBytes(sample.heap.embedderHeapUsedSize)}`);
  console.log(`- Combined: ${formatBytes(combined)}`);
  console.log(`- React fibers: ${sample.metrics.reactFibers}`);
  console.log(`- ComponentDefs: ${sample.metrics.componentDefs}`);
  console.log(`- Shadow hosts: ${sample.metrics.visibleShadowHosts}/${sample.metrics.shadowHosts}`);
  console.log(`- Style text: ${formatBytes(sample.metrics.styleTextBytesIncludingShadow)} across ${sample.metrics.styleTagsIncludingShadow} style tags`);
  console.log(`- XMLUI CSS var refs: ${sample.metrics.xmluiCssVarOccurrencesInStyles}`);
  console.log(`- Scroll height: ${sample.metrics.mainScroller?.scrollHeight ?? "n/a"}`);
  if (sample.processMemory) {
    console.log(`- Process RSS: ${formatBytes(sample.processMemory.rssBytes)}`);
  }
}

function printCheckpointSummary(initial, checkpoints) {
  console.log("checkpoints:");
  let previous = initial;
  checkpoints.forEach((sample) => {
    const combined = sample.heap.usedSize + sample.heap.embedderHeapUsedSize;
    const previousCombined = previous.heap.usedSize + previous.heap.embedderHeapUsedSize;
    const activated = sample.metrics.visibleShadowHosts;
    const previousActivated = previous.metrics.visibleShadowHosts;
    console.log(
      `- ${sample.label}: scrollTop=${sample.metrics.mainScroller?.scrollTop ?? "n/a"}, ` +
      `active=${activated}, combined=${formatBytes(combined)}, ` +
      `delta=${formatBytes(combined - previousCombined)}, ` +
      `newActive=${activated - previousActivated}`,
    );
    previous = sample;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
