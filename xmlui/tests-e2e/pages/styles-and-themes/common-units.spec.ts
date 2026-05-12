import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/styles-and-themes/common-units.md",
  ),
);

// display-only example — no interaction to test
test.describe("Border rounding", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Border rounding");
  test("renders border radius swatches with values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("20px").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Border styles", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Border styles");
  test("renders border style swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("dashed")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Color values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Color values");
  test("renders color value examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/#f0f/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Cursor values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Cursor values");
  test("renders cursor value swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("auto")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Shadow Values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Shadow Values");
  test("renders shadow value examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/12px 12px 5px orangered/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Horizontal Alignment Values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Horizontal Alignment Values",
  );
  test("renders horizontal alignment demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Vertical Alignment Values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Vertical Alignment Values",
  );
  test("renders vertical alignment demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Alignment Values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Alignment Values");
  test("renders alignment examples with descriptive text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is a long text with several words (left)")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Text Decoration Values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Text Decoration Values",
  );
  test("renders text decoration examples including underline", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("underline", { exact: true })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Setting zoom", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Setting zoom");
  test("renders zoom examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Font variant values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Font variant values",
  );
  test("renders font variant demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/This text uses normal font variant/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Text shadow examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Text shadow examples",
  );
  test("renders text shadow examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Simple shadow/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Text indent examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Text indent examples",
  );
  test("renders text indent demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/This paragraph has/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Word break examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Word break examples");
  test("renders word-break mode examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/word-break: normal/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Word spacing examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Word spacing examples",
  );
  test("renders word spacing demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/This text has/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Word wrap examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Word wrap examples");
  test("renders word-wrap mode examples", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/word-wrap: normal/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Writing mode examples", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Writing mode examples",
  );
  test("renders writing mode demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/horizontal-tb/, { exact: false })).toBeVisible();
  });
});
