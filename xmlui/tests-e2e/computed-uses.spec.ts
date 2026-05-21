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
 * 4. Regression: event handler writes to parent var not in computedUses
 *    When a container is narrowed to computedUses=['X'], event handlers that write
 *    to a parent variable not listed in computedUses must still succeed.
 *    fullParentState is threaded alongside the narrowed state so Container.stateRef
 *    includes all parent vars, not just the scoped subset.
 *
 * 5. Optimization: function-free Select inside component WITH <script>
 *    Shows that a Select without function calls is still narrowed even when
 *    the parent has <script> (nextDisableNarrowing inherited but overridden
 *    by safeToNarrow=true for function-free nodes).
 *
 * 6. Regression: $context-only deps must NOT narrow parent container
 *    A container whose only computed deps come from `$context` (a runtime-only
 *    dynamic var) must not be promoted to a narrowed container — otherwise it
 *    isolates itself from sibling APIs registered in the parent.
 *
 * 7. Regression: stale computedUses after CompoundComponent restructure
 *    A compound's body has its computedUses computed BEFORE the runtime hoists
 *    `vars`/`loaders`/`functions` out to a freshly created outer Container.
 *    The body's pre-computed computedUses correctly excluded the now-hoisted
 *    vars as `localDeclared`, but after the move those vars live in the outer
 *    Container — passing the stale array to extractScopedState would filter
 *    them OUT of parentState and the body's inner nodes would read `undefined`.
 *    CompoundComponent's destructure now strips `computedUses` from `rest`.
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

  test.skip(
    "static Select (no external dependencies) still renders ≤5 times after updates (Mandatory Shielding — REVERTED)",
    async ({ initTestBed, page }) => {
      // SKIPPED: Mandatory Shielding was reverted (see computedUses.ts) because
      // unconditional promotion of heavy components hid parent vars from
      // render-time `extractValue` calls (Table syncWithVar regression) and
      // re-introduced the Bug 20 "clearable Select internals broken" regression.
      // Static heavy components are no longer shielded; they re-render on parent
      // ticks just like before this optimization was attempted. Re-enable this
      // test only if a non-narrowing shield mechanism is introduced.
      const appStatic = `
<App var.oftenChanges="{0}">
  <Button testId="tick-btn" onClick="oftenChanges++">Tick</Button>
  <Text testId="often-changes-text">Often changes: {oftenChanges}</Text>
  <Select testId="select-component">
    <Option value="1" label="Static 1" />
    <Option value="2" label="Static 2" />
  </Select>
</App>
`;
      await initTestBed(appStatic, { noFragmentWrapper: true });

      await triggerStateUpdates(page, TICK_COUNT);
      await expect(page.getByTestId("often-changes-text")).toHaveText(
        `Often changes: ${TICK_COUNT}`,
      );

      const renderCount = await readSelectRenderCount(page);
      if (renderCount === null) {
        test.skip(true, "__renderCounts not available (not running in development mode)");
        return;
      }

      expect(renderCount).toBeLessThanOrEqual(5);
    },
  );

  // NOTE: the negative case (WITH <script> → optimization disabled → >5 renders) is NOT
  // tested here via render counts because when SelectWrapper has a <script> it becomes a
  // full StateContainer whose internal hierarchy gives Select a different __renderCounts key,
  // making the lookup unreliable.  The functional consequence of this (var. declarations
  // accessible in nested containers) is already covered by the regression tests above.
});

// ─── 4. Regression: event handler writes to parent var not in computedUses ──────
//
// When a container gets computedUses=['X'], ComponentWrapper narrows parentState to {X}.
// Event handlers that write to a variable absent from computedUses would throw
// "Left value variable not found in scope" at runtime — because the narrowed stateRef
// did not include that variable.
//
// fullParentState is threaded alongside scopedParentState so Container.stateRef
// merges all parent vars, keeping every parent variable writable from event handlers.
//
// Note: the regression tests in section 1 look similar but use <script> on the Component,
// which sets nextDisableNarrowing=true and prevents computedUses from being set entirely.
// These tests intentionally have NO <script> so narrowing is active.

