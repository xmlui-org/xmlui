import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/what-width-does-a-stack-child-get-by-default.md",
  ),
);

// display-only example — no interaction to test
test.describe("Default, fit-content, and star widths", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "default-fit-content-and-star-widths",
  );

  test("a widthless child matches an explicit fit-content child", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const defaultLabel = await page.getByTestId("default-label").boundingBox();
    const explicitLabel = await page.getByTestId("explicit-label").boundingBox();
    const defaultStar = await page.getByTestId("default-star").boundingBox();
    const explicitStar = await page.getByTestId("explicit-star").boundingBox();

    expect(defaultLabel).not.toBeNull();
    expect(explicitLabel).not.toBeNull();
    expect(defaultStar).not.toBeNull();
    expect(explicitStar).not.toBeNull();
    expect(defaultLabel!.width).toBeCloseTo(explicitLabel!.width, 0);
    expect(defaultStar!.width).toBeCloseTo(explicitStar!.width, 0);
    expect(defaultStar!.width).toBeGreaterThan(defaultLabel!.width);
  });

  test("two star-sized children share the available width", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const firstStar = await page.getByTestId("first-star").boundingBox();
    const secondStar = await page.getByTestId("second-star").boundingBox();

    expect(firstStar).not.toBeNull();
    expect(secondStar).not.toBeNull();
    expect(firstStar!.width).toBeCloseTo(secondStar!.width, 0);
  });
});
