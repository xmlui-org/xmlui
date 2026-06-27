import { expect, test, type Page } from "@playwright/test";

async function selectComboboxOption(page: Page, label: string) {
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: label }).click();
}

test("layout built-ins compose children and preserve button updates", async ({ page }) => {
  await page.goto("/?example=builtinsLayout");

  await expect(page.getByRole("heading", { name: "Built-ins layout" })).toBeVisible();
  await expect(page.getByText("Count: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Increment layout count" }).click();
  await expect(page.getByText("Count: 1", { exact: true })).toBeVisible();
});

test("Items renders itemTemplate with $item and $itemIndex context", async ({ page }) => {
  await page.goto("/?example=builtinsItems");

  await expect(page.getByRole("heading", { name: "Built-ins items" })).toBeVisible();
  await expect(page.getByText("0: Build", { exact: true })).toBeVisible();
  await expect(page.getByText("1: Test", { exact: true })).toBeVisible();
  await expect(page.getByText("Active: none", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Pick Test" }).click();
  await expect(page.getByText("Active: test", { exact: true })).toBeVisible();
});

test("input built-ins emit didChange payloads into XMLUI state", async ({ page }) => {
  await page.goto("/?example=builtinsInputs");

  await expect(page.getByRole("heading", { name: "Built-ins inputs" })).toBeVisible();
  await expect(page.getByText("Name: none", { exact: true })).toBeVisible();
  await expect(page.getByText("Enabled: no", { exact: true })).toBeVisible();
  await expect(page.getByText("Status: open", { exact: true })).toBeVisible();

  await page.getByPlaceholder("Name").fill("Ada");
  await page.getByLabel("Enabled").check();
  await selectComboboxOption(page, "Closed");

  await expect(page.getByText("Name: Ada", { exact: true })).toBeVisible();
  await expect(page.getByText("Enabled: yes", { exact: true })).toBeVisible();
  await expect(page.getByText("Status: closed", { exact: true })).toBeVisible();
});

test("combined built-in task filter reacts to text, checkbox, and select state", async ({ page }) => {
  await page.goto("/?example=builtinsTaskFilter");

  await expect(page.getByRole("heading", { name: "Built-ins task filter" })).toBeVisible();
  await expect(page.getByText("Write notes", { exact: true })).toBeVisible();
  await expect(page.getByText("Review plan", { exact: true })).toBeVisible();
  await expect(page.getByText("Archive draft", { exact: true })).not.toBeVisible();

  await page.getByPlaceholder("Search tasks").fill("review");
  await expect(page.getByText("Write notes", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Review plan", { exact: true })).toBeVisible();

  await selectComboboxOption(page, "All");
  await page.getByPlaceholder("Search tasks").fill("archive");
  await expect(page.getByText("Archive draft", { exact: true })).toBeVisible();

  await page.getByLabel("Only open").check();
  await expect(page.getByText("Archive draft", { exact: true })).not.toBeVisible();
  await expect(page.getByText("Review plan", { exact: true })).not.toBeVisible();
});
