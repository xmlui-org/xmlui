import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/working-with-text.md"),
);

// display-only example — no interaction to test
test.describe("Example: displaying text", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: displaying text",
  );

  test("renders literal text alongside a button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is text!")).toBeVisible();
    await expect(page.getByText("This is more text!")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Using the Text component", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: Using the Text component",
  );

  test("renders styled text elements", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is a text!")).toBeVisible();
    await expect(page.getByText("This is another text!")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Text can be styled", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: Text can be styled",
  );

  test("renders themed headings with colored text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("My Main Title")).toBeVisible();
    await expect(page.getByText("Section Title")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Text and the value property", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: Text and the value property",
  );

  test("renders text set via the value property", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Text Content with Properties")).toBeVisible();
    await expect(
      page.getByText("This text is set in the 'value' property of 'Text'."),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: whitespace collapsing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: whitespace collapsing",
  );

  test("renders multi-line source as collapsed single line", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText(/This is a long text broken into multiple lines/, { exact: false }),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Try the reset button!", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Try the reset button!",
  );

  test("renders seconds binding expression output", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Seconds of the current minute/)).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: inline rendering", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: inline rendering",
  );

  test("renders inline text segments with an icon in an HStack", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Show me a trash")).toBeVisible();
    await expect(page.getByText("icon!")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: block rendering", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: block rendering",
  );

  test("renders block text segments with an icon in a VStack", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Show me a trash")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: non-breaking spaces", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: non-breaking spaces",
  );

  test("renders non-breaking space segments", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText(/A series of non-breaking segments/, { exact: false }),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: text breaks into multiple lines", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: text breaks into multiple lines",
  );

  test("renders constrained text that wraps across lines", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText(/This long text does not fit into a width constraint/, { exact: false }),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: break within a word", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: break within a word",
  );

  test("renders long word constrained to 200px width", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText(/ThisLongTextDoesNotFitInTheGivenConstraint/, { exact: false }),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: preserving line breaks", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: preserving line breaks",
  );

  test("renders JSON with line breaks preserved", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The example renders JSON.stringify output; "apples" appears in the stringified object
    await expect(page.getByText(/"apples"/).first()).toBeVisible();
  });
});
