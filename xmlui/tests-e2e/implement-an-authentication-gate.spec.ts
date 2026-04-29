import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/implement-an-authentication-gate.md"),
);

test.describe("Auth gate with conditional App rendering", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Auth gate with conditional App rendering",
  );

  test("initial state shows the authentication required screen", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Authentication Required" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Authenticate" })).toBeVisible();
  });

  test("authenticated app content is not visible before authenticating", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is only visible when authenticated.")).not.toBeVisible();
  });

  test("clicking Authenticate shows the authenticated app", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Authenticate" }).click();
    await expect(page.getByText("This is only visible when authenticated.")).toBeVisible();
  });

  test("login screen is hidden after authenticating", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Authenticate" }).click();
    await expect(page.getByRole("heading", { name: "Authentication Required" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Authenticate" })).not.toBeVisible();
  });
});
