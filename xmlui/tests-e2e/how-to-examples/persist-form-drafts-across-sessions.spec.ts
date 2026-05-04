import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/persist-form-drafts-across-sessions.md",
  ),
);

test.describe("Blog post editor with draft persistence", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Blog post editor with draft persistence",
  );

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("blog-post-draft");
    });
  });

  test("initial state shows empty editor fields and default category", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Reset the temporary form data" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Category" })).toHaveText("general");
    await expect(page.getByRole("textbox", { name: "Body" })).toHaveValue("");
    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
  });

  test("typing saves a draft to localStorage", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Title" }).fill("Reactive forms");
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "tech" }).click();
    await page.getByRole("textbox", { name: "Body" }).fill("Draft body");

    await expect
      .poll(async () =>
        await page.evaluate(() => {
          const raw = localStorage.getItem("blog-post-draft");
          return raw ? JSON.parse(raw) : null;
        }),
      )
      .toEqual({
        title: "Reactive forms",
        category: "tech",
        body: "Draft body",
      });
  });

  test("saved draft is restored on the next load", async ({ initTestBed, page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "blog-post-draft",
        JSON.stringify({
          title: "Restored title",
          category: "design",
          body: "Restored body",
        }),
      );
    });

    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("Restored title");
    await expect(page.getByRole("combobox", { name: "Category" })).toHaveText("design");
    await expect(page.getByRole("textbox", { name: "Body" })).toHaveValue("Restored body");
  });

  test("reset temporary form data button clears the saved draft", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Title" }).fill("Temporary title");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("blog-post-draft")))
      .not.toBeNull();

    await page.getByRole("button", { name: "Reset the temporary form data" }).click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("blog-post-draft")))
      .toBeNull();
  });

  test("successful publish clears visible fields and persisted draft", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Title" }).fill("Published post");
    await page.getByRole("combobox", { name: "Category" }).click();
    await page.getByRole("option", { name: "design" }).click();
    await page.getByRole("textbox", { name: "Body" }).fill("Ready to publish.");
    await page.getByRole("button", { name: "Publish" }).click();

    await expect(page.getByRole("textbox", { name: "Title" })).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "Body" })).toHaveValue("");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("blog-post-draft")))
      .toBeNull();
  });
});
