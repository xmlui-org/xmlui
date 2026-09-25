import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/align-values-in-collapsible-summaries.md",
  ),
);

const DETAILS_ROWS = ["Rent", "Groceries", "Utilities", "Parking"];

test.describe("Aligned values in ExpandableItem summaries", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Aligned values in ExpandableItem summaries",
  );

  test("renders one collapsed summary per row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator('[data-part-id="summary"]')).toHaveCount(4);
    for (const title of DETAILS_ROWS) {
      await expect(page.getByText(title, { exact: true })).toBeVisible();
    }
    await expect(page.getByText("Paid on the 1st.")).not.toBeVisible();
  });

  test("the value text ends at the same x in every row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const rights: number[] = [];
    for (const amount of ["1,850", "884", "211", "7"]) {
      const value = page.getByText(amount, { exact: true });
      await expect(value).toBeVisible();
      // Right edge of the rendered glyphs, not of the fixed-width box.
      rights.push(
        await value.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect().right;
        }),
      );
    }
    for (const right of rights) {
      expect(Math.abs(right - rights[0])).toBeLessThan(0.5);
    }
  });

  test("the labels start at the same x in every row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const lefts: number[] = [];
    for (const title of DETAILS_ROWS) {
      const box = await page.getByText(title, { exact: true }).boundingBox();
      lefts.push(box!.x);
    }
    for (const left of lefts) {
      expect(Math.abs(left - lefts[0])).toBeLessThan(0.5);
    }
  });
});

test.describe("A DETAILS block in Markdown", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "A DETAILS block in Markdown",
  );

  test("each DETAILS blockquote becomes a collapsed section", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const summaries = page.locator('[data-part-id="summary"]');
    await expect(summaries).toHaveCount(2);
    await expect(summaries.nth(0)).toHaveText("Rent");
    await expect(summaries.nth(1)).toHaveText("Groceries");
    await expect(page.getByText("Paid on the 1st.")).not.toBeVisible();
  });

  test("clicking a summary reveals its content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part-id="summary"]').filter({ hasText: "Rent" }).click();
    await expect(page.getByText("Paid on the 1st.")).toBeVisible();
  });
});

test.describe("Leading figure spaces are trimmed; an anchor keeps them", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Leading figure spaces are trimmed; an anchor keeps them",
  );

  test("a leading U+2007 is trimmed, a leading U+2800 is not", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const summaries = page.locator('[data-part-id="summary"]');
    await expect(summaries).toHaveCount(2);

    const noAnchor = await summaries.nth(0).textContent();
    const withAnchor = await summaries.nth(1).textContent();

    expect(noAnchor!.startsWith("7")).toBe(true);
    expect(noAnchor).not.toContain("\u2007");
    expect(withAnchor!.startsWith("\u2800\u2007\u2007\u2007" + "7")).toBe(true);
  });
});

test.describe("The padded recipe with proportional digits", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "The padded recipe with proportional digits",
  );

  test("summaries keep their padding and use the default numeric variant", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const summaries = page.locator('[data-part-id="summary"]');
    await expect(summaries).toHaveCount(4);
    // Compare textContent exactly: toHaveText would normalize U+2007/U+2008 as whitespace.
    expect(await summaries.nth(1).textContent()).toBe("\u2800\u2007\u2008884 — Groceries");
    expect(await summaries.nth(3).textContent()).toBe("\u2800\u2007\u2008\u2007\u20077 — Parking");
    for (let i = 0; i < 4; i++) {
      await expect(summaries.nth(i)).toHaveCSS("font-variant-numeric", "normal");
    }
  });
});

test.describe("The padded recipe with tabular figures", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "The padded recipe with tabular figures",
  );

  test("fontVariant on Markdown turns on tabular figures in every summary", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const summaries = page.locator('[data-part-id="summary"]');
    await expect(summaries).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(summaries.nth(i)).toHaveCSS("font-variant-numeric", "tabular-nums");
    }
  });
});
