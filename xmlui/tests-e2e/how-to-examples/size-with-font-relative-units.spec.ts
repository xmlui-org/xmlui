import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/size-with-font-relative-units.md",
  ),
);

const widthOf = async (page: any, testId: string) => {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box).not.toBeNull();
  return box!.width;
};

// display-only example — no interaction to test
test.describe("One wrapper sets the column width", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "one-wrapper-sets-column-width",
  );

  test("different-font children fill the same wrapper width", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    expect(await widthOf(page, "path-heading")).toBeCloseTo(
      await widthOf(page, "path-value"),
      0,
    );

    const headingFont = await page
      .getByTestId("path-heading")
      .evaluate((element) => getComputedStyle(element).fontFamily);
    const valueFont = await page
      .getByTestId("path-value")
      .evaluate((element) => getComputedStyle(element).fontFamily);
    expect(headingFont).not.toBe(valueFont);
  });
});

// display-only example — no interaction to test
test.describe("Same ch count, different fonts", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "same-ch-count-different-fonts",
  );

  test("identical ch counts produce materially different physical widths", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const caption = await widthOf(page, "caption-20ch");
    const code = await widthOf(page, "code-20ch");
    expect(Math.abs(caption - code)).toBeGreaterThan(20);
  });
});

// display-only example — no interaction to test
test.describe("Valid and invalid ch bindings", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "valid-and-invalid-ch-bindings",
  );

  test("valid ch stays compact while an invalid width falls back to the parent width", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const parent = await widthOf(page, "binding-parent");
    const valid = await widthOf(page, "valid-width");
    const invalid = await widthOf(page, "invalid-width");

    expect(valid).toBeLessThan(parent * 0.8);
    expect(invalid).toBeCloseTo(parent, 0);
  });
});
