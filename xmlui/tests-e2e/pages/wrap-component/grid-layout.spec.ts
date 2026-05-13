import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/grid-layout.md",
  ),
);

// display-only example — no interaction to test
test.describe("dashboard-demo-b6cf", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "dashboard-demo-b6cf",
  );

  test("renders the dashboard grid with all five cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-grid-layout" });
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Recent Orders")).toBeVisible();
    await expect(page.getByText("Top Products")).toBeVisible();
    await expect(page.getByText("Support Tickets")).toBeVisible();
  });
});
