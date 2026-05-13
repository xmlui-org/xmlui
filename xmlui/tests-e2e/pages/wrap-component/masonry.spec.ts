import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/masonry.md",
  ),
);

// display-only example — no interaction to test
test.describe("basic-colored-boxes-with-varying-heights-b6be", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "basic-colored-boxes-with-varying-heights-b6be",
  );

  test("renders all eight colored cards with varying heights", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Card 1 -- short")).toBeVisible();
    await expect(page.getByText("Card 2 -- tall")).toBeVisible();
    await expect(page.getByText("Card 5 -- very tall")).toBeVisible();
    await expect(page.getByText("Card 8 -- short")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("content-cards-simulated-event-listings-b82e", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "content-cards-simulated-event-listings-b82e",
  );

  test("renders the event listing cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Jazz in the Park")).toBeVisible();
    await expect(page.getByText("Farmers Market Opening Day")).toBeVisible();
    await expect(page.getByText("Art Walk")).toBeVisible();
    await expect(page.getByText("Book Sale")).toBeVisible();
  });
});
