import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/consume-an-apicall-response.md",
  ),
);

test.describe("Bind to lastResult", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "bind-to-last-result");

  test("lastResult binding updates after execute(), result binding stays empty", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    // Before the call: neither binding shows a value yet.
    await expect(page.getByTestId("viaLastResult")).toHaveText("(nothing yet)");
    await expect(page.getByTestId("viaResult")).toHaveText("(nothing — silently undefined)");

    await page.getByRole("button", { name: "Load user" }).click();

    // The recipe: lastResult updates once the call completes.
    await expect(page.getByTestId("viaLastResult")).toHaveText("Ada Lovelace — Engineer");

    // The trap: a `result`-named binding never updates — APICall has no such property.
    await expect(page.getByTestId("viaResult")).toHaveText("(nothing — silently undefined)");
  });

  test("a second execute() does not flash the bound text empty", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const loadButton = page.getByRole("button", { name: "Load user" });
    await loadButton.click();
    await expect(page.getByTestId("viaLastResult")).toHaveText("Ada Lovelace — Engineer");

    await loadButton.click();
    // Never observably reverts to "(nothing yet)" between calls.
    await expect(page.getByTestId("viaLastResult")).not.toHaveText("(nothing yet)");
    await expect(page.getByTestId("viaLastResult")).toHaveText("Ada Lovelace — Engineer");
  });
});

test.describe("Reshape the response with onSuccess", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "reshape-with-onsuccess",
  );

  test("onSuccess reshapes and accumulates across calls", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByTestId("summary")).toHaveText("(nothing yet)");
    await expect(page.getByTestId("totalFound")).toHaveText("Total results seen this session: 0");

    const searchButton = page.getByRole("button", { name: "Search" });
    await searchButton.click();
    await expect(page.getByTestId("summary")).toHaveText("2 result(s) in 42ms");
    await expect(page.getByTestId("totalFound")).toHaveText("Total results seen this session: 2");

    await searchButton.click();
    // Accumulates rather than resetting — proof onSuccess is combining with existing state.
    await expect(page.getByTestId("totalFound")).toHaveText("Total results seen this session: 4");
  });
});
