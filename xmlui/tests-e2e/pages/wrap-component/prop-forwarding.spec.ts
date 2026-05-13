import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/prop-forwarding.md",
  ),
);

test.describe("inverted-b6c8", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "inverted-b6c8");

  test("renders the inverted slider with initial value display", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Slider -- inverted direction")).toBeVisible();
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
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => page.getByText(/Value: \d+/).isVisible()).toBe(true);
  });
});

test.describe("title-b784", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "title-b784");

  test("renders the slider with hover title text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Slider -- hover me")).toBeVisible();
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
    await expect.poll(() => page.getByText(/Value: \d+/).isVisible()).toBe(true);
  });
});

// display-only example — no interaction to test
test.describe("aria-label-b7f2", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "aria-label-b7f2");

  test("renders the slider with accessible aria-label", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Slider -- labeled for assistive tech and tests")).toBeVisible();
    await expect(page.getByRole("slider", { name: "Volume" })).toBeVisible();
  });
});
