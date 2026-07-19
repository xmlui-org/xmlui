import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/protect-a-page-with-a-route-guard.md",
  ),
);

test.describe("cancel-protected-admin-navigation-with-willnavigate", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "cancel-protected-admin-navigation-with-willnavigate",
  );

  test("initial state starts signed out", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Workspace home")).toBeVisible();
    await expect(page.getByText("Signed in as admin: no")).toBeVisible();
    await expect(page.getByText("Guard decision: not checked")).toBeVisible();
  });

  test("willNavigate blocks signed-out users before the route changes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open admin" }).click();
    await expect(page.getByText("Workspace home")).toBeVisible();
    await expect(page.getByText("Guard decision: blocked /admin")).toBeVisible();
  });

  test("willNavigate allows the page after sign in", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Sign in as admin" }).click();
    await expect(page.getByText("Admin console")).toBeVisible();
    await expect(page.getByText("The guard allowed this navigation.")).toBeVisible();
    await expect(page.getByText("Guard decision: allowed /admin")).toBeVisible();
  });
});
