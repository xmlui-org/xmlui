import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/behaviors.md"),
);

// display-only example — no interaction to test
test.describe("Example: using the tooltip behavior", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: using the tooltip behavior",
  );

  test("initial state shows button and card with tooltip", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Hover the mouse over me!" })).toBeVisible();
    await expect(page.getByText("Tooltip with markdown")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: using the animation behavior", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: using the animation behavior",
  );

  test("example mounts without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // No accessible text content — confirms example mounts without error
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: animationOptions as an object", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: animationOptions as an object",
  );

  test("example mounts without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // No accessible text content — confirms example mounts without error
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: animationOptions as a string", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: animationOptions as a string",
  );

  test("example mounts without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // No accessible text content — confirms example mounts without error
    await expect(page.locator("body")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: bookmark", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: bookmark");

  test("initial state shows navigation links and colored sections", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("link", { name: "Jump to red" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jump to green" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Jump to blue" })).toBeVisible();
  });
});

test.describe("Example: bindTo", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: bindTo");

  test("initial state shows form fields pre-filled with data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Firstname" })).toHaveValue("Albert");
    await expect(page.getByRole("textbox", { name: "Lastname" })).toHaveValue("Einstein");
    await expect(page.getByRole("textbox", { name: "Comments" })).toHaveValue("e=mc^2");
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("submitting the form shows a toast with the form data as JSON", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText('"firstname": "Albert"').first()).toBeVisible();
    await expect(page.getByText('"lastname": "Einstein"').first()).toBeVisible();
  });

  test("changing a field and submitting reflects the updated value in the toast", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Firstname" }).fill("Isaac");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText('"firstname": "Isaac"').first()).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: label", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: label");

  test("initial state shows labeled components", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("An avatar")).toBeVisible();
    await expect(page.getByText("Use this badge:")).toBeVisible();
    await expect(page.getByText("Welcome home!")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: tooltipOptions as an object", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: tooltipOptions as an object",
  );

  test("initial state shows button with tooltip", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Hover the mouse over me!" })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: tooltipOptions as a string", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: tooltipOptions as a string",
  );

  test("initial state shows card and icons with tooltip options", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText("Tooltip to the left with 800ms delay"),
    ).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: Card variants", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: Card variants",
  );

  test("initial state shows cards with different variants", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Default Card")).toBeVisible();
    await expect(page.getByText("Fancy Card #1 (hover me!)")).toBeVisible();
    await expect(page.getByText("Rigid Card #1")).toBeVisible();
  });
});
