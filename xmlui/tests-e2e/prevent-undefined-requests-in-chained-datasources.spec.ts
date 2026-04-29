import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/prevent-undefined-requests-in-chained-datasources.md",
  ),
);

test.describe("Chain DataSources without undefined requests", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Chain DataSources without undefined requests",
  );

  test("shows the user name after loading", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("Ada Lovelace").isVisible()).toBe(true);
  });

  test("shows the orders after the user loads", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("Order #1001: 19.9 USD").isVisible()).toBe(true);
    await expect(page.getByText("Order #1002: 42 USD")).toBeVisible();
  });
});
