import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/center-content-vertically-in-a-filled-container.md",
  ),
);

test.describe("Vertical centering needs a filled region", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Vertical centering needs a filled region",
  );

  test("initial state shows the filled region mode", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Filled" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Auto" })).toBeVisible();
    await expect(page.getByText("Region height: *")).toBeVisible();
    await expect(
      page.getByText('verticalAlignment="center" works when this region fills the remaining height.'),
    ).toBeVisible();
  });

  test("clicking Auto shows the collapsed content-height mode", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Auto" }).click();

    await expect(page.getByText("Region height: auto")).toBeVisible();
    await expect(page.getByText("Region height: *")).not.toBeVisible();
  });

  test("clicking Filled restores the starred region", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Auto" }).click();
    await expect(page.getByText("Region height: auto")).toBeVisible();

    await page.getByRole("button", { name: "Filled" }).click();
    await expect(page.getByText("Region height: *")).toBeVisible();
    await expect(page.getByText("Region height: auto")).not.toBeVisible();
  });
});
