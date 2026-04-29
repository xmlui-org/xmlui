import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/scope-a-theme-to-a-card-or-section.md"),
);

test.describe("Scoped themes on pricing cards", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Scoped themes on pricing cards",
  );

  test("initial state shows all three pricing tiers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$19/mo")).toBeVisible();
    await expect(page.getByText("Custom")).toBeVisible();
  });

  test("each tier shows its action button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Current plan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upgrade" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Contact sales" })).toBeVisible();
  });

  test("tier features are visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("5 projects")).toBeVisible();
    await expect(page.getByText("Unlimited projects")).toBeVisible();
    await expect(page.getByText("Unlimited everything")).toBeVisible();
  });
});
