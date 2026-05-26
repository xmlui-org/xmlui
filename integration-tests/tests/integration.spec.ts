import { expect } from "@playwright/test";
import { test } from "./fixtures";

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
