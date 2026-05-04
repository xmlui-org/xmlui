import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/render-markdown-content-as-a-page.md"),
);

test.describe("Markdown page from files", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Markdown page from files");

  test("initial state loads and renders the introduction markdown file", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect.poll(() => page.getByRole("heading", { name: "Introduction" }).isVisible()).toBe(true);
    await expect(page.getByText("Welcome to the Project Hub documentation.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Features" })).toBeVisible();
    await expect(page.getByText("Reactive data binding", { exact: true })).toBeVisible();
  });

  test("Getting started button loads and renders the getting-started markdown file", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Getting started" }).click();

    await expect.poll(() => page.getByRole("heading", { name: "Getting Started" }).isVisible()).toBe(true);
    await expect(page.getByRole("heading", { name: "Prerequisites" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible();
    await expect(page.getByText("npx create-xmlui-app my-app")).toBeVisible();
  });
});
