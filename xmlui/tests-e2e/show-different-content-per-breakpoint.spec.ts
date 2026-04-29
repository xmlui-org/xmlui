import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/show-different-content-per-breakpoint.md"),
);

test.describe("Table on desktop, card list on mobile", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Table on desktop, card list on mobile",
  );

  test("initial state shows Client List heading and client data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Client List")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expect(page.getByText("Globex Ltd")).toBeVisible();
    await expect(page.getByText("Initech")).toBeVisible();
    await expect(page.getByText("Umbrella Co")).toBeVisible();
    await expect(page.getByText("Hooli")).toBeVisible();
  });

  test("Active status items are visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active").first()).toBeVisible();
    await expect(page.getByText("Pending")).toBeVisible();
    await expect(page.getByText("Inactive")).toBeVisible();
  });
});
