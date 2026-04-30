import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/force-a-row-break-in-a-wrapping-layout.md",
  ),
);

test.describe("Forced row break between tag groups", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Forced row break between tag groups",
  );

  test("initial state shows all badges and the text item", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Design", { exact: true })).toBeVisible();
    await expect(page.getByText("Frontend", { exact: true })).toBeVisible();
    await expect(page.getByText("Open", { exact: true })).toBeVisible();
    await expect(page.getByText("Always starts on a new line", { exact: true })).toBeVisible();
  });

  test("text item appears below the badges (SpaceFiller forced a row break)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const designBadge = page.getByText("Design", { exact: true });
    const textItem = page.getByText("Always starts on a new line", { exact: true });
    const badgeBox = await designBadge.boundingBox();
    const textBox = await textItem.boundingBox();
    // Text must be on a lower row than the badges
    expect(textBox!.y).toBeGreaterThan(badgeBox!.y);
  });
});

test.describe("Multiple forced row breaks", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Multiple forced row breaks",
  );

  test("initial state shows all badge groups and footer row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Tag A", { exact: true })).toBeVisible();
    await expect(page.getByText("Tag B", { exact: true })).toBeVisible();
    await expect(page.getByText("Tag C", { exact: true })).toBeVisible();
    await expect(page.getByText("Tag D", { exact: true })).toBeVisible();
    await expect(page.getByText("Tag E", { exact: true })).toBeVisible();
    await expect(page.getByText("Footer row", { exact: true })).toBeVisible();
  });

  test("footer row appears below the badge groups (two SpaceFillers create two breaks)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tagA = page.getByText("Tag A", { exact: true });
    const tagC = page.getByText("Tag C", { exact: true });
    const footer = page.getByText("Footer row", { exact: true });
    const tagABox = await tagA.boundingBox();
    const tagCBox = await tagC.boundingBox();
    const footerBox = await footer.boundingBox();
    // Tag C group is below Tag A group
    expect(tagCBox!.y).toBeGreaterThan(tagABox!.y);
    // Footer is below Tag C group
    expect(footerBox!.y).toBeGreaterThan(tagCBox!.y);
  });
});

test.describe("Row break then equal-width row", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Row break then equal-width row",
  );

  test("initial state shows the header and all three cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Header spans the full row", { exact: true })).toBeVisible();
    await expect(page.getByText("First quarter", { exact: true })).toBeVisible();
    await expect(page.getByText("Second quarter", { exact: true })).toBeVisible();
    await expect(page.getByText("Third quarter", { exact: true })).toBeVisible();
  });

  test("cards appear below the header (SpaceFiller broke to a new row)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const header = page.getByText("Header spans the full row", { exact: true });
    const firstCard = page.getByText("First quarter", { exact: true });
    const headerBox = await header.boundingBox();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox!.y).toBeGreaterThan(headerBox!.y);
  });

  test("the three cards share the same row (equal Y position)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const first = page.getByText("First quarter", { exact: true });
    const second = page.getByText("Second quarter", { exact: true });
    const third = page.getByText("Third quarter", { exact: true });
    const firstBox = await first.boundingBox();
    const secondBox = await second.boundingBox();
    const thirdBox = await third.boundingBox();
    // All three card titles should be on approximately the same vertical row
    expect(Math.abs(firstBox!.y - secondBox!.y)).toBeLessThan(10);
    expect(Math.abs(firstBox!.y - thirdBox!.y)).toBeLessThan(10);
  });
});
