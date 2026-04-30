import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/hide-an-element-until-its-datasource-is-ready.md",
  ),
);

test.describe("Show content only after the DataSource loads", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Show content only after the DataSource loads",
  );

  test("initial state shows the button enabled and no result text", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Run (takes about 3s)" })).toBeEnabled();
    await expect(page.getByText(/Fruits:/)).not.toBeVisible();
  });

  test("clicking Run disables the button while the fetch is in progress", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Run (takes about 3s)" }).click();
    await expect(page.getByRole("button", { name: "Run (takes about 3s)" })).toBeDisabled();
  });

  test("result text appears and button re-enables after the fetch completes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Run (takes about 3s)" }).click();
    await expect
      .poll(() => page.getByText("Fruits: 3 found").isVisible(), { timeout: 8000 })
      .toBe(true);
    await expect(page.getByRole("button", { name: "Run (takes about 3s)" })).toBeEnabled();
  });
});