test.describe("computedUses regression: event handler writes to parent var not in computedUses", () => {
  test(
    "write-only assignment to parent var works when narrowing excludes that var",
    async ({ initTestBed, page }) => {
      // Fragment.var.x makes it an implicit container.
      // It reads 'counter' in its template → computedUses=['counter'].
      // onClick="flag = true" is a raw string — 'flag' is not scanned by computeUsesForTree
      // and is absent from computedUses.  Without fullParentState merged into stateRef,
      // the assignment throws "Left value variable not found in scope".
      await initTestBed(`<Toggler />`, {
        components: [
          `
          <Component name="Toggler" var.flag="{false}" var.counter="{0}">
            <Button testId="count-btn" onClick="counter++">Count</Button>
            <Fragment var.x="{1}">
              <Text testId="counter-text">Count: {counter}</Text>
              <Button testId="set-btn" onClick="flag = true">Set flag</Button>
            </Fragment>
            <Text testId="flag-text">{flag ? "set" : "unset"}</Text>
          </Component>
          `,
        ],
      });

      await expect(page.getByTestId("flag-text")).toHaveText("unset");
      // Increment counter to confirm narrowing is active (Fragment.computedUses=['counter'])
      await page.getByTestId("count-btn").click();
      await expect(page.getByTestId("counter-text")).toHaveText("Count: 1");
      // Write to 'flag' (absent from computedUses) — must succeed without throwing
      await page.getByTestId("set-btn").click();
      await expect(page.getByTestId("flag-text")).toHaveText("set");
    },
  );

  test(
    "write-only assignment succeeds after repeated unrelated state updates (narrowing stays active)",
    async ({ initTestBed, page }) => {
      // Stress variant: multiple counter updates confirm narrowing is not broken by
      // re-renders, and the write-target assignment must still succeed afterwards.
      await initTestBed(`<Toggler />`, {
        components: [
          `
          <Component name="Toggler" var.flag="{false}" var.counter="{0}">
            <Button testId="count-btn" onClick="counter++">Count</Button>
            <Fragment var.x="{1}">
              <Text testId="counter-text">Count: {counter}</Text>
              <Button testId="set-btn" onClick="flag = true">Set flag</Button>
            </Fragment>
            <Text testId="flag-text">{flag ? "set" : "unset"}</Text>
          </Component>
          `,
        ],
      });

      for (let i = 0; i < 5; i++) {
        await page.getByTestId("count-btn").click();
      }
      await expect(page.getByTestId("counter-text")).toHaveText("Count: 5");
      await expect(page.getByTestId("flag-text")).toHaveText("unset");

      await page.getByTestId("set-btn").click();
      await expect(page.getByTestId("flag-text")).toHaveText("set");
    },
  );
});

// ─── 5. Optimization: function-free Select inside component WITH <script> ────

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

