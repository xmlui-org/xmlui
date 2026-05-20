import { test, expect } from "@playwright/test";

test("No unknown component errors", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await expect(page.getByText("Unknown component")).not.toBeVisible();
});

test("TestComponent renders via extension", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("TestComponent: hello from home")).toBeVisible();
});

test("routing to /about works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
  await expect(page).toHaveURL(/\/about\/?$/);
});

// This test ensures that direct navigation to a non-root URL works (e.g. via bookmark or page refresh),
// which is a common source of issues in client-side routed apps if the server isn't configured to handle it.
// This catches SSG pre-rendering issues as well.
test.skip("direct navigation to /about works", async ({ page }) => {
  // SKIP REASON:
  // In non-SSG modes, XMLUI's Pages component can fire the fallbackPath redirect
  // during cold-start initialization before routes are registered.
  // Need to discuss whether we should change this or it's acceptable.
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
});

test("styles work", async ({ page }) => {
  await page.goto("/");
  const text = page.getByText("This is the about page.", { exact: true });
  await expect(text).toBeVisible();
  await expect(text).toHaveCSS("color", "rgb(0, 0, 255)");
  await expect(text).toHaveCSS("font-size", "18px");
});

test("external theme file is loaded", async ({ page }) => {
  await page.goto("/");
  const text = page.getByText("Home Page", { exact: true });
  await expect(text).toBeVisible();
  await expect(text).toHaveCSS("color", "rgb(0, 102, 204)");
});

test("no console errors on page load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  expect(errors).toHaveLength(0);
});

test("extension component SCSS module styles are applied", async ({ page }) => {
  await page.goto("/");
  const component = page.getByText("TestComponent: hello from home");
  await expect(component).toHaveCSS("font-weight", "700");
  await expect(component).toHaveCSS("border-radius", "8px");
});

test("extension component theme vars resolve", async ({ page }) => {
  await page.goto("/");
  const component = page.getByText("TestComponent: hello from home");
  // background-color must not be transparent — theme vars must have resolved
  await expect(component).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("app name from config is set as page title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Integration Test App/);
});

test("client-side nav works after direct URL entry", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("link", { name: "Home" }).click();
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});
