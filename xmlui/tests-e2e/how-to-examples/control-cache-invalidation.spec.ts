import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/control-cache-invalidation.md"),
);

test.describe("Update user - refreshes user list", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Update user - refreshes user list",
  );

  test("shows users and stats on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText("Total requests (from stats): 42")).toBeVisible();
    await expect(page.getByText("Users fetched: 1 time(s)")).toBeVisible();
    await expect(page.getByText("Stats fetched: 1 time(s)")).toBeVisible();
  });

  test("promoting a user refreshes users but not stats", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Users fetched: 1 time(s)")).toBeVisible();
    await expect(page.getByText("Stats fetched: 1 time(s)")).toBeVisible();
    const promoteButton = page.getByRole("button", { name: "Promote to Admin" }).first();
    await expect(promoteButton).toBeEnabled();
    await promoteButton.click();
    await expect
      .poll(() => page.getByText("Users fetched: 2 time(s)").isVisible())
      .toBe(true);
    await expect(page.getByText("Total requests (from stats): 42")).toBeVisible();
  });

  test("promoted user button becomes disabled", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Users fetched: 1 time(s)")).toBeVisible();
    const aliceButton = page.getByRole("button", { name: "Promote to Admin" }).first();
    await expect(aliceButton).toBeEnabled();
    await aliceButton.click();
    await expect.poll(() => page.getByText("Role: admin").isVisible()).toBe(true);
    await expect(aliceButton).toBeDisabled();
  });
});
