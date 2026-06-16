import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/clean-up-when-a-panel-closes.md"),
);

test.describe("Clean up a conditional details panel", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "clean-up-a-conditional-details-panel",
  );

  test("initial state shows the details panel and no cleanup runs", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Customer details")).toBeVisible();
    await expect(page.getByText("Status: Details panel is open")).toBeVisible();
    await expect(page.getByText("Cleanup runs: 0")).toBeVisible();
  });

  test("hiding the panel runs its cleanup handler", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Hide details" }).click();
    await expect(page.getByText("Customer details")).not.toBeVisible();
    await expect(page.getByText("Status: Details panel cleanup ran")).toBeVisible();
    await expect(page.getByText("Cleanup runs: 1")).toBeVisible();
  });

  test("reopening the panel starts a new lifecycle cycle", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Hide details" }).click();
    await page.getByRole("button", { name: "Show details" }).click();
    await expect(page.getByText("Customer details")).toBeVisible();
    await expect(page.getByText("Status: Details panel is open")).toBeVisible();
    await expect(page.getByText("Cleanup runs: 1")).toBeVisible();
  });
});
