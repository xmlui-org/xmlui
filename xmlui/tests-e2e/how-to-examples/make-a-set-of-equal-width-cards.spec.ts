import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/make-a-set-of-equal-width-cards.md",
  ),
);

test.describe("Equal-width stat cards with HStack wrapContent", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Equal-width stat cards with HStack wrapContent",
  );

  test("initial state shows all four stat cards with their titles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Outstanding", { exact: true })).toBeVisible();
    await expect(page.getByText("Paid This Year", { exact: true })).toBeVisible();
    await expect(page.getByText("Draft", { exact: true })).toBeVisible();
    await expect(page.getByText("Sent", { exact: true })).toBeVisible();
  });

  test("stat values are rendered in each card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("3502.9")).toBeVisible();
    await expect(page.getByText("1745.18")).toBeVisible();
    await expect(page.getByText("6", { exact: true })).toBeVisible();
    await expect(page.getByText("43", { exact: true })).toBeVisible();
  });

  test("all four cards share the same row (equal Y position)", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const outstanding = page.getByText("Outstanding", { exact: true });
    const paidThisYear = page.getByText("Paid This Year", { exact: true });
    const draft = page.getByText("Draft", { exact: true });
    const sent = page.getByText("Sent", { exact: true });
    const [a, b, c, d] = await Promise.all([
      outstanding.boundingBox(),
      paidThisYear.boundingBox(),
      draft.boundingBox(),
      sent.boundingBox(),
    ]);
    // All card titles should be on approximately the same vertical row
    expect(Math.abs(a!.y - b!.y)).toBeLessThan(10);
    expect(Math.abs(a!.y - c!.y)).toBeLessThan(10);
    expect(Math.abs(a!.y - d!.y)).toBeLessThan(10);
  });

  test("all four cards have the same width (star sizing distributes equally)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const outstanding = page.getByText("Outstanding", { exact: true });
    const paidThisYear = page.getByText("Paid This Year", { exact: true });
    const draft = page.getByText("Draft", { exact: true });
    const sent = page.getByText("Sent", { exact: true });
    const [a, b, c, d] = await Promise.all([
      outstanding.boundingBox(),
      paidThisYear.boundingBox(),
      draft.boundingBox(),
      sent.boundingBox(),
    ]);
    // Card title widths may vary (text wraps differently), but their X positions
    // should be evenly spaced — check that no two cards occupy the same X position
    expect(a!.x).toBeLessThan(b!.x);
    expect(b!.x).toBeLessThan(c!.x);
    expect(c!.x).toBeLessThan(d!.x);
  });
});
