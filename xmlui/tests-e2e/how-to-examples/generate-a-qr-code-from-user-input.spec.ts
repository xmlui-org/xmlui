import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/generate-a-qr-code-from-user-input.md"),
);

test.describe("Type a URL to generate a QR code", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Type a URL to generate a QR code");

  test("initial state shows default URL and character count", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Characters: 17 / 2953")).toBeVisible();
  });

  test("Clear button empties the input and resets character count to zero", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("Characters: 0 / 2953")).toBeVisible();
  });

  test("Copy link button restores the default URL", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("Characters: 0 / 2953")).toBeVisible();
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByText("Characters: 17 / 2953")).toBeVisible();
  });

  test("typing updates the character count reactively", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Clear" }).click();
    await page.getByRole("textbox").fill("hello");
    await expect(page.getByText("Characters: 5 / 2953")).toBeVisible();
  });
});
