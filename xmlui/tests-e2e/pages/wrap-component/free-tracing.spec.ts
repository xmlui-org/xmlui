import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/free-tracing.md",
  ),
);

test.describe("slider-interact-then-inspect-b6d7", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "slider-interact-then-inspect-b6d7",
  );

  test("renders the slider with initial value display", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("slider")).toBeVisible();
    await expect(page.getByText("Value:")).toBeVisible();
  });

  test("interacting with the slider updates the displayed value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const slider = page.getByRole("slider");
    await slider.focus();
    await expect(slider).toBeFocused();
    await page.keyboard.press("ArrowRight");
    // Slider starts at 50; ArrowRight moves to 51 and fires onDidChange
    await expect.poll(() => page.getByText("Value: 51").isVisible()).toBe(true);
  });
});
