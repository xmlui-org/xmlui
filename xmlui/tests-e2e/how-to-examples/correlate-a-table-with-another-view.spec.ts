import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/correlate-a-table-with-another-view.md",
  ),
);

test.describe("Hover to highlight, click to pin", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Hover to highlight, click to pin",
  );

  test("renders the table and the companion items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("cell", { name: "Acme Corp" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Globex" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Initech" })).toBeVisible();
    await expect(page.getByTestId("line-Keyboard")).toBeVisible();
    await expect(page.getByTestId("line-Monitor")).toBeVisible();
    await expect(page.getByTestId("line-Webcam")).toBeVisible();
    await expect(
      page.getByText(
        "Shared Order values connect the rows: the Table's id matches each item's orderId.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Order 1", { exact: true })).toHaveCount(2);
  });

  test("hovering a row highlights its related companion rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const monitorLine = page.getByTestId("line-Monitor");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).hover();

    await expect
      .poll(() => keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(neutral);
    // Globex's items are unrelated to the hovered Acme Corp row.
    await expect(monitorLine).toHaveCSS("background-color", neutral);
  });

  test("leaving the row clears the highlight when nothing is pinned", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).hover();
    await expect
      .poll(() => keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(neutral);

    // Move the pointer off the table entirely.
    await page.getByText("Items", { exact: true }).hover();
    await expect(keyboardLine).toHaveCSS("background-color", neutral);
  });

  test("clicking pins the highlight and it survives pointer leave", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const acmeCell = page.getByTestId("order-1");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);
    const neutralAcme = await acmeCell.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).click();
    await expect(page.getByText("Pinned: order 1")).toBeVisible();

    await expect
      .poll(() => acmeCell.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(neutralAcme);

    const pinnedColor = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(pinnedColor).not.toBe(neutral);

    // Move the pointer away — the pin, not the hover, should still be driving the highlight.
    await page.getByText("Items", { exact: true }).hover();
    await expect(keyboardLine).toHaveCSS("background-color", pinnedColor);
    await expect(acmeCell).not.toHaveCSS("background-color", neutralAcme);
  });

  test("clicking the pinned row again releases it", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).click();
    await expect(page.getByText("Pinned: order 1")).toBeVisible();

    await page.getByRole("cell", { name: "Acme Corp" }).click();
    await expect(
      page.getByText("Hover an order to preview its items; click to pin."),
    ).toBeVisible();

    // The pointer is still physically over the row post-release, so it still
    // reads as hovered until the pointer actually moves off it.
    await page.getByText("Items", { exact: true }).hover();
    await expect(keyboardLine).toHaveCSS("background-color", neutral);
  });

  test("clicking a different row moves the pin", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const webcamLine = page.getByTestId("line-Webcam");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).click();
    await expect(page.getByText("Pinned: order 1")).toBeVisible();
    const pinnedColor = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Initech" }).click();
    await expect(page.getByText("Pinned: order 3")).toBeVisible();

    await expect(keyboardLine).toHaveCSS("background-color", neutral);
    await expect(webcamLine).toHaveCSS("background-color", pinnedColor);
  });

  test("hovering a different row while pinned does not move the highlight", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const keyboardLine = page.getByTestId("line-Keyboard");
    const monitorLine = page.getByTestId("line-Monitor");
    const neutral = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.getByRole("cell", { name: "Acme Corp" }).click();
    const pinnedColor = await keyboardLine.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(pinnedColor).not.toBe(neutral);

    // Hover the Globex row while Acme Corp is pinned.
    await page.getByRole("cell", { name: "Globex" }).hover();

    await expect(keyboardLine).toHaveCSS("background-color", pinnedColor);
    await expect(monitorLine).toHaveCSS("background-color", neutral);
    await expect(page.getByText("Pinned: order 1")).toBeVisible();
  });
});
