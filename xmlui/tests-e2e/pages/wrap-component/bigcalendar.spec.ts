import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/bigcalendar.md",
  ),
);

// display-only example — no interaction to test
test.describe("demo-b8b7", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "demo-b8b7");

  test("renders the BigCalendar component", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-calendar" });
    // BigCalendar renders a calendar grid
    await expect(page.getByRole('table', { name: 'Month View' })).toBeVisible();
  });
});
