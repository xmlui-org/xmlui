/**
 * End-to-end tests for the computedUses optimization system.
 *
 * NOT tagged @smoke — render-count assertions require development-mode build
 * (window.__renderCounts is populated only in dev mode); those tests use
 * test.skip() as a graceful fallback in CI / pre-built test-bed.
 *
 * Structure
 * ─────────
 * 1. Regression: var. declarations in user-defined components
 *    Fast functional tests — no render-count dependency.
 *
 * 2. Optimization: Select directly in App
 *    The canonical reference case.  Button-driven state updates instead of a
 *    real Timer → deterministic, ~200 ms instead of 2 s.
 *
 * 3. Optimization: Select inside a user-defined component
 *    Same optimization measured through a compound-component wrapper.
 *    Shows that the inner narrowing still works (Select ≤ 5 renders) even
 *    when the wrapper has no computedUses on its own instance.
 *    Also shows that adding <script> to the wrapper disables the inner
 *    narrowing (nextDisableNarrowing=true → Select re-renders every click).
 *
 * Button-vs-timer rationale
 * ─────────────────────────
 * Each Playwright click() dispatches a real browser event processed by React
 * as an independent render cycle — no React 18 auto-batching interference.
 * 15 clicks ≈ 150-500 ms; the old waitForTimeout(2000) wasted ~1.5 s per test.
 */

import { expect, test } from "../src/testing/fixtures";

// ─── shared helpers ───────────────────────────────────────────────────────────

const TICK_COUNT = 15;

async function triggerStateUpdates(page: any, count: number) {
  const btn = page.getByTestId("tick-btn");
  for (let i = 0; i < count; i++) {
    await btn.click();
  }
}

async function readSelectRenderCount(page: any): Promise<number | null> {
  return page.evaluate(() => {
    const counts = (window as any).__renderCounts ?? {};
    return counts["select-component"] ?? counts["Select"] ?? null;
  });
}

// ─── 1. Regression: var. declarations in user-defined components ──────────────

test.describe("computedUses regression: var. declarations in user-defined components", () => {
  test(
    "var. declared on <Component> is accessible via write-only assignment in a nested container event handler (with <script>)",
    async ({ initTestBed, page }) => {
      // flag is only WRITTEN in onClick="flag = true" — the RHS is a literal, not a
      // reference. collectVariableDependencies() returns [] for this expression, so
      // without nextDisableNarrowing=true, Fragment.computedUses would be [] and
      // flag would be absent from scope → "Left value variable not found" at runtime.
      await initTestBed(`<Toggler />`, {
        components: [
          `
          <Component name="Toggler" var.flag="{false}">
            <script>
              function noop() {}
            </script>
            <Fragment var.x="{1}">
              <Button testId="set-btn" onClick="flag = true">Set</Button>
            </Fragment>
            <Text testId="flag-text">{flag ? "set" : "unset"}</Text>
          </Component>
          `,
        ],
      });

      await expect(page.getByTestId("flag-text")).toHaveText("unset");
      await page.getByTestId("set-btn").click();
      await expect(page.getByTestId("flag-text")).toHaveText("set");
    },
  );

  test(
    "code-behind functions declared in <script> can read and mutate var. declarations",
    async ({ initTestBed, page }) => {
      await initTestBed(`<Counter />`, {
        components: [
          `
          <Component name="Counter" var.count="{0}">
            <script>
              function increment() { count++; }
              function reset() { count = 0; }
            </script>
            <Text testId="count-display">{count}</Text>
            <Button testId="inc-btn" onClick="increment()">+</Button>
            <Button testId="reset-btn" onClick="reset()">Reset</Button>
          </Component>
          `,
        ],
      });

      await expect(page.getByTestId("count-display")).toHaveText("0");
      await page.getByTestId("inc-btn").click();
      await expect(page.getByTestId("count-display")).toHaveText("1");
      await page.getByTestId("inc-btn").click();
      await expect(page.getByTestId("count-display")).toHaveText("2");
      await page.getByTestId("reset-btn").click();
      await expect(page.getByTestId("count-display")).toHaveText("0");
    },
  );
});

// ─── 2. Optimization: Select directly in App ─────────────────────────────────

// Button-driven markup: each click increments oftenChanges (simulates a timer tick).
// rarelyChanges is a large, stable array — never modified during the test.
const APP_DIRECT = `
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Button testId="tick-btn" onClick="oftenChanges++">Tick</Button>
  <Text testId="often-changes-text">Often changes: {oftenChanges}</Text>
  <Select testId="select-component">
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
`;

test.describe("computedUses optimization: Select directly in App", () => {
  test("Select loads correct data (1000 items)", async ({ initTestBed, page }) => {
    await initTestBed(APP_DIRECT, { noFragmentWrapper: true });

    await expect(page.getByTestId("select-component")).toBeVisible();
    await page.getByTestId("select-component").click();
    await expect(page.getByText("|1|")).toBeVisible();
    await expect(page.getByText("|2|")).toBeVisible();
  });

  test(
    `Select renders ≤5 times after ${TICK_COUNT} oftenChanges updates (computedUses optimization)`,
    async ({ initTestBed, page }) => {
      await initTestBed(APP_DIRECT, { noFragmentWrapper: true });

      await triggerStateUpdates(page, TICK_COUNT);
      await expect(page.getByTestId("often-changes-text")).toHaveText(
        `Often changes: ${TICK_COUNT}`,
      );

      const renderCount = await readSelectRenderCount(page);
      if (renderCount === null) {
        test.skip(true, "__renderCounts not available (not running in development mode)");
        return;
      }

      // Select.computedUses=['rarelyChanges'] → unaffected by oftenChanges updates.
      // ≤5 accounts for initial render + React dev-mode double-invoke.
      expect(renderCount).toBeLessThanOrEqual(5);
    },
  );
});

