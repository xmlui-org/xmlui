import type { Page } from "@playwright/test";
import { expect, test } from "../src/testing/fixtures";

// Litmus tests 1–4 of #3942: one `render:pass` trace entry per pass of App, a
// UDC or an explicit container, with its cause. Each test counts passes against
// a total from the same trace, so an absent pass is shown, not assumed.
// Durations are recorded as annotations, not asserted (#3942, F4).

const ROWS = `<Items data="{Array.from({ length: 300 }, (_, i) => i)}"><HStack><Text value="{$item + 1}" /><Button size="xs" label="{$item % 2 ? 'odd' : 'even'}" /><Text value="{($item * 3).toFixed(1)}" /></HStack></Items>`;

const TICKER = `<Timer interval="10" enabled="{n &lt; 30}" onTick="if (n === 0) t0 = Date.now(); n = n + 1; if (n === 30) t1 = Date.now();" />
  <Text value="RESULT n={n} ms={t1 - t0}" />`;

const VERBOSE = { xmluiConfig: { xsVerbose: true, xsVerboseLogMax: 20000 } };

type Pass = {
  passId: number;
  parentPassId?: number;
  component: string;
  traceId?: string;
  durationMs: number;
  cause: Array<{ kind: string; keys?: string[]; names?: string[] }>;
  folded?: Array<{ component: string; count: number }>;
  rendered?: Record<string, number>;
  renderedCount?: number;
};

async function passes(page: Page): Promise<Pass[]> {
  return page.evaluate(() =>
    ((window as any)._xsLogs ?? []).filter((e: any) => e.kind === "render:pass"),
  );
}

const hasStateKey = (p: Pass, key: string) =>
  p.cause.some((c) => c.kind === "state" && c.keys?.includes(key));

function annotateDurations(label: string, list: Pass[]) {
  const sorted = list.map((p) => p.durationMs).sort((a, b) => a - b);
  test.info().annotations.push({
    type: "durationMs",
    description: `${label}: n=${sorted.length} median=${sorted[Math.floor(sorted.length / 2)]}`,
  });
}

async function tickTraces(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    ((window as any)._xsLogs ?? [])
      .filter((e: any) => e.kind === "handler:start" && e.eventName === "tick" && e.componentType === "Timer")
      .map((e: any) => e.traceId),
  );
}

/**
 * One pass per assignment, except that React may merge back-to-back ticks into
 * one render when the main thread is busy (seen under parallel test workers,
 * never in a lone browser). So: at most 30 passes, at least 25, and each pass
 * carrying a trace id carries a tick handler's. Ticks don't get unique trace ids
 * (later ones share an interaction trace), so the trace check is membership only.
 * The number of merged ticks is annotated.
 */
async function expectOnePassPerTick(page: Page, list: Pass[]) {
  const traces = new Set(await tickTraces(page));
  expect(list.length).toBeGreaterThanOrEqual(25);
  expect(list.length).toBeLessThanOrEqual(30);
  // --- A tick that ran under the startup trace has no traceId once startup has
  // --- completed (getCurrentTrace never returns the startup trace), so a missing
  // --- traceId is allowed; one that is present must be a tick handler's.
  expect(list.filter((p) => p.traceId && !traces.has(p.traceId))).toEqual([]);
  test.info().annotations.push({ type: "mergedTicks", description: String(30 - list.length) });
}

async function waitForTicks(page: Page) {
  await expect(page.getByText(/RESULT n=30 ms=[1-9]/)).toBeVisible({ timeout: 60_000 });
}

