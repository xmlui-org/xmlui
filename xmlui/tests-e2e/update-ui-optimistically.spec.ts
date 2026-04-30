import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/update-ui-optimistically.md"),
);

test.describe("Click the Like button - immediate feedback", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Click the Like button - immediate feedback",
  );

  test("initial state shows the timeline posts and like buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("John Developer")).toBeVisible();
    await expect(page.getByText("This is a great post about XMLUI!")).toBeVisible();
    await expect(page.getByText("Jane Designer")).toBeVisible();
    await expect(page.getByText("Learning optimistic UI updates!")).toBeVisible();
    await expect(page.getByText("Taylor QA")).toBeVisible();
    await expect(
      page.getByText("This write is set up to fail so you can see rollback."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "like" })).toHaveCount(3);
  });

  test("clicking like on an unfavorited post updates immediately and keeps the server value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "like" }).first().click();

    await expect(page.getByText("6", { exact: true })).toBeVisible();
    await expect.poll(async () => await page.getByText("Post favorited!").count()).toBe(1);
    await expect(page.getByText("6", { exact: true })).toBeVisible();
  });

  test("clicking like on a favorited post updates immediately and keeps the server value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "like" }).nth(1).click();

    await expect(page.getByText("11", { exact: true })).toBeVisible();
    await expect.poll(async () => await page.getByText("Post unfavorited!").count()).toBe(1);
    await expect(page.getByText("11", { exact: true })).toBeVisible();
  });

  test("a failed favorite rolls back and shows an error toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "like" }).nth(2).click();

    await expect(page.getByText("8", { exact: true })).toBeVisible();
    await expect.poll(async () => await page.getByText("Could not save that change.").count()).toBe(
      1,
    );
    await expect(page.getByText("7", { exact: true })).toBeVisible();
    await expect(page.getByText("8", { exact: true })).not.toBeVisible();
    await expect(page.getByText("This write is set up to fail so you can see rollback.")).toBeVisible();
  });
});
