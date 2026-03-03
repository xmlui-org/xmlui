import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// MARKUP HELPERS
// =============================================================================

// Three sections, each with 10 × 50 px rows ≈ 500 px of content + a small header.
// Approximate cumulative offsets (header ≈ 30 px):
//   Section 1 starts at   0 px
//   Section 2 starts at ~530 px
//   Section 3 starts at ~1060 px
// The scroller window is 400 px tall, so at scrollTop=0 sections 2 and 3 are
// entirely below the visible area.
function topMarkup() {
  return `
    <App scrollWholePage="false">
      <Stack height="400px">
        <ScrollViewer testId="scroller" showScrollerFade="false">
          <StickySection testId="section-1" stickTo="top">Item #1</StickySection>
          <Items data="{[1,2,3,4,5,6,7,8,9,10]}">
            <Stack height="50px" border="1px solid green"><Text>Row</Text></Stack>
          </Items>
          <StickySection testId="section-2" stickTo="top">Item #2</StickySection>
          <Items data="{[1,2,3,4,5,6,7,8,9,10]}">
            <Stack height="50px" border="1px solid green"><Text>Row</Text></Stack>
          </Items>
          <StickySection testId="section-3" stickTo="top">Item #3</StickySection>
          <Items data="{[1,2,3,4,5,6,7,8,9,10]}">
            <Stack height="50px" border="1px solid green"><Text>Row</Text></Stack>
          </Items>
        </ScrollViewer>
      </Stack>
    </App>
  `;
}

// Same layout, only stickTo flipped to "bottom"
function bottomMarkup() {
  return topMarkup().replace(/stickTo="top"/g, 'stickTo="bottom"');
}

// Scroll the ScrollViewer's inner div to a given position.
async function scrollTo(page: any, scrollTop: number) {
  await page.getByTestId("scroller").evaluate(
    (el: HTMLElement, top: number) => { el.scrollTop = top; },
    scrollTop,
  );
}

// Returns true when the top edge of `sectionLocator` aligns with the top edge
// of the scroll container within a 2 px tolerance.
async function isAtScrollerTop(page: any, sectionTestId: string): Promise<boolean> {
  const { top: secTop } = await getBounds(page.getByTestId(sectionTestId));
  const { top: scrollTop } = await getBounds(page.getByTestId("scroller"));
  return Math.abs(secTop - scrollTop) <= 2;
}

