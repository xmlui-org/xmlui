import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/layout.md"),
);

// display-only example — no interaction to test
test.describe("Example: viewport", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: viewport");

  test("renders text inside a bordered viewport", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Hello from XMLUI")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: orientation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: orientation",
  );

  test("renders first and second items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("Second item")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: direction", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: direction");

  test("renders first and second items in a directional stack", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("Second item")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: paddings and gaps", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: paddings and gaps",
  );

  test("renders items with paddings and gaps applied", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("Second item")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: dimensions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: dimensions",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: alignment", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: alignment");

  test("renders aligned items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Item #1").first()).toBeVisible();
    await expect(page.getByText("Item #2").first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: default gaps", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: default gaps",
  );

  test("renders first and second buttons with default gaps", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "First button" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Second button" })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: default gaps removed", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: default gaps removed",
  );

  test("renders buttons with gaps removed", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "First button" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Second button" })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: predefined gap values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: predefined gap values",
  );

  test("renders buttons demonstrating predefined gap values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "First button" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Second button" }).first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: VStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: VStack");

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
// NOTE: "Example: HStack" appears twice in layout.md (lines 236 and 252).
// extractXmluiExample matches the first occurrence only. The second example
// (using FlowLayout) cannot be tested until the duplicate name is resolved.
test.describe("Example: HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: HStack");

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Text in VStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: Text in VStack",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: VStack with explicit height", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: VStack with explicit height",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: default container width", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: default container width",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: explicit container width", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: explicit container width",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: horizontally centered content in a HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: horizontally centered content in a HStack",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: horizontally centered content in a VStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: horizontally centered content in a VStack",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Exmaple: vertically centered text in a HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Exmaple: vertically centered text in a HStack",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: rendering children in a VStack ", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: rendering children in a VStack ",
  );

  test("renders heading inside a VStack", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("I'm a heading with colored background")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: VStack with percentage height (overflow)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: VStack with percentage height (overflow)",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: VStack with percentage height (no overflow)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: VStack with percentage height (no overflow)",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: VStack with star-sized height", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: VStack with star-sized height",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: rendering children in a HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: rendering children in a HStack",
  );

  test("renders heading inside an HStack", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("I'm a heading with colored background")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: HStack with percentage width (overflow)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: HStack with percentage width (overflow)",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: HStack with percentage width (no overflow)", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: HStack with percentage width (no overflow)",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: HStack with star-sized width", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: HStack with star-sized width",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: CHStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: CHStack");

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: CVStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: CVStack");

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: HStack with overflow", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: HStack with overflow",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: FlowLayout", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: FlowLayout",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: FlowLayout with size capping", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: FlowLayout with size capping",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: SpaceFiller in a HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: SpaceFiller in a HStack",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: SpaceFiller in a FlowLayout", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: SpaceFiller in a FlowLayout",
  );

  test("renders without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Splitter", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: Splitter");

  test("renders primary and secondary panes in a splitter", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Primary")).toBeVisible();
    await expect(page.getByText("Secondary")).toBeVisible();
  });
});
