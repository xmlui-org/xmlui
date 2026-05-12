import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/styles-and-themes/themes.md",
  ),
);

// All examples in themes.md are display-only — they showcase built-in themes.
// Each renders a ThemeGallery component defined in the ---comp section.
// The gallery always renders a "Warning" badge; we assert that to confirm rendering.

// display-only example — no interaction to test
test.describe("Theme: xmlui (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui (light)",
  );
  test("renders the light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui (dark)",
  );
  test("renders the dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-green (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-green (light)",
  );
  test("renders the green light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-green (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-green (dark)",
  );
  test("renders the green dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-gray (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-gray (light)",
  );
  test("renders the gray light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-gray (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-gray (dark)",
  );
  test("renders the gray dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-orange (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-orange (light)",
  );
  test("renders the orange light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-orange (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-orange (dark)",
  );
  test("renders the orange dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-purple (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-purple (light)",
  );
  test("renders the purple light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-purple (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-purple (dark)",
  );
  test("renders the purple dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-cyan (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-cyan (light)",
  );
  test("renders the cyan light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-cyan (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-cyan (dark)",
  );
  test("renders the cyan dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-red (light)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-red (light)",
  );
  test("renders the red light theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Theme: xmlui-red (dark)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Theme: xmlui-red (dark)",
  );
  test("renders the red dark theme gallery", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Warning").first()).toBeVisible();
  });
});