test.describe("render:pass trace (#3942)", () => {
  test.describe.configure({ timeout: 90_000 });

  // --- _xsLogs can outlive a test within a worker; each test counts only its own app's passes
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      delete (window as any)._xsLogs;
    });
  });

  test("litmus 1: inline list, one App pass per assignment, cause n", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.n="{0}" var.t0="{0}" var.t1="{0}">
  ${TICKER}
  ${ROWS}
</App>`,
      VERBOSE,
    );
    await waitForTicks(page);
    const ticks = (await passes(page)).filter((p) => p.component === "App" && hasStateKey(p, "n"));
    await expectOnePassPerTick(page, ticks);
    // --- The 300 rows render inside each App pass, folded into it
    for (const p of ticks) {
      expect(p.folded?.find((g) => g.component === "HStack")?.count).toBe(300);
      // --- ...and every row's components are counted toward the App pass
      expect(p.rendered).toMatchObject({ HStack: 300, Button: 300 });
      expect(p.rendered?.Text).toBeGreaterThanOrEqual(600);
    }
    annotateDurations("App passes", ticks);
  });

  test("litmus 2: list in a UDC with no props, App passes and no UDC pass", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.n="{0}" var.t0="{0}" var.t1="{0}">
  ${TICKER}
  <Heavy />
</App>`,
      { ...VERBOSE, components: [`<Component name="Heavy">${ROWS}</Component>`] },
    );
    await waitForTicks(page);
    const all = await passes(page);
    const ticks = all.filter((p) => p.component === "App" && hasStateKey(p, "n"));
    await expectOnePassPerTick(page, ticks);
    const tickIds = new Set(ticks.map((p) => p.passId));
    expect(all.filter((p) => p.component === "Heavy" && tickIds.has(p.parentPassId!))).toHaveLength(
      0,
    );
    // --- The instrument did record Heavy: its mount is in the same trace
    expect(all.some((p) => p.component === "Heavy" && p.cause[0].kind === "mount")).toBe(true);
    // --- App passes render only App's own few components; the rows stay behind the UDC
    for (const p of ticks) {
      expect(p.rendered?.HStack).toBeUndefined();
      expect(p.renderedCount).toBeLessThan(10);
    }
    // --- The rows were counted once, in Heavy's mount pass
    const heavyMount = all.find((p) => p.component === "Heavy" && p.cause[0].kind === "mount");
    expect(heavyMount?.rendered?.HStack).toBe(300);
    annotateDurations("App passes", ticks);
  });

  test("litmus 3: UDC with handler attributes, no UDC pass per assignment", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.n="{0}" var.t0="{0}" var.t1="{0}">
  ${TICKER}
  <HeavyEv onNow="() => 42.5" onNowBlock="() => { return 7; }" />
</App>`,
      {
        ...VERBOSE,
        components: [
          `<Component name="HeavyEv" var.got="(none)">
  <Timer once="true" initialDelay="200" interval="200" onTick="got = emitEvent('now') + ' / ' + emitEvent('nowBlock')" />
  <Text value="RESULT child got={got}" />
  ${ROWS}
</Component>`,
        ],
      },
    );
    await waitForTicks(page);
    await expect(page.getByText(/RESULT child got=/)).not.toHaveText(/\(none\)/);
    const all = await passes(page);
    const ticks = all.filter((p) => p.component === "App" && hasStateKey(p, "n"));
    await expectOnePassPerTick(page, ticks);
    const tickIds = new Set(ticks.map((p) => p.passId));
    const udc = all.filter((p) => p.component === "HeavyEv");
    // --- on* attributes are events, not props: an App pass never re-renders the UDC.
    // --- (Its own `got` pass may share a commit with an App pass, so that pass can
    // --- carry an App parentPassId; its cause is still its own state.)
    const fromParent = (p: Pass) => p.cause.some((c) => c.kind === "parent" || c.kind === "props");
    expect(udc.filter((p) => tickIds.has(p.parentPassId!) && fromParent(p))).toHaveLength(0);
    expect(udc.filter((p) => p.cause.some((c) => c.kind === "props"))).toHaveLength(0);
    // --- The one HeavyEv pass in the window is its own Timer assigning `got`
    const own = udc.filter((p) => hasStateKey(p, "got"));
    expect(own).toHaveLength(1);
    annotateDurations("App passes", ticks);
    annotateDurations("HeavyEv got pass", own);
  });

  test("litmus 4: a child method assigns the child's var, child pass and no parent pass", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.done="{false}" var.t0="{0}" var.t1="{0}">
  <Timer interval="10" enabled="{!done}" onTick="const c = clock.tick(); if (c === 1) t0 = Date.now(); if (c === 30) { t1 = Date.now(); done = true; }" />
  <Text value="RESULT ms={t1 - t0}" />
  <Clock id="clock" />
  ${ROWS}
</App>`,
      {
        ...VERBOSE,
        components: [
          `<Component name="Clock" var.count="{0}">
  <method name="tick">() => { count = count + 1; return count; }</method>
  <Text value="clock {count}" />
</Component>`,
        ],
      },
    );
    await expect(page.getByText(/RESULT ms=[1-9]/)).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText("clock 30")).toBeVisible();
    const all = await passes(page);
    const clockTicks = all.filter((p) => p.component === "Clock" && hasStateKey(p, "count"));
    await expectOnePassPerTick(page, clockTicks);
    // --- App passes only for its own vars, never for the child's count
    const app = all.filter((p) => p.component === "App" && p.cause[0].kind !== "mount");
    expect(app.filter((p) => hasStateKey(p, "count"))).toHaveLength(0);
    expect(clockTicks.filter((p) => p.parentPassId !== undefined)).toHaveLength(0);
    annotateDurations("Clock passes", clockTicks);
  });

  test("no render:pass entries when xsVerbose is off", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App var.n="{0}" var.t0="{0}" var.t1="{0}">
  ${TICKER}
  <Text value="{n}" />
</App>`,
    );
    await waitForTicks(page);
    expect(await passes(page)).toHaveLength(0);
  });
});
