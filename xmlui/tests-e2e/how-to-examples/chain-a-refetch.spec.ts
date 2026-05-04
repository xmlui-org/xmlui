import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/chain-a-refetch.md"),
);

test.describe("Click the Like button", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Click the Like button");

  test("initial state shows the timeline posts and engagement counts", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("heading", { name: "Social Media Timeline" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "John Developer" })).toBeVisible();
    await expect(page.getByText("This is a great post about XMLUI!")).toBeVisible();
    await expect(page.getByText("5", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Jane Designer" })).toBeVisible();
    await expect(page.getByText("Learning how to chain API calls is so useful.")).toBeVisible();
    await expect(page.getByText("12", { exact: true })).toBeVisible();
  });

  test("clicking like on an unfavorited post refetches the incremented count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "like" }).first().click();

    await expect.poll(async () => await page.getByText("6", { exact: true }).count()).toBe(1);
    await expect(page.getByText("5", { exact: true })).not.toBeVisible();
  });

  test("clicking like on a favorited post refetches the decremented count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "like" }).nth(1).click();

    await expect.poll(async () => await page.getByText("11", { exact: true }).count()).toBe(1);
    await expect(page.getByText("12", { exact: true })).not.toBeVisible();
  });
});
