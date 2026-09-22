import { expect } from "@playwright/test";
import { test, projectNames } from "./fixtures";

test("No unknown component errors", async ({ page }) => {
  await page.gotoWithMode("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await expect(page.getByText("Unknown component")).not.toBeVisible();
});

test("TestComponent renders via extension", async ({ page }) => {
  await page.gotoWithMode("/");
  await expect(page.getByText("TestComponent: hello from home")).toBeVisible();
});

test("routing to /about works", async ({ page }) => {
  await page.gotoWithMode("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
  await expect(page).toHaveURL(/\/about\/?$/);
});

test("direct navigation to /about works", async ({ page }) => {
  await page.gotoWithMode("/about");
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
});

test("styles work", async ({ page }) => {
  await page.gotoWithMode("/");
  const text = page.getByText("This is the home page.", { exact: true });
  await expect(text).toBeVisible();
  await expect(text).toHaveCSS("color", "rgb(0, 0, 255)");
  await expect(text).toHaveCSS("font-size", "18px");
});

test("external theme file is loaded", async ({ page }) => {
  await page.gotoWithMode("/");
  const text = page.getByText("Home Page", { exact: true });
  await expect(text).toBeVisible();
  await expect(text).toHaveCSS("color", "rgb(0, 102, 204)");
});

test("no console errors on page load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.gotoWithMode("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  expect(errors).toHaveLength(0);
});

test("extension component SCSS module styles are applied", async ({ page }) => {
  await page.gotoWithMode("/");
  const component = page.getByText("TestComponent: hello from home");
  await expect(component).toHaveCSS("font-weight", "700");
  await expect(component).toHaveCSS("border-radius", "8px");
});

test("extension component theme vars resolve", async ({ page }) => {
  await page.gotoWithMode("/");
  const component = page.getByText("TestComponent: hello from home");
  // background-color must not be transparent — theme vars must have resolved
  await expect(component).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("app name from config is set as page title", async ({ page }) => {
  await page.gotoWithMode("/");
  await expect(page).toHaveTitle(/Integration Test App/);
});

test("client-side nav works after direct URL entry", async ({ page }) => {
  await page.gotoWithMode("/about");
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

// The standalone test app loads the UMD bundle into an already-parsed document
// (see test-app/index.js), so every test above covers the late-load path that
// xmlui-org/xmlui#3786 reported as a silent blank page. What those tests do not
// cover is the run-once guard that makes the fix safe for apps which adopted the
// re-dispatch workaround — that needs a second event.
test("boots once when DOMContentLoaded is re-dispatched after a late load", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== projectNames.STANDALONE,
    "guards the standalone bundle's own boot path",
  );

  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.gotoWithMode("/");
  await expect(page.getByRole("heading", { name: "Home Page", exact: true })).toHaveCount(1);

  // The workaround #3786 forced on downstream apps: re-dispatch the event the
  // late-loaded bundle missed. With the readyState fallback in place the app has
  // already booted, so this must be a no-op rather than a second boot.
  await page.evaluate(() => document.dispatchEvent(new Event("DOMContentLoaded")));

  await expect(page.getByRole("heading", { name: "Home Page", exact: true })).toHaveCount(1);
  expect(errors).toHaveLength(0);
});
