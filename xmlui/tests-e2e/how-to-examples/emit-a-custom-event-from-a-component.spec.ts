import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/emit-a-custom-event-from-a-component.md",
  ),
);

test.describe("Mark tasks done by emitting an event", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Mark tasks done by emitting an event",
  );

  test("initial state shows three tasks and remaining count", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Write release notes")).toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
    await expect(page.getByText("Update dependencies")).toBeVisible();
    await expect(page.getByText("3 task(s) remaining")).toBeVisible();
  });

  test("clicking Mark Done removes the task and decrements remaining count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Mark Done" }).first().click();
    await expect(page.getByText("2 task(s) remaining")).toBeVisible();
    await expect(page.getByText("Write release notes")).not.toBeVisible();
  });

  test("marking all tasks done shows zero remaining", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Mark Done" }).first().click();
    await page.getByRole("button", { name: "Mark Done" }).first().click();
    await page.getByRole("button", { name: "Mark Done" }).first().click();
    await expect(page.getByText("0 task(s) remaining")).toBeVisible();
  });
});
