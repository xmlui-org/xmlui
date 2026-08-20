import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/share-one-datasource-fetch-across-components.md",
  ),
);

test.describe("Two consumers, one fetch", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Two consumers, one fetch",
  );

  // The claim the whole how-to rests on, and the one a reader cannot see without
  // the server-side counter: two mounted DataSources against the same URL cost
  // one request, not two.
  test("two DataSources against the same url produce a single fetch", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("server calls: 1")).toHaveCount(2);
    await expect(page.getByText("queue: 41")).toHaveCount(2);
  });

  test("refetch on one consumer updates both", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("server calls: 1")).toHaveCount(2);

    await page.getByRole("button", { name: "Refresh" }).click();

    // Both move together because refetch() invalidates the shared entry rather
    // than the calling component's private copy.
    await expect(page.getByText("server calls: 2")).toHaveCount(2);
    await expect(page.getByText("queue: 42")).toHaveCount(2);
  });
});

test.describe("The anti-pattern: per-component ticks", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "The anti-pattern: per-component ticks",
  );

  // The counterpart claim: a per-component tick in the URL splits the cache, so
  // the consumers drift. If this ever starts behaving as "shared", the
  // anti-pattern section has stopped being true and the how-to needs rewriting.
  test("independent ticks split the cache and the consumers diverge", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    // Both ticks start equal, so the URLs are identical and the cards DO share at
    // first. This is what makes the bug survive review: it looks correct on load.
    await expect(page.getByText("server calls: 1")).toHaveCount(2);

    await page.getByRole("button", { name: "Refresh A" }).click();

    // The first independent refresh changes one URL, splitting the cache. Only A
    // moves, and nothing warns — the two cards simply disagree from here on.
    await expect(page.getByText("server calls: 2")).toHaveCount(1);
    await expect(page.getByText("server calls: 1")).toHaveCount(1);
  });
});
