import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/delay-a-datasource-until-another-datasource-is-ready.md",
  ),
);

test.describe("Load departments only after users are ready", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Load departments only after users are ready",
  );

  test("initial state shows only the Run button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "User" })).not.toBeVisible();
    await expect(page.getByText("undefined")).not.toBeVisible();
  });

  test("Run loads users then departments and renders resolved Select options", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Run" }).click();

    const userSelect = page.getByRole("combobox", { name: "User" });
    await expect(userSelect).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("undefined")).not.toBeVisible();

    await userSelect.click();
    await expect(page.getByRole("option", { name: "Alice (Engineering)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Bob (Marketing)" })).toBeVisible();
  });

  test("selecting a loaded user updates the Select value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Run" }).click();

    const userSelect = page.getByRole("combobox", { name: "User" });
    await expect(userSelect).toBeVisible({ timeout: 5000 });
    await userSelect.click();
    await page.getByRole("option", { name: "Bob (Marketing)" }).click();

    await expect(userSelect).toHaveText("Bob (Marketing)");
  });
});