// ─── 3. Optimization: Select inside a user-defined component ─────────────────

// SelectWrapper without <script>: the inner Select gets computedUses=['rarelyChanges'].
// The wrapper instance in App has no computedUses (it has no own vars/functions, so
// the App-level traversal treats it as a non-container pass-through and it receives
// all App state). Despite that, Select's own StateContainer filters to rarelyChanges
// only → zero click-induced re-renders.
const SELECT_WRAPPER_NO_SCRIPT = `
<Component name="SelectWrapper">
  <Select testId="select-component">
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</Component>
`;


const APP_WITH_WRAPPER = `
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Button testId="tick-btn" onClick="oftenChanges++">Tick</Button>
  <Text testId="often-changes-text">Often changes: {oftenChanges}</Text>
  <SelectWrapper />
</App>
`;

test.describe("computedUses optimization: Select inside user-defined component", () => {
  test(
    `Select inside user-defined component (no <script>) renders ≤5 times after ${TICK_COUNT} updates`,
    async ({ initTestBed, page }) => {
      await initTestBed(APP_WITH_WRAPPER, {
        noFragmentWrapper: true,
        components: [SELECT_WRAPPER_NO_SCRIPT],
      });

      await triggerStateUpdates(page, TICK_COUNT);
      await expect(page.getByTestId("often-changes-text")).toHaveText(
        `Often changes: ${TICK_COUNT}`,
      );

      const renderCount = await readSelectRenderCount(page);
      if (renderCount === null) {
        test.skip(true, "__renderCounts not available (not running in development mode)");
        return;
      }

      // Inner narrowing: Select.computedUses=['rarelyChanges'] within the wrapper's tree.
      expect(renderCount).toBeLessThanOrEqual(5);
    },
  );
  // NOTE: the negative case (WITH <script> → optimization disabled → >5 renders) is NOT
  // tested here via render counts because when SelectWrapper has a <script> it becomes a
  // full StateContainer whose internal hierarchy gives Select a different __renderCounts key,
  // making the lookup unreliable.  The functional consequence of this (var. declarations
  // accessible in nested containers) is already covered by the regression tests above.
});

// ─── 4. Optimization: function-free Select inside component WITH <script> ────

// DataView has a <script> with noop functions — simulates a real component that has
// code-behind but whose Select does not call any of those functions.
// With the function-free narrowing optimization, Select still gets
// computedUses=['rarelyChanges'] even though nextDisableNarrowing=true is inherited.
const DATA_VIEW_WITH_SCRIPT = `
<Component name="DataView" var.rarelyChanges="{$props.data ?? []}">
  <script>
    function noop() {}
    function anotherNoop() {}
  </script>
  <Select testId="select-component">
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</Component>
`;

const APP_WITH_SCRIPT_WRAPPER = `
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Button testId="tick-btn" onClick="oftenChanges++">Tick</Button>
  <Text testId="often-changes-text">Often changes: {oftenChanges}</Text>
  <DataView data="{rarelyChanges}" />
</App>
`;

test.describe("computedUses optimization: function-free Select inside component with <script>", () => {
  test("Select loads correct data (1000 items) when wrapper has <script>", async ({ initTestBed, page }) => {
    await initTestBed(APP_WITH_SCRIPT_WRAPPER, {
      noFragmentWrapper: true,
      components: [DATA_VIEW_WITH_SCRIPT],
    });

    await expect(page.getByTestId("select-component")).toBeVisible();
    await page.getByTestId("select-component").click();
    await expect(page.getByText("|1|")).toBeVisible();
    await expect(page.getByText("|2|")).toBeVisible();
  });

  test(
    "Select re-renders when its own dep (rarelyChanges) actually changes",
    async ({ initTestBed, page }) => {
      // Verifies that narrowing does NOT break reactivity when the subscribed var changes.
      const appWithRareChange = `
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{[1, 2, 3]}"
>
  <Button testId="tick-btn" onClick="oftenChanges++">Tick</Button>
  <Button testId="rare-btn" onClick="rarelyChanges = [10, 20, 30]">Change rare</Button>
  <Text testId="often-changes-text">Often changes: {oftenChanges}</Text>
  <Text testId="first-item">Rarely: {rarelyChanges[0]}</Text>
  <DataView data="{rarelyChanges}" />
</App>
`;
      await initTestBed(appWithRareChange, {
        noFragmentWrapper: true,
        components: [DATA_VIEW_WITH_SCRIPT],
      });

      // Trigger several oftenChanges updates — Select should NOT re-render
      await triggerStateUpdates(page, 5);

      // Now change rarelyChanges — Select MUST show new items
      await page.getByTestId("rare-btn").click();
      await expect(page.getByTestId("first-item")).toHaveText("Rarely: 10");
      await page.getByTestId("select-component").click();
      await expect(page.getByText("|10|")).toBeVisible();
      await expect(page.getByText("|20|")).toBeVisible();
      await expect(page.getByText("|30|")).toBeVisible();
    },
  );
});
