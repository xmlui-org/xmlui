import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/iterate-without-a-container-element.md"),
);

test.describe("Dashboard stat cards with Items in HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Dashboard stat cards with Items in HStack",
  );

  test("initial state renders every metric card from Items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Active Users", { exact: true })).toBeVisible();
    await expect(page.getByText("1284", { exact: true })).toBeVisible();
    await expect(page.getByText("Open Tickets", { exact: true })).toBeVisible();
    await expect(page.getByText("47", { exact: true })).toBeVisible();
    await expect(page.getByText("Deployments", { exact: true })).toBeVisible();
    await expect(page.getByText("12", { exact: true })).toBeVisible();
    await expect(page.getByText("Uptime", { exact: true })).toBeVisible();
    await expect(page.getByText("99.8 %", { exact: true })).toBeVisible();
  });
});
