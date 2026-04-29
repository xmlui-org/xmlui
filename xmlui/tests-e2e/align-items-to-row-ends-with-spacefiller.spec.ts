import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/align-items-to-row-ends-with-spacefiller.md"),
);

test.describe("Page header with title and actions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Page header with title and actions");

  test("initial state shows the header with title and action buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Project Hub")).toBeVisible();
    await expect(page.getByRole("button", { name: "New Project" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("Main content area")).toBeVisible();
  });
});

test.describe("Three zones: left, center, right", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Three zones: left, center, right");

  test("initial state shows Back button, Page Title, and Next button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByText("Page Title")).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  });
});

test.describe("Toolbar with grouped controls", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Toolbar with grouped controls");

  test("initial state shows formatting buttons and undo/redo buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Bold" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Italic" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Underline" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Redo" })).toBeVisible();
  });
});

test.describe("SpaceFiller in a VStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "SpaceFiller in a VStack");

  test("initial state shows top section content and Log out button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Top section")).toBeVisible();
    await expect(page.getByText("Some content that does not fill the panel.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });
});
