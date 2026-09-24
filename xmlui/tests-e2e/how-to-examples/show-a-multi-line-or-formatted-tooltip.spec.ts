import * as path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/show-a-multi-line-or-formatted-tooltip.md",
  ),
);

async function hoverButton(page: Page, name: string) {
  const button = page.getByRole("button", { name, exact: true });
  await button.scrollIntoViewIfNeeded();
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  if (!box) {
    throw new Error(`Button "${name}" has no bounding box`);
  }
  await page.mouse.move(0, 0);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible({ timeout: 10000 });
  return tooltip;
}

test.describe("tooltip versus tooltipMarkdown", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "tooltip versus tooltipMarkdown",
  );

  test("tooltip shows Markdown syntax as literal text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "tooltip");
    await expect(tooltip).toHaveText("Deletes **every** file in `dist`");
    await expect(tooltip.locator("strong")).toHaveCount(0);
    await expect(tooltip.locator("code")).toHaveCount(0);
  });

  test("tooltipMarkdown renders bold and inline code", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "tooltipMarkdown");
    await expect(tooltip.locator("strong")).toHaveText("every");
    await expect(tooltip.locator("code")).toHaveText("dist");
  });
});

test.describe("One newline is a space, a blank line is a break", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "One newline is a space, a blank line is a break",
  );

  test("a single newline yields one paragraph on one line", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "One newline");
    const paragraphs = tooltip.locator("p");
    await expect(paragraphs).toHaveCount(1);
    await expect(paragraphs).toHaveText("Applies to: item-one item-two");
    const rendered = await paragraphs.evaluate((p) => (p as HTMLElement).innerText);
    expect(rendered).not.toContain("\n");
  });

  test("blank lines yield separate paragraphs", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "Blank lines");
    await expect(tooltip.locator("p")).toHaveText(["Applies to:", "item-one", "item-two"]);
  });

  test("blank lines typed into the attribute also yield paragraphs", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "Blank lines in the attribute");
    await expect(tooltip.locator("p")).toHaveText(["Applies to:", "item-one", "item-two"]);
  });
});

test.describe("A long single line does not wrap", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "A long single line does not wrap",
  );

  test("the long sentence is a single paragraph", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "One long line");
    await expect(tooltip.locator("p")).toHaveCount(1);
  });

  test("the split version has one paragraph per line", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "Split into lines");
    await expect(tooltip.locator("p")).toHaveText([
      "Applies to:",
      "item-one, item-two",
      "item-three, item-four",
      "All of these will be rebuilt.",
    ]);
  });
});

test.describe("Paragraphs and a list", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Paragraphs and a list",
  );

  test("the paragraph form renders three paragraphs and no list", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "As paragraphs");
    await expect(tooltip.locator("p")).toHaveText(["Applies to:", "item-one", "item-two"]);
    await expect(tooltip.locator("ul")).toHaveCount(0);
  });

  test("the list form renders a lead-in paragraph and a two-item list", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "As a list");
    await expect(tooltip.locator("p")).toHaveText(["Applies to:"]);
    await expect(tooltip.locator("ul")).toHaveCount(1);
    await expect(tooltip.locator("li")).toHaveText(["item-one", "item-two"]);
    await expect(tooltip.locator("li code")).toHaveCount(2);
  });
});

test.describe("Build the tooltip in a function", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Build the tooltip in a function",
  );

  test("the joined lines become one paragraph each", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "Rename the worklist route");
    await expect(tooltip.locator("p")).toHaveText([
      "Rename the worklist route",
      "Applies to:",
      "app/Main.xmlui",
      "server/routes/worklist.ts",
    ]);
    await expect(tooltip.locator("strong")).toHaveText("Rename the worklist route");
    await expect(tooltip.locator("code")).toHaveText([
      "app/Main.xmlui",
      "server/routes/worklist.ts",
    ]);
  });

  test("each row gets its own tooltip", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tooltip = await hoverButton(page, "Fix the tooltip");
    await expect(tooltip.locator("code")).toHaveText(["app/components/Toolbar.xmlui"]);
  });
});