test.describe("computedUses optimization: function-free Select inside component with <script> (narrowing still active)", () => {
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

// ─── 6. Regression: $context-only deps must NOT narrow parent container (Баг 19) ─

test.describe("computedUses regression: $context-only deps must not isolate container from sibling APIs (Баг 19)", () => {
  // Pattern: App has var.* AND a ContextMenu sibling. MenuItem handlers reference
  // $context — which is a PARENT_STATE_DYNAMIC_VAR set by ContextMenu.openAt() via
  // implicit dispatch. Before the fix, computedUses=["$context"] was set on App,
  // making stateFromOutside={} initially (before the first openAt call), which cut
  // App off from the "ctxMenu" API registered in Theme#root. Cards then could not
  // call ctxMenu.openAt() because ctxMenu was undefined in their scope.

  const APP = `
<App>
  <variable name="items" value="{[
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' }
  ]}" />
  <variable name="lastAction" value="" />

  <ContextMenu id="ctxMenu">
    <MenuItem
      label="Select"
      onClick="lastAction = 'Selected: ' + $context.name" />
    <MenuItem
      label="Delete"
      onClick="lastAction = 'Deleted: ' + $context.name" />
  </ContextMenu>

  <Items data="{items}">
    <Card testId="{'card-' + $item.id}" onContextMenu="(e) => ctxMenu.openAt(e, $item)">
      <Text>{$item.name}</Text>
    </Card>
  </Items>

  <Text testId="last-action">Last: {lastAction}</Text>
</App>
`;

  test("right-clicking a card opens the context menu (ctxMenu.openAt is reachable)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(APP, { noFragmentWrapper: true });

    // Before the fix, ctxMenu was undefined in Card scope → right-click did nothing.
    await page.getByTestId("card-1").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Select" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });

  test("$context binds to the right-clicked card's data", async ({ initTestBed, page }) => {
    await initTestBed(APP, { noFragmentWrapper: true });

    await page.getByTestId("card-2").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Select" }).click();
    await expect(page.getByTestId("last-action")).toHaveText("Last: Selected: Beta");
  });

  test("second right-click on a different card updates $context correctly", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(APP, { noFragmentWrapper: true });

    await page.getByTestId("card-1").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Select" }).click();
    await expect(page.getByTestId("last-action")).toHaveText("Last: Selected: Alpha");

    // Second right-click on different card — $context must update to new item
    await page.getByTestId("card-2").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(page.getByTestId("last-action")).toHaveText("Last: Deleted: Beta");
  });

  test("var. updates in App still work alongside ContextMenu (no state isolation)", async ({
    initTestBed,
    page,
  }) => {
    // Verifies that App is NOT isolated from its own vars — computedUses must NOT
    // be set on App, so it receives the full parent state (not just {}).
    const appWithButton = `
<App>
  <variable name="count" value="{0}" />
  <variable name="lastAction" value="" />

  <ContextMenu id="ctxMenu">
    <MenuItem label="Action" onClick="lastAction = 'done'" />
  </ContextMenu>

  <Button testId="inc-btn" onClick="count++">Increment</Button>
  <Text testId="count-text">Count: {count}</Text>
  <Text testId="action-text">Action: {lastAction}</Text>
  <Card testId="ctx-card" onContextMenu="(e) => ctxMenu.openAt(e, {})">Right-click me</Card>
</App>
`;
    await initTestBed(appWithButton, { noFragmentWrapper: true });

    await page.getByTestId("inc-btn").click();
    await expect(page.getByTestId("count-text")).toHaveText("Count: 1");
    await page.getByTestId("inc-btn").click();
    await expect(page.getByTestId("count-text")).toHaveText("Count: 2");

    // ContextMenu must also work — ctxMenu.openAt must be reachable
    await page.getByTestId("ctx-card").click({ button: "right" });
    await page.getByRole("menuitem", { name: "Action" }).click();
    await expect(page.getByTestId("action-text")).toHaveText("Action: done");
  });

  test(
    "non-heavy component (HStack) with dependencies is NOT promoted to container (Accidental Promotion Prevention)",
    async ({ initTestBed, page }) => {
      // HStack has a dependency on `oftenChanges`.
      // If it were promoted to a container, it would isolate Select and Button.
      // Button onClick="toast(s1.value)" would fail because s1 is invisible.
      const appHStack = `
<App var.oftenChanges="{0}">
  <HStack gap="{oftenChanges}">
    <Select id="s1" initialValue="Target" />
    <Button testId="toast-btn" onClick="toast(s1.value)" />
  </HStack>
</App>
`;
      await initTestBed(appHStack, { noFragmentWrapper: true });

      await page.getByTestId("toast-btn").click();
      await expect(page.getByText("Target")).toBeVisible(); // Toast appeared with Select value
    },
  );
});

// ─── 7. Regression: stale computedUses after CompoundComponent restructure  ─
//
// computeUsesForTree runs on the compound body BEFORE CompoundComponent's runtime
// destructure moves `vars`/`loaders`/`functions`/`scriptCollected` out to a newly
// created outer Container. While vars live inside the body they are `localDeclared`
// and correctly EXCLUDED from `computedUses`. Once the runtime hoists them to the
// outer Container, the body's pre-computed `computedUses` becomes semantically stale:
// it filters those just-hoisted vars OUT of `parentState` via `extractScopedState`,
// so the body's inner nodes read `undefined`.
//
// The fix lives in xmlui/src/components-core/CompoundComponent.tsx — the destructure
// that produces `rest` (which becomes the outer Container's child) strips the stale
// `computedUses` field so narrowing is decided fresh against the outer Container's
// combined state.
//
// The unit-level regression is in
//   xmlui/tests/components-core/optimization/computedUses.test.ts (describe block).
// The user-facing e2e regression also lives in tests-e2e/compound-component.spec.ts
// ("var initialized with $queryParams ..." and friends).
//
// The two cases below cover the minimal repro patterns directly, isolated from
// routing infrastructure: any compound whose body has at least one external read
// AND a hoisted local var consumed by an inner node is enough to trigger the bug.

test.describe("computedUses regression: stale computedUses after CompoundComponent restructure", () => {
  // Note: we MUST use `$queryParams` (or another routing-state var) here.
  // `$props` looks similar on paper but does not actually fail without the fix —
  // CompoundComponent treats `$props` as a directly resolved local on the outer
  // Container before the `rest` child reads parent state, so the stale-uses path
  // is bypassed. Routing-state names go through the standard parent-state
  // composition pipeline, which is where the stale `computedUses` actually
  // filters them out (and incidentally filters the hoisted `vars` out too,
  // because they share that same parentState surface).
  //
  // The bigger SPA-navigation and direct-URL-load variants of this case are in
  // `tests-e2e/compound-component.spec.ts` ("var initialized with $queryParams …"
  // at lines 722 and 759). The two tests below are the minimal, fast smoke
  // regressions intentionally co-located with the canonical computedUses e2e
  // suite so this file is self-contained.

  test(
    "fallback path: compound var with $queryParams fallback renders correctly when no query param is set",
    async ({ initTestBed, page }) => {
      // Repro recipe:
      //   - compound body's vars: { computed: "{$queryParams.filter ? $queryParams.filter : 'all'}" }
      //   - compound body's reads: $queryParams (free), computed (locally declared)
      //   - computedUses on the body BEFORE the runtime move: ["$queryParams"]
      //   - After CompoundComponent hoists `computed` to a fresh outer Container,
      //     that outer state contains BOTH `computed: 'all'` AND `$queryParams`.
      //   - Without the strip of `computedUses` from `rest`, extractScopedState
      //     filters `computed` OUT of the body's parentState → Text reads "" /
      //     "null" → test would fail with `Expected: "all"` / `Received: ""`.
      await initTestBed(
        `<App>
           <FilteredView />
         </App>`,
        {
          noFragmentWrapper: true,
          components: [
            `<Component name="FilteredView" var.computed="{$queryParams.filter ? $queryParams.filter : 'all'}">
               <Text testId="computed-text">{computed}</Text>
             </Component>`,
          ],
        },
      );

      await expect(page.getByTestId("computed-text")).toHaveText("all");
    },
  );

  test(
    "live path: compound var with $queryParams updates when the URL query param changes",
    async ({ initTestBed, page }) => {
      // Same repro, but also asserts reactivity through the hoisted-var path
      // when $queryParams.filter actually changes via SPA navigation.
      await initTestBed(
        `<App>
           <Button testId="set-filter" onClick="Actions.navigate('/?filter=apples')">Set apples</Button>
           <Button testId="clear-filter" onClick="Actions.navigate('/')">Clear</Button>
           <FilteredView />
         </App>`,
        {
          noFragmentWrapper: true,
          components: [
            `<Component name="FilteredView" var.computed="{$queryParams.filter ? $queryParams.filter : 'all'}">
               <Text testId="computed-text">{computed}</Text>
             </Component>`,
          ],
        },
      );

      await expect(page.getByTestId("computed-text")).toHaveText("all");
      await page.getByTestId("set-filter").click();
      await expect(page.getByTestId("computed-text")).toHaveText("apples");
      await page.getByTestId("clear-filter").click();
      await expect(page.getByTestId("computed-text")).toHaveText("all");
    },
  );
});

// ─── 8. Regression: static heavy components with string-prop var references (Bug 26) ──────
//
// Mandatory Shielding (reverted) forced Select/Table into a StateContainer with
// computedUses=[] when they had no read deps. This hid parent vars from render-time
// extractValue calls. Two symptoms:
//   a) Table syncWithVar: extractValue("{syncState}") returned undefined → adapter never
//      created → writing selectedIds to the parent var silently failed.
//   b) Select clearable/multiSelect internals broke when wrapped without read deps
//      (re-introducing the Bug 20 regression).
//
// Both are fixed by reverting unconditional promotion. These tests are the minimal
// fast regressions to catch any future re-introduction of the Mandatory Shielding
// pattern for the static case.

test.describe("computedUses regression: static heavy components with string-prop var references (Bug 26)", () => {
  test(
    "Table syncWithVar: selecting a row updates the shared variable (no computedUses narrowing on static Table)",
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Fragment var.syncState="{{}}">
          <Table syncWithVar="syncState" rowsSelectable="true" testId="tbl"
                 data='{[{"id":1,"name":"Alpha"},{"id":2,"name":"Beta"}]}'>
            <Column bindTo="name"/>
          </Table>
          <Text testId="sync-out">{JSON.stringify(syncState)}</Text>
        </Fragment>
      `);

      const table = page.getByTestId("tbl");
      await expect(table).toBeVisible();

      await table.locator("input[type='checkbox']").nth(1).click({ force: true });

      await expect(page.getByTestId("sync-out")).toContainText('"selectedIds"');
      await expect(page.getByTestId("sync-out")).toContainText("1");
    },
  );

  test(
    "Select clearable with onDidChange: clear button works and event fires (no wrapping for write-only dep)",
    async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Select clearable="true" onDidChange="testState = 'changed'">
          <Option value="opt1" label="first"/>
          <Option value="opt2" label="second"/>
        </Select>
      `);

      const driver = page.getByTestId("test-id-component");
      await expect(driver).toBeVisible();

      // open dropdown and pick first option
      await driver.click();
      await page.getByRole("option", { name: "first" }).click();

      // clear button should appear
      const clearBtn = driver.locator('[data-part-id="clearButton"]').first();
      await expect(clearBtn).toBeVisible();

      // click clear — page must NOT crash, event must fire
      await clearBtn.click();
      await expect.poll(testStateDriver.testState).toEqual("changed");
    },
  );
});

test.describe("E1: Bug 21 regression — DataSource with $queryParams in fetch", () => {
  test("changing router query params does NOT cause infinite re-fetch", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.counter="{0}">
        <DataSource id="ds" url="/fake"
          onFetch="() => { counter = counter + 1; return 'q=' + $queryParams.q; }" />
        <Text testId="counter" value="{counter}" />
        <Button testId="nav" onClick="Actions.navigate('?q=abc')" />
      </App>`,
      { noFragmentWrapper: true }
    );

    // Initial mount fires fetch once.
    await page.waitForFunction(() => {
      const t = document.querySelector('[data-testid="counter"]');
      return t && t.textContent === "1";
    });

    // Navigate to a new query string.
    await page.getByTestId("nav").click();
    
    // Wait to ensure no stray re-fetches.
    await page.waitForTimeout(500);
    const final = await page.locator('[data-testid="counter"]').textContent();

    // Hard assertion: NO additional re-fetches occurred, counter remains 1
    // because $queryParams is correctly isolated to the event scope.
    expect(final).toBe("1");
  });
});
