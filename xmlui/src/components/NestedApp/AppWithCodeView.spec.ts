import { expect, test } from "../../testing/fixtures";

// Playground boxes (```xmlui-pg fences) without an explicit height reserve 320px before the
// nested app mounts, then grow to fit content that overflows, up to 85% of the viewport.

const lines = (count: number, prefix = "Line") =>
  Array.from({ length: count }, (_, i) => `<Text>${prefix} ${i + 1}</Text>`).join("");

const fence = (app: string, options = "") =>
  `<Markdown><![CDATA[${["```xmlui-pg" + (options ? " " + options : ""), app, "```"].join("\n")}]]></Markdown>`;

const box = (page: any) => page.locator("[data-playground-fit]").first();

async function boxHeight(page: any): Promise<number> {
  return box(page).evaluate((el: HTMLElement) => el.getBoundingClientRect().height);
}

/** How far the nested app's page-level scroller still overflows (0 = everything visible). */
async function remainingOverflow(page: any): Promise<number> {
  return page.evaluate(() => {
    const host = document.querySelector("[data-nested-app-lazy-state='mounted']");
    const shadowHost = Array.from(host?.querySelectorAll("*") ?? []).find(
      (el) => (el as HTMLElement).shadowRoot,
    ) as HTMLElement | undefined;
    const root = shadowHost?.shadowRoot;
    if (!root) return -1;
    let max = 0;
    for (const el of Array.from(root.querySelectorAll("*")) as HTMLElement[]) {
      const oy = getComputedStyle(el).overflowY;
      if (/auto|scroll/.test(oy) && el.clientHeight > 100) {
        max = Math.max(max, el.scrollHeight - el.clientHeight);
      }
    }
    return max;
  });
}

test.describe("Playground height fits content", () => {
  test.use({ viewport: { width: 1280, height: 1000 } });

  test("a short example keeps the reserved 320px", async ({ initTestBed, page }) => {
    await initTestBed(fence("<App><Text>Only one line</Text></App>"));
    await expect(page.getByText("Only one line")).toBeVisible();
    await expect(box(page)).toHaveAttribute("data-playground-fit", "content");
    await page.waitForTimeout(300);
    expect(await boxHeight(page)).toBeCloseTo(320, 0);
  });

  test("a tall example grows so its content does not scroll", async ({ initTestBed, page }) => {
    await initTestBed(fence(`<App>${lines(15)}</App>`));
    await expect(page.getByText("Line 15", { exact: true })).toBeAttached();
    await expect.poll(() => boxHeight(page)).toBeGreaterThan(400);
    await expect.poll(() => remainingOverflow(page)).toBeLessThanOrEqual(1);
    expect(await remainingOverflow(page)).toBeGreaterThanOrEqual(0);
    await expect(page.getByText("Line 15", { exact: true })).toBeInViewport();
  });

  test("growth stops at 85% of the viewport and the rest scrolls", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(fence(`<App>${lines(80)}</App>`));
    await expect(page.getByText("Line 80", { exact: true })).toBeAttached();
    await expect.poll(() => boxHeight(page)).toBeGreaterThan(800);
    await page.waitForTimeout(300);
    expect(await boxHeight(page)).toBeLessThanOrEqual(850);
    expect(await remainingOverflow(page)).toBeGreaterThan(0);
  });

  test("an explicit height stays fixed", async ({ initTestBed, page }) => {
    await initTestBed(fence(`<App>${lines(15)}</App>`, 'height="200px"'));
    await expect(page.getByText("Line 15", { exact: true })).toBeAttached();
    await expect(box(page)).toHaveAttribute("data-playground-fit", "fixed");
    await page.waitForTimeout(500);
    expect(await boxHeight(page)).toBeCloseTo(200, 0);
    expect(await remainingOverflow(page)).toBeGreaterThan(0);
  });

  test("the box grows again when content grows after mount", async ({ initTestBed, page }) => {
    await initTestBed(
      fence(`<App var.count="{3}">
  <Button label="Add lines" onClick="count = count + 12" />
  <Items data="{Array.from({ length: count }, (_, i) => i + 1)}">
    <Text>Row {$item}</Text>
  </Items>
</App>`),
    );
    await expect(page.getByText("Row 3", { exact: true })).toBeVisible();
    await page.waitForTimeout(300);
    const before = await boxHeight(page);
    expect(before).toBeCloseTo(320, 0);
    await page.getByRole("button", { name: "Add lines" }).click();
    await expect(page.getByText("Row 15", { exact: true })).toBeAttached();
    await expect.poll(() => boxHeight(page)).toBeGreaterThan(before + 100);
    await expect.poll(() => remainingOverflow(page)).toBeLessThanOrEqual(1);
    expect(await remainingOverflow(page)).toBeGreaterThanOrEqual(0);
  });

  test("an app that fills its box with inner scrolling does not grow", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      fence(`<App scrollWholePage="false">
  <List data="{Array.from({ length: 100 }, (_, i) => i + 1)}" height="*">
    <Text>Item {$item}</Text>
  </List>
</App>`),
    );
    await expect(page.getByText("Item 1", { exact: true })).toBeVisible();
    await page.waitForTimeout(500);
    expect(await boxHeight(page)).toBeCloseTo(320, 0);
  });

  test("a noFrame example grows too", async ({ initTestBed, page }) => {
    await initTestBed(fence(`<App>${lines(15)}</App>`, "noFrame"));
    await expect(page.getByText("Line 15", { exact: true })).toBeAttached();
    const placeholder = page.locator("[data-nested-app-lazy-state]").first();
    await expect
      .poll(() => placeholder.evaluate((el: HTMLElement) => el.getBoundingClientRect().height))
      .toBeGreaterThan(400);
    await expect.poll(() => remainingOverflow(page)).toBeLessThanOrEqual(1);
    expect(await remainingOverflow(page)).toBeGreaterThanOrEqual(0);
  });
});
