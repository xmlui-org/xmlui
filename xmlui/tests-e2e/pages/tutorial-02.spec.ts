import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-02.md"),
);

test.describe("Try clicking the ToneSwitch", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Try clicking the ToneSwitch",
  );

  test("renders footer with XMLUI attribution and ToneSwitch", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Built with XMLUI")).toBeVisible();
    await expect(page.getByRole("switch")).toBeVisible();
  });

  test("ToneSwitch toggles between light and dark tone", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const toneSwitch = page.getByRole("switch");
    await expect(toneSwitch).not.toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).toBeChecked();
    await toneSwitch.click({ force: true });
    await expect(toneSwitch).not.toBeChecked();
  });
});
