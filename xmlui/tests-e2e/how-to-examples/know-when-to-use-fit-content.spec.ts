import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/know-when-to-use-fit-content.md",
  ),
);

const widthOf = async (page: any, testId: string) => {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box).not.toBeNull();
  return box!.width;
};

// display-only example — no interaction to test
test.describe("Make one child hug its content", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "make-one-child-hug",
  );

  test("fit-content makes the child narrower than the filled sibling", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    expect(await widthOf(page, "filled-child")).toBeGreaterThan(
      await widthOf(page, "hugged-child"),
    );
  });
});

// display-only example — no interaction to test
test.describe("HStack children already hug", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "hstack-children-already-hug",
  );

  test("omitted width matches explicit fit-content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    expect(await widthOf(page, "row-default")).toBeCloseTo(
      await widthOf(page, "row-explicit"),
      0,
    );
  });
});

// display-only example — no interaction to test
test.describe("Make a nested VStack hug", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "make-a-nested-vstack-hug",
  );

  test("fit-content restores space to the starred sibling", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    expect(await widthOf(page, "nested-greedy")).toBeGreaterThan(
      await widthOf(page, "nested-victim"),
    );
    expect(await widthOf(page, "nested-restored")).toBeGreaterThan(
      await widthOf(page, "nested-hugged"),
    );
  });
});

// display-only example — no interaction to test
test.describe("Make every VStack child hug", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "make-every-vstack-child-hug",
  );

  test("itemWidth changes the default for every direct child", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    expect(await widthOf(page, "group-filled")).toBeGreaterThan(
      await widthOf(page, "group-hugged"),
    );
  });
});
