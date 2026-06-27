import { expect, test, type Page } from "@playwright/test";

test("home route renders the migrated website shell", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Display milestone" })).toBeVisible();
  await expect(page.getByText("Website blocks: loaded")).toBeVisible();
  await expect(page.getByText("Search package: loaded")).toBeVisible();
  expect(errors).toEqual([]);
});

test("docs smoke route renders migrated extension packages and state updates", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs");

  await expect(page.getByRole("heading", { name: "Documentation quick check" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Masonry extension check" })).toBeVisible();
  await expect(page.getByText("Alpha")).toBeVisible();
  await expect(page.locator("smart-gauge")).toHaveCount(1);
  await expect(page.getByText("Gauge value: 42")).toBeVisible();
  await page.getByRole("button", { name: "Set gauge to 72" }).click();
  await expect(page.getByText("Gauge value: 72")).toBeVisible();

  await expect(page.getByRole("heading", { name: "EChart extension check" })).toBeVisible();
  await expect(page.locator("svg").first()).toBeVisible();
  await expect(page.getByText("Chart boost: 0")).toBeVisible();
  await page.getByRole("button", { name: "Boost chart data" }).click();
  await expect(page.getByText("Chart boost: 5")).toBeVisible();

  await expect(page.locator(".rbc-calendar")).toHaveCount(1);
  await expect(page.getByText("Visual Check 0")).toBeVisible();
  await page.getByRole("button", { name: "Advance calendar smoke" }).click();
  await expect(page.getByText("Calendar shift: 1")).toBeVisible();
  await expect(page.getByText("Visual Check 1")).toBeVisible();

  await expect(page.locator(".react-grid-layout")).toHaveCount(1);
  await expect(page.locator(".react-grid-item")).toHaveCount(3);
  await expect(page.getByText("Layout tile: 0")).toBeVisible();
  await page.getByRole("button", { name: "Advance grid layout smoke" }).click();
  await expect(page.getByText("Layout tile: 1")).toBeVisible();

  await expect(page.locator(".ProseMirror")).toHaveCount(1);
  await expect(page.getByText("Editor value: Initial rich text")).toBeVisible();
  await page.getByRole("button", { name: "Update editor content" }).click();
  await expect(page.getByText("Editor value: Updated rich text")).toBeVisible();

  await expect(page.getByText("Docs state updates: 0")).toBeVisible();
  await page.getByRole("button", { name: "Update docs state" }).click();
  await expect(page.getByText("Docs state updates: 1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("copied docs markdown route renders real website content", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/docs/intro");

  await expect(page.getByRole("heading", { name: "Introduction" })).toBeVisible();
  await expect(page.getByText("building user interfaces declaratively")).toBeVisible();
  await expect(page.getByText("tiny app that reports the status")).toBeVisible();
  await expect(page.getByText("Markup. You write XMLUI apps")).toBeVisible();
  expect(errors).toEqual([]);
});

test("blog routes render copied website posts", async ({ page }) => {
  const errors = trackBrowserErrors(page);

  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Introducing XMLUI/ })).toBeVisible();

  await page.goto("/blog/introducing-xmlui");
  await expect(page.getByRole("heading", { name: "Introducing XMLUI" })).toBeVisible();
  await expect(page.getByText("## Components")).toBeVisible();
  await expect(page.getByText("## Reactivity")).toBeVisible();
  expect(errors).toEqual([]);
});

function trackBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}
