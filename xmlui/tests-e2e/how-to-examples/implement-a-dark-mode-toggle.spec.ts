import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/implement-a-dark-mode-toggle.md"),
);

test.describe("Dark-mode toggle with ToneSwitch", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Dark-mode toggle with ToneSwitch",
  );

  test("initial state renders dashboard card and buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Your analytics at a glance")).toBeVisible();
    await expect(page.getByRole("button", { name: "Primary action" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secondary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Danger" })).toBeVisible();
  });

  test("ToneSwitch toggle is visible in header", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("switch")).toBeVisible();
  });
});
