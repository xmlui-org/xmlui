import type { Page } from "@playwright/test";
import { expect, test } from "../../testing/fixtures";

const TALL = `<Fragment>${Array.from({ length: 70 }, (_, i) => `<Text>line ${i}</Text>`).join("")}</Fragment>`;

// Two traps, both of which produced a wrong verdict while these tests were
// being written (xmlui-org/xmlui#2864):
//
// 1. StickyBox is JS-driven (`react-sticky-el`), not CSS `position: sticky`.
//    Reading computed `position` AT REST reports `static` for every StickyBox,
//    including working ones. It only becomes `fixed` once you scroll past it.
// 2. A StickyBox below the fold needs enough scroll to actually reach it.
//    Scrolling a fixed amount at a box sitting ~3000px down reports "never
//    sticks" for a box that was simply never reached.
//
// So: scroll in steps, and treat "stuck" as an ANCESTOR turning `fixed` —
// react-sticky-el fixes a wrapper, not the child element.

/** Scrolls the real scroller (the App content area), falling back to the window. */
async function scrollTo(page: Page, px: number) {
  await page.evaluate((p) => {
    const all = Array.from(document.querySelectorAll("*")) as HTMLElement[];
    const sc = all.find((e) => {
      const oy = getComputedStyle(e).overflowY;
      return (oy === "auto" || oy === "scroll") && e.scrollHeight > e.clientHeight + 4;
    });
    if (sc) sc.scrollTop = p;
    else window.scrollTo(0, p);
  }, px);
  await page.waitForTimeout(350);
}

/** True once an ancestor of the heading has been fixed by react-sticky-el. */
async function stuck(page: Page) {
  return await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("h1")).find(
      (h) => h.textContent?.trim() === "HDR",
    ) as HTMLElement | undefined;
    if (!el) return { rendered: false, fixed: false, top: -1 };
    let node: HTMLElement | null = el;
    for (let i = 0; i < 6 && node; i++) {
      if (getComputedStyle(node).position === "fixed") {
        return { rendered: true, fixed: true, top: Math.round(el.getBoundingClientRect().top) };
      }
      node = node.parentElement;
    }
    return { rendered: true, fixed: false, top: Math.round(el.getBoundingClientRect().top) };
  });
}

async function scrollUntilStuck(page: Page, steps: number[]) {
  const seen: any[] = [];
  for (const px of steps) {
    await scrollTo(page, px);
    const s = await stuck(page);
    seen.push({ px, ...s });
    if (s.fixed) return { everStuck: true, seen };
  }
  return { everStuck: false, seen };
}

test.describe("StickyBox nesting", () => {
  // The shapes from #2864 plus controls. The Form and HStack cases are the
  // report's own; the bare case is the control that says whether a failure is
  // about nesting at all.
  const SHAPES: Record<string, string> = {
    "inside a Form": `<Form id="f" padding="$space-0"><StickyBox><H1>HDR</H1></StickyBox>${TALL}</Form>`,
    "inside HStack > Form": `<HStack><Form id="f" padding="$space-0"><StickyBox><H1>HDR</H1></StickyBox>${TALL}</Form></HStack>`,
    "inside HStack > VStack": `<HStack><VStack><StickyBox><H1>HDR</H1></StickyBox>${TALL}</VStack></HStack>`,
    "bare in a Page": `<Fragment><StickyBox><H1>HDR</H1></StickyBox>${TALL}</Fragment>`,
  };

  for (const [name, markup] of Object.entries(SHAPES)) {
    test(`sticks ${name}`, async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <AppHeader><Text>H</Text></AppHeader>
          <NavPanel><NavLink to="/" label="Home" /></NavPanel>
          <Pages><Page url="/">${markup}</Page></Pages>
        </App>
      `);
      await expect(page.getByText("HDR", { exact: true })).toBeVisible();
      const { everStuck, seen } = await scrollUntilStuck(page, [400, 900, 1600, 2600]);
      expect(everStuck, `never became fixed; samples: ${JSON.stringify(seen)}`).toBe(true);
    });
  }

  // #2864's Form carries data="{settings.value}". A subtree that mounts after
  // async data is the timing case: StickyBox resolves its scroll parent from a
  // node that only exists once mounted, so late mounting is what could strand
  // it.
  for (const delay of [0, 600]) {
    test(`sticks inside a Form whose data arrives after ${delay}ms`, async ({
      initTestBed,
      page,
    }) => {
      await page.route("**/sticky-form-data*", async (route) => {
        if (delay) await new Promise((r) => setTimeout(r, delay));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ title: "Settings" }),
        });
      });

      await initTestBed(`
        <App layout="condensed-sticky">
          <AppHeader><Text>H</Text></AppHeader>
          <NavPanel><NavLink to="/" label="Home" /></NavPanel>
          <Pages><Page url="/">
            <DataSource id="settings" url="/sticky-form-data" />
            <HStack>
              <Form id="f" data="{settings.value}" padding="$space-0">
                <StickyBox><H1>HDR</H1></StickyBox>
                ${TALL}
              </Form>
            </HStack>
          </Page></Pages>
        </App>
      `);
      await expect(page.getByText("HDR", { exact: true })).toBeVisible();
      const { everStuck, seen } = await scrollUntilStuck(page, [400, 1200, 2200]);
      expect(everStuck, `never became fixed; samples: ${JSON.stringify(seen)}`).toBe(true);
    });
  }
});
