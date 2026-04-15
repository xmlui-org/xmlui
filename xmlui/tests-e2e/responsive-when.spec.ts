import { expect, test } from "../src/testing/fixtures";

// Breakpoint reference (default theme):
//   xs  (0):  width < 576px
//   sm  (1): 576px ≤ width < 768px
//   md  (2): 768px ≤ width < 992px
//   lg  (3): 992px ≤ width < 1200px
//   xl  (4): 1200px ≤ width < 1400px
//   xxl (5): width ≥ 1400px

const VIEWPORT_HEIGHT = 768;

const VP = {
  xs: { width: 500, height: VIEWPORT_HEIGHT },
  sm: { width: 700, height: VIEWPORT_HEIGHT },
  md: { width: 900, height: VIEWPORT_HEIGHT },
  lg: { width: 1100, height: VIEWPORT_HEIGHT },
  xl: { width: 1300, height: VIEWPORT_HEIGHT },
  xxl: { width: 1500, height: VIEWPORT_HEIGHT },
};

// =============================================================================
// RESPONSIVE WHEN TESTS
// =============================================================================

test.describe("Responsive when-* attributes", () => {
  // ---------------------------------------------------------------------------
  // when-md="true" — Tailwind mobile-first semantics
  // ---------------------------------------------------------------------------
  test.describe("when-md only", () => {
    // Below md: no responsive rule matches → no explicit base → lowest rule (md=true) is truthy
    //           → inferred base is false → hidden.
    // At md+: when-md="true" matches → visible.
    // Result: hidden below md, visible at md+.
    test("hidden below md, visible at md+", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when-md="true" />`;
      for (const vp of [VP.xs, VP.sm]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).not.toBeVisible();
      }
      for (const vp of [VP.md, VP.lg, VP.xl, VP.xxl]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // when="true" when-md="false" — below md falls back to base when=true (visible)
  // ---------------------------------------------------------------------------
  test.describe("base when + when-md override", () => {
    // xs, sm: no responsive rule matches → base when=true → visible
    // md, lg: when-md=false wins (lg inherits) → hidden
    test("visible below md, hidden at md+", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when="true" when-md="{false}" />`;
      for (const vp of [VP.xs, VP.sm]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).toBeVisible();
      }
      for (const vp of [VP.md, VP.lg]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).not.toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // when-xs="true" when-md="false" — visible at xs/sm, hidden at md+
  // ---------------------------------------------------------------------------
  test.describe("when-xs + when-md override", () => {
    // xs, sm: when-xs=true (sm inherits, no when-sm rule) → visible
    // md, lg, xxl: when-md=false wins (lg, xxl inherit) → hidden
    test("visible at xs/sm, hidden at md+", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when-xs="true" when-md="{false}" />`;
      for (const vp of [VP.xs, VP.sm]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).toBeVisible();
      }
      for (const vp of [VP.md, VP.lg, VP.xxl]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).not.toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Base `when` only — no responsive rules at all (backward compatibility)
  // ---------------------------------------------------------------------------
  test.describe("base when only (backward compat)", () => {
    test("when=true is visible at all sizes", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when="true" />`;
      for (const [, vp] of Object.entries(VP)) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).toBeVisible();
      }
    });

    test("when=false is hidden at all sizes", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when="{false}" />`;
      for (const [, vp] of Object.entries(VP)) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).not.toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // when-xs="true" when-lg="false" — visible at xs/sm/md, hidden at lg+
  // ---------------------------------------------------------------------------
  test.describe("when-xs + when-lg override", () => {
    // xs, sm, md: when-xs=true (sm, md inherit, no sm/md rule) → visible
    // lg, xl, xxl: when-lg=false wins (xl, xxl inherit) → hidden
    test("visible at xs/sm/md, hidden at lg+", async ({ page, initTestBed }) => {
      const MARKUP = `<Text testId="t" value="hello" when-xs="true" when-lg="{false}" />`;
      for (const vp of [VP.xs, VP.sm, VP.md]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).toBeVisible();
      }
      for (const vp of [VP.lg, VP.xl, VP.xxl]) {
        await page.setViewportSize(vp);
        await initTestBed(MARKUP);
        await expect(page.getByTestId("t")).not.toBeVisible();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Viewport resize triggers visibility change
  // ---------------------------------------------------------------------------
  test("visibility changes when viewport crosses md breakpoint", async ({
    page,
    initTestBed,
  }) => {
    // Use when="{false}" when-md="true": hidden below md (base when=false), visible at md+
    await page.setViewportSize(VP.xs);
    await initTestBed(`<Text testId="t" value="hello" when="{false}" when-md="true" />`);
    await expect(page.getByTestId("t")).not.toBeVisible();

    // Resize to md — component should appear
    await page.setViewportSize(VP.md);
    await expect(page.getByTestId("t")).toBeVisible();

    // Resize back to xs — component should disappear
    await page.setViewportSize(VP.xs);
    await expect(page.getByTestId("t")).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Full combinatorial matrix: {when, when-xs, when-md} × {undefined, true, false}
  //
  // Rules:
  //   - No responsive attrs                  → base `when` governs (undefined=visible)
  //   - Any responsive attr present          → base `when` is ignored
  //   - At xs: walk xs → if no match → false (hidden)
  //   - At md: walk md → xs → if no match → false (hidden)
  //
  // Encoding: t="{true}"  f="{false}"  _=(attr absent)
  //
  // id  | when | when-xs | when-md | @ xs    | @ md
  // ----|------|---------|---------|---------|--------
  // c01 |  _   |  _      |  _      | visible | visible   (no responsive, base _→visible)
  // c02 |  t   |  _      |  _      | visible | visible   (no responsive, base t)
  // c03 |  f   |  _      |  _      | hidden  | hidden    (no responsive, base f)
  // c04 |  _   |  t      |  _      | visible | visible   (xs=t, md inherits xs=t)
  // c05 |  _   |  f      |  _      | hidden  | hidden    (xs=f, md inherits xs=f)
  // c06 |  _   |  _      |  t      | hidden  | visible   (xs: no match→infer hidden; md: md=t)
  // c07 |  _   |  _      |  f      | visible | hidden    (xs: no match→infer visible; md: md=f)
  // c08 |  t   |  t      |  _      | visible | visible   (base ignored; xs=t; md inherits)
  // c09 |  t   |  f      |  _      | hidden  | hidden    (base ignored; xs=f; md inherits)
  // c10 |  t   |  _      |  t      | visible | visible   (xs: no match→base t=true; md: md=t)
  // c11 |  t   |  _      |  f      | visible | hidden    (xs: no match→base t=true; md: md=f)
  // c12 |  f   |  t      |  _      | visible | visible   (base ignored; xs=t; md inherits)
  // c13 |  f   |  f      |  _      | hidden  | hidden    (base ignored; xs=f; md inherits)
  // c14 |  f   |  _      |  t      | hidden  | visible   (xs: no match→base f=false; md: md=t)
  // c15 |  f   |  _      |  f      | hidden  | hidden    (xs: no match→base f=false; md: md=f)
  // c16 |  _   |  t      |  t      | visible | visible   (xs=t; md=t wins)
  // c17 |  _   |  t      |  f      | visible | hidden    (xs=t; md=f overrides)
  // c18 |  _   |  f      |  t      | hidden  | visible   (xs=f; md=t overrides)
  // c19 |  _   |  f      |  f      | hidden  | hidden    (xs=f; md=f)
  // c20 |  t   |  t      |  t      | visible | visible
  // c21 |  t   |  t      |  f      | visible | hidden    (md=f overrides xs=t)
  // c22 |  t   |  f      |  t      | hidden  | visible   (md=t overrides xs=f)
  // c23 |  t   |  f      |  f      | hidden  | hidden
  // c24 |  f   |  t      |  t      | visible | visible   (base f ignored)
  // c25 |  f   |  t      |  f      | visible | hidden    (base f ignored; md=f)
  // c26 |  f   |  f      |  t      | hidden  | visible   (base f ignored; md=t)
  // c27 |  f   |  f      |  f      | hidden  | hidden
  // ---------------------------------------------------------------------------
  test("all combinations of when + when-xs + when-md", async ({ page, initTestBed }) => {
    await page.setViewportSize(VP.xs);
    await initTestBed(`
      <App>
        <Text testId="c01" value="c01" />
        <Text testId="c02" value="c02" when="{true}" />
        <Text testId="c03" value="c03" when="{false}" />
        <Text testId="c04" value="c04" when-xs="{true}" />
        <Text testId="c05" value="c05" when-xs="{false}" />
        <Text testId="c06" value="c06" when-md="{true}" />
        <Text testId="c07" value="c07" when-md="{false}" />
        <Text testId="c08" value="c08" when="{true}"  when-xs="{true}" />
        <Text testId="c09" value="c09" when="{true}"  when-xs="{false}" />
        <Text testId="c10" value="c10" when="{true}"  when-md="{true}" />
        <Text testId="c11" value="c11" when="{true}"  when-md="{false}" />
        <Text testId="c12" value="c12" when="{false}" when-xs="{true}" />
        <Text testId="c13" value="c13" when="{false}" when-xs="{false}" />
        <Text testId="c14" value="c14" when="{false}" when-md="{true}" />
        <Text testId="c15" value="c15" when="{false}" when-md="{false}" />
        <Text testId="c16" value="c16" when-xs="{true}"  when-md="{true}" />
        <Text testId="c17" value="c17" when-xs="{true}"  when-md="{false}" />
        <Text testId="c18" value="c18" when-xs="{false}" when-md="{true}" />
        <Text testId="c19" value="c19" when-xs="{false}" when-md="{false}" />
        <Text testId="c20" value="c20" when="{true}"  when-xs="{true}"  when-md="{true}" />
        <Text testId="c21" value="c21" when="{true}"  when-xs="{true}"  when-md="{false}" />
        <Text testId="c22" value="c22" when="{true}"  when-xs="{false}" when-md="{true}" />
        <Text testId="c23" value="c23" when="{true}"  when-xs="{false}" when-md="{false}" />
        <Text testId="c24" value="c24" when="{false}" when-xs="{true}"  when-md="{true}" />
        <Text testId="c25" value="c25" when="{false}" when-xs="{true}"  when-md="{false}" />
        <Text testId="c26" value="c26" when="{false}" when-xs="{false}" when-md="{true}" />
        <Text testId="c27" value="c27" when="{false}" when-xs="{false}" when-md="{false}" />
      </App>
    `);

    // --- Assert visibility at xs ---
    const visible = (id: string) => expect(page.getByTestId(id)).toBeVisible();
    const hidden = (id: string) => expect(page.getByTestId(id)).not.toBeVisible();

    await visible("c01"); // no responsive, base _  → visible
    await visible("c02"); // no responsive, base t  → visible
    await hidden("c03");  // no responsive, base f  → hidden
    await visible("c04"); // xs=t                   → visible
    await hidden("c05");  // xs=f                   → hidden
    await hidden("c06");  // only md=t, no xs match → infer: lowest truthy → hidden
    await visible("c07"); // only md=f, no xs match → infer: lowest falsy  → visible
    await visible("c08"); // base ignored; xs=t     → visible
    await hidden("c09");  // base ignored; xs=f     → hidden
    await visible("c10"); // only md=t, no xs match → fallback base t=true → visible
    await visible("c11"); // only md=f, no xs match → fallback base t=true → visible
    await visible("c12"); // base ignored; xs=t     → visible
    await hidden("c13");  // base ignored; xs=f     → hidden
    await hidden("c14");  // only md=t, no xs match → fallback base f=false → hidden
    await hidden("c15");  // only md=f, no xs match → fallback base f=false → hidden
    await visible("c16"); // xs=t                   → visible
    await visible("c17"); // xs=t                   → visible
    await hidden("c18");  // xs=f                   → hidden
    await hidden("c19");  // xs=f                   → hidden
    await visible("c20"); // xs=t                   → visible
    await visible("c21"); // xs=t                   → visible
    await hidden("c22");  // xs=f                   → hidden
    await hidden("c23");  // xs=f                   → hidden
    await visible("c24"); // base ignored; xs=t     → visible
    await visible("c25"); // base ignored; xs=t     → visible
    await hidden("c26");  // base ignored; xs=f     → hidden
    await hidden("c27");  // base ignored; xs=f     → hidden

    // --- Resize to md and reassert ---
    await page.setViewportSize(VP.md);

    await visible("c01"); // no responsive, base _  → visible
    await visible("c02"); // no responsive, base t  → visible
    await hidden("c03");  // no responsive, base f  → hidden
    await visible("c04"); // md inherits xs=t       → visible
    await hidden("c05");  // md inherits xs=f       → hidden
    await visible("c06"); // md=t                   → visible
    await hidden("c07");  // md=f                   → hidden
    await visible("c08"); // base ignored; md inherits xs=t → visible
    await hidden("c09");  // base ignored; md inherits xs=f → hidden
    await visible("c10"); // base ignored; md=t     → visible
    await hidden("c11");  // base ignored; md=f     → hidden
    await visible("c12"); // base ignored; md inherits xs=t → visible
    await hidden("c13");  // base ignored; md inherits xs=f → hidden
    await visible("c14"); // base ignored; md=t     → visible
    await hidden("c15");  // base ignored; md=f     → hidden
    await visible("c16"); // md=t wins              → visible
    await hidden("c17");  // md=f overrides xs=t    → hidden
    await visible("c18"); // md=t overrides xs=f    → visible
    await hidden("c19");  // md=f                   → hidden
    await visible("c20"); // md=t                   → visible
    await hidden("c21");  // md=f overrides xs=t    → hidden
    await visible("c22"); // md=t overrides xs=f    → visible
    await hidden("c23");  // md=f                   → hidden
    await visible("c24"); // base ignored; md=t     → visible
    await hidden("c25");  // base ignored; md=f     → hidden
    await visible("c26"); // base ignored; md=t     → visible
    await hidden("c27");  // base ignored; md=f     → hidden
  });
});

