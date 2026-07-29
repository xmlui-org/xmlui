import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/fill-remaining-vertical-space.md"),
);

test.describe("Body height: * vs auto vs a fixed value", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Body height: * vs auto vs a fixed value",
  );

  test("initial state shows the star-sized body filling the remaining space", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "*" })).toBeVisible();
    await expect(page.getByText(/Body.*height="\*"/)).toBeVisible();
    await expect(page.getByText(/Header.*natural height/)).toBeVisible();
    await expect(page.getByText(/Footer.*natural height/)).toBeVisible();
  });

  test("clicking auto updates the documented body height", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "auto" }).click();

    await expect(page.getByText(/Body.*height="auto"/)).toBeVisible();
    await expect(page.getByText(/Body.*height="\*"/)).not.toBeVisible();
  });

  test("clicking fixed height updates the documented body height", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "160px" }).click();

    await expect(page.getByText(/Body.*height="160px"/)).toBeVisible();
    await expect(page.getByText(/Body.*height="\*"/)).not.toBeVisible();
  });
});

test.describe("Top region: equal star, weighted star, or fixed", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Top region: equal star, weighted star, or fixed",
  );

  test("initial state shows both star-sized regions", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText(/Top.*height="\*"/)).toBeVisible();
    await expect(page.getByText(/Bottom.*height="\*"/)).toBeVisible();
  });

  test("clicking 2* updates the top region and keeps the bottom starred", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "2*" }).click();

    await expect(page.getByText(/Top.*height="2\*"/)).toBeVisible();
    await expect(page.getByText(/Bottom.*height="\*"/)).toBeVisible();
  });

  test("clicking 80px updates the top region and keeps the bottom starred", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "80px" }).click();

    await expect(page.getByText(/Top.*height="80px"/)).toBeVisible();
    await expect(page.getByText(/Bottom.*height="\*"/)).toBeVisible();
  });
});
