import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/read-data-with-a-post-request.md",
  ),
);

test.describe("Pick a file to annotate", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Pick a file to annotate",
  );

  test("the POST-backed DataSource fetches on mount", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    // Nothing triggers this request but mounting — which is the whole point of
    // using DataSource rather than an APICall the app has to execute itself.
    await expect(page.getByText("the quick brown fox")).toBeVisible();
    await expect(page.getByText("jumps over the lazy dog")).toBeVisible();
  });

  test("the response is annotated by the server, not the client", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    // Line numbers and word counts come back in the response body.
    await expect(page.getByText("4 words").first()).toBeVisible();
    await expect(page.getByText("5 words").first()).toBeVisible();
  });

  test("changing the body refetches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("the quick brown fox")).toBeVisible();

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "beta.txt" }).click();

    // The request re-fires because `body` is a binding — no ChangeListener,
    // no explicit execute() call.
    await expect(page.getByText("pack my box with five")).toBeVisible();
    await expect(page.getByText("dozen liquor jugs")).toBeVisible();
    await expect(page.getByText("the quick brown fox")).not.toBeVisible();
  });
});
