import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/make-a-sticky-header-in-a-scroll-area.md",
  ),
);

test.describe("Sticky section headers", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Sticky section headers",
  );

  test("initial state renders all four section headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "1 — Requirements" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "2 — Design" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "3 — Implementation" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "4 — Testing" })).toBeVisible();
  });

  test("body content for each section is visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByText("Define the functional and non-functional requirements for the system."),
    ).toBeVisible();
    await expect(
      page.getByText("Produce architecture diagrams, data models, and API contracts."),
    ).toBeVisible();
    await expect(
      page.getByText("Follow the agreed coding standards and branch naming conventions."),
    ).toBeVisible();
    await expect(
      page.getByText("Run the full test suite in CI on every pull request to main."),
    ).toBeVisible();
  });
});
