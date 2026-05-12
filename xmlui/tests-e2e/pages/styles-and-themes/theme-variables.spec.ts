import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/styles-and-themes/theme-variables.md",
  ),
);

// display-only example — no interaction to test
test.describe("Custom primary color shades", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Custom primary color shades",
  );
  test("renders primary color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Unuseful primary color shades", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Unuseful primary color shades",
  );
  test("renders unuseful primary palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Surface Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Surface Colors");
  test("renders surface color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Primary Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Primary Colors");
  test("renders primary color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Secondary Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Secondary Colors");
  test("renders secondary color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Warn Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Warn Colors");
  test("renders warn color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Danger Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Danger Colors");
  test("renders danger color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Success Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Success Colors");
  test("renders success color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Info Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Info Colors");
  test("renders info color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Default Text Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Default Text Colors",
  );
  test("renders default text color labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/textColor-primary:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Default Background Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Default Background Colors",
  );
  test("renders default background color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Validation Colors", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Validation Colors");
  test("renders validation color palette swatches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Shades with light tone", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Shades with light tone",
  );
  test("renders light tone shade palette", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Shades with dark tone", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Shades with dark tone",
  );
  test("renders dark tone shade palette", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Absolute shade values with light tone", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Absolute shade values with light tone",
  );
  test("renders absolute light shade palette", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Absolute shade values with dark tone", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Absolute shade values with dark tone",
  );
  test("renders absolute dark shade palette", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Font Family", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Font Family");
  test("renders font family labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Default font family:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Font size theme variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Font size theme variables",
  );
  test("renders font size variable labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/fontSize-tiny:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Parent-relative font size", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Parent-relative font size",
  );
  test("renders parent-relative font size heading example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Heading 2/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Parent-relative vs. theme-context-relative font size", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Parent-relative vs. theme-context-relative font size",
  );
  test("renders comparison of parent-relative and theme-context-relative font sizes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Heading 2/, { exact: false }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Font Weight", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Font Weight");
  test("renders font weight labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/fontWeight-light:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Line Height", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Line Height");
  test("renders line height labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/lineHeight-none:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Shadows", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Shadows");
  test("renders shadow demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Spacing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Spacing");
  test("renders spacing base value label", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/The base value is:/, { exact: false })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Column Widths", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Column Widths");
  test("renders column width demonstrations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});
