import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";
import { SKIP_REASON } from "../../src/testing/component-test-helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/reactive-intro.md"),
);

// NOTE: Both examples hit api.tfl.gov.uk which is unavailable in the test environment.
// Tests assert structural rendering only (combobox/table visibility).
test.describe("Pick a station", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Pick a station");

  test.skip(
    "renders the Select with Bakerloo as the initial value",
    SKIP_REASON.OTHER(
      "api.tfl.gov.uk is an external api that we have no control over - need to leverage options",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      await expect(page.getByRole("combobox")).toBeVisible();
      await expect(page.getByRole("combobox")).toContainText("Bakerloo");
    },
  );

  test(
    "opens the dropdown and shows tube line options",
    SKIP_REASON.OTHER(
      "api.tfl.gov.uk is an external api that we have no control over - need to leverage options",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      await page.getByRole("combobox").click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(page.getByRole("option", { name: "Central" })).toBeVisible();
    },
  );
});

test.describe("Results in a table", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Results in a table");

  test(
    "renders the Select with Bakerloo as the initial value",
    SKIP_REASON.OTHER(
      "api.tfl.gov.uk is an external api that we have no control over - need to leverage options",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      await expect(page.getByRole("combobox")).toBeVisible();
      await expect(page.getByRole("combobox")).toContainText("Bakerloo");
    },
  );

  test(
    "opens the dropdown and shows tube line options",
    SKIP_REASON.OTHER(
      "api.tfl.gov.uk is an external api that we have no control over - need to leverage options",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      await page.getByRole("combobox").click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(page.getByRole("option", { name: "Central" })).toBeVisible();
    },
  );
});
