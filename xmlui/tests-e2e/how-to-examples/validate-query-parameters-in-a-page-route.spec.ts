import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/validate-query-parameters-in-a-page-route.md",
  ),
);

test.describe("validate-ticket-list-query-parameters", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "validate-ticket-list-query-parameters",
  );

  test("initial state shows ticket navigation choices", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Ticket links")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open active tickets" })).toBeVisible();
  });

  test("valid query parameters render as typed values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open active tickets" }).click();
    await expect(page.getByText("Tickets accepted")).toBeVisible();
    await expect(page.getByText("Status: open")).toBeVisible();
    await expect(page.getByText("Page: 2")).toBeVisible();
    await expect(page.getByText("Page type: number")).toBeVisible();
  });

  test("invalid enum query parameter redirects to help", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open invalid status" }).click();
    await expect(page.getByText("Ticket URL rejected")).toBeVisible();
  });

  test("invalid numeric query parameter redirects to help", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open invalid page" }).click();
    await expect(page.getByText("Ticket URL rejected")).toBeVisible();
  });
});