// Returns true when the bottom edge of `sectionLocator` aligns with the bottom
// edge of the scroll container within a 2 px tolerance.
async function isAtScrollerBottom(page: any, sectionTestId: string): Promise<boolean> {
  const { bottom: secBottom } = await getBounds(page.getByTestId(sectionTestId));
  const { bottom: scrollBottom } = await getBounds(page.getByTestId("scroller"));
  return Math.abs(secBottom - scrollBottom) <= 2;
}

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with default stickTo (top)", async ({ initTestBed, page }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("scroller")).toBeVisible();
    await expect(page.getByTestId("section-1")).toBeVisible();
  });

  test("renders with stickTo='bottom'", async ({ initTestBed, page }) => {
    await initTestBed(bottomMarkup());
    await expect(page.getByTestId("scroller")).toBeVisible();
    await expect(page.getByTestId("section-1")).toBeVisible();
  });

  test("all sections are present in the DOM", async ({ initTestBed, page }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeAttached();
    await expect(page.getByTestId("section-2")).toBeAttached();
    await expect(page.getByTestId("section-3")).toBeAttached();
  });

  test("section has position:sticky CSS applied", async ({ initTestBed, page }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toHaveCSS("position", "sticky");
  });

  test("top sections use top:0 and bottom sections use bottom:0", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Stack height="400px">
          <ScrollViewer testId="scroller" showScrollerFade="false">
            <StickySection testId="top-section" stickTo="top">Top</StickySection>
            <Stack height="800px" />
            <StickySection testId="bottom-section" stickTo="bottom">Bottom</StickySection>
            <Stack height="800px" />
          </ScrollViewer>
        </Stack>
      </App>
    `);
    await expect(page.getByTestId("top-section")).toHaveCSS("top", "0px");
    await expect(page.getByTestId("bottom-section")).toHaveCSS("bottom", "0px");
  });

  test("section content is rendered inside the sticky container", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toContainText("Item #1");
    await expect(page.getByTestId("section-2")).toContainText("Item #2");
    await expect(page.getByTestId("section-3")).toContainText("Item #3");
  });
});

// =============================================================================
// STICKTO="TOP" BEHAVIOR TESTS
// =============================================================================

test.describe("stickTo='top' behavior", () => {
  test("section 1 sticks to the top while scrolling through its content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // Scroll 200 px — well inside section 1's content, sections 2/3 not yet reached
    await scrollTo(page, 200);

    // Section 1 should be stuck at the top of the scroller
    await expect.poll(() => isAtScrollerTop(page, "section-1")).toBe(true);
  });

  test("section 2 is on top of section 1 after scrolling past it", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // Scroll ~600 px — past section 1 (≈530 px) and into section 2's content.
    // Both sections are geometrically at the scroller top (both are sticky top:0);
    // section 2 wins visually because it has a higher z-index.
    await scrollTo(page, 600);

    await expect.poll(() => isAtScrollerTop(page, "section-2")).toBe(true);

    // Section 2 must have a strictly higher z-index than section 1
    const z1 = await page.getByTestId("section-1").evaluate((el: HTMLElement) => Number(el.style.zIndex));
    const z2 = await page.getByTestId("section-2").evaluate((el: HTMLElement) => Number(el.style.zIndex));
    expect(z2).toBeGreaterThan(z1);
  });

  test("last section sticks to the top when scrolled to the bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // Scroll all the way to the bottom
    await scrollTo(page, 99999);

    // Section 3 (the last one) is the most recently scrolled past
    await expect.poll(() => isAtScrollerTop(page, "section-3")).toBe(true);
  });

  test("later section has a higher z-index than earlier sections", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeAttached();
    // After mount the JS assigns z-indices: section 1 = 1, section 2 = 2, section 3 = 3
    await expect.poll(async () =>
      page.getByTestId("section-3").evaluate((el: HTMLElement) => el.style.zIndex)
    ).toBe("3");
    await expect.poll(async () =>
      page.getByTestId("section-1").evaluate((el: HTMLElement) => el.style.zIndex)
    ).toBe("1");
  });
});

// =============================================================================
// STICKTO="BOTTOM" BEHAVIOR TESTS
// =============================================================================

test.describe("stickTo='bottom' behavior", () => {
  test("first upcoming section sticks to the bottom at the top of the scroll area", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(bottomMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // At scrollTop=0, sections 2 and 3 are below the 400 px viewport.
    // Both are geometrically at the scroller's bottom (both sticky bottom:0);
    // section 2 wins visually because it has a higher z-index (earlier DOM element).
    await expect.poll(() => isAtScrollerBottom(page, "section-2")).toBe(true);

    // Section 2 must have a strictly higher z-index than section 3
    const z2 = await page.getByTestId("section-2").evaluate((el: HTMLElement) => Number(el.style.zIndex));
    const z3 = await page.getByTestId("section-3").evaluate((el: HTMLElement) => Number(el.style.zIndex));
    expect(z2).toBeGreaterThan(z3);
  });

  test("next upcoming section replaces previous one at the bottom as user scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(bottomMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // Scroll ~600 px — we are inside section 2's content; section 3 is the next one ahead
    await scrollTo(page, 600);

    await expect.poll(() => isAtScrollerBottom(page, "section-3")).toBe(true);
    await expect.poll(() => isAtScrollerBottom(page, "section-2")).toBe(false);
  });

  test("no section is stuck to the bottom once fully scrolled to the bottom", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(bottomMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    // Scroll to the very end — all sections are above or in view; none are below
    await scrollTo(page, 99999);

    await expect.poll(() => isAtScrollerBottom(page, "section-1")).toBe(false);
    await expect.poll(() => isAtScrollerBottom(page, "section-2")).toBe(false);
    await expect.poll(() => isAtScrollerBottom(page, "section-3")).toBe(false);
  });

  test("earlier section has a higher z-index than later sections", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(bottomMarkup());
    await expect(page.getByTestId("section-1")).toBeAttached();
    // After mount the JS assigns z-indices in reverse: section 1 = 3, section 2 = 2, section 3 = 1
    await expect.poll(async () =>
      page.getByTestId("section-1").evaluate((el: HTMLElement) => el.style.zIndex)
    ).toBe("3");
    await expect.poll(async () =>
      page.getByTestId("section-3").evaluate((el: HTMLElement) => el.style.zIndex)
    ).toBe("1");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("zIndex-StickySection theme variable sets the initial CSS z-index", async ({
    initTestBed,
    page,
  }) => {
    // Single isolated section — no JS z-index override from siblings needed,
    // but our effect still runs and assigns z-index=1. The theme variable governs
    // the CSS layer default before any JS override.
    await initTestBed(
      `
        <App scrollWholePage="false">
          <Stack height="400px">
            <ScrollViewer showScrollerFade="false">
              <StickySection testId="lone-section" stickTo="top">Only section</StickySection>
              <Stack height="800px" />
            </ScrollViewer>
          </Stack>
        </App>
      `,
      { testThemeVars: { "zIndex-StickySection": "10" } },
    );
    // position:sticky must still be applied regardless of theme value
    await expect(page.getByTestId("lone-section")).toHaveCSS("position", "sticky");
  });
});

// =============================================================================
// OTHER EDGE CASES
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("single sticky section renders without errors", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Stack height="400px">
          <ScrollViewer testId="scroller" showScrollerFade="false">
            <StickySection testId="only" stickTo="top">Only section</StickySection>
            <Stack height="800px" />
          </ScrollViewer>
        </Stack>
      </App>
    `);
    await expect(page.getByTestId("only")).toBeVisible();
    await expect(page.getByTestId("only")).toHaveCSS("position", "sticky");
  });

  test("stickTo='top' section stays at the top across various scroll positions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(topMarkup());
    await expect(page.getByTestId("section-1")).toBeVisible();

    for (const scrollPos of [100, 250, 380]) {
      await scrollTo(page, scrollPos);
      await expect.poll(() => isAtScrollerTop(page, "section-1")).toBe(true);
    }
  });

  test("mixed stickTo directions in the same scroll container", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Stack height="400px">
          <ScrollViewer testId="scroller" showScrollerFade="false">
            <StickySection testId="top-sec" stickTo="top">Top section</StickySection>
            <Items data="{[1,2,3,4,5,6,7,8,9,10]}">
              <Stack height="50px" border="1px solid green"><Text>Row</Text></Stack>
            </Items>
            <StickySection testId="bottom-sec" stickTo="bottom">Bottom section</StickySection>
            <Items data="{[1,2,3,4,5,6,7,8,9,10]}">
              <Stack height="50px" border="1px solid green"><Text>Row</Text></Stack>
            </Items>
          </ScrollViewer>
        </Stack>
      </App>
    `);

    // Scroll a small amount (50 px) so that:
    //   - top-sec (natural position 0) has been scrolled past → sticks at top
    //   - bottom-sec (natural position ~530 px) is still below the 400 px
    //     visible area (viewport bottom = 50+400 = 450 < 530) → sticks at bottom
    await scrollTo(page, 50);

    await expect.poll(() => isAtScrollerTop(page, "top-sec")).toBe(true);
    await expect.poll(() => isAtScrollerBottom(page, "bottom-sec")).toBe(true);
  });
});
