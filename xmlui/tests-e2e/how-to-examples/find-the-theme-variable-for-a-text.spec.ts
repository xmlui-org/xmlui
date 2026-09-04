import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/find-the-theme-variable-for-a-text.md",
  ),
);

async function computedLineHeightAndFontSize(page: any) {
  const title = page.locator("#dialogTitle");
  await expect(title).toBeVisible();
  return title.evaluate((el: HTMLElement) => {
    const style = getComputedStyle(el);
    return { lineHeight: parseFloat(style.lineHeight), fontSize: parseFloat(style.fontSize) };
  });
}

test.describe("lineHeight-H2 does not reach the dialog title", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "lineHeight-H2 does not reach the dialog title",
  );

  // Pins the trap the how-to opens with: lineHeight-H2="1" is set on the
  // Theme wrapping the dialog, but the title's part family is
  // "title-ModalDialog", not "H2" — so the override is accepted and does
  // nothing. The title keeps its natural (looser than 1x) line-height.
  test("dialog title's computed line-height is unaffected by lineHeight-H2", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const { lineHeight, fontSize } = await computedLineHeightAndFontSize(page);

    // lineHeight-H2="1" would compute to exactly 1x font-size if it had taken
    // effect. It didn't, so the ratio stays well above 1 (the natural
    // default is "loose").
    expect(lineHeight / fontSize).toBeGreaterThan(1.2);
  });

  test("Dismiss button still closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("#dialogTitle")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.locator("#dialogTitle")).not.toBeVisible();
  });
});

test.describe("lineHeight-title-ModalDialog reaches the dialog title", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "lineHeight-title-ModalDialog reaches the dialog title",
  );

  // Pins the fix: the correctly-named var, lineHeight-title-ModalDialog="1",
  // does change the title's computed line-height, to (approximately) exactly
  // 1x its font-size.
  test("dialog title's computed line-height changes with lineHeight-title-ModalDialog", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const { lineHeight, fontSize } = await computedLineHeightAndFontSize(page);

    expect(lineHeight / fontSize).toBeLessThan(1.05);
  });

  test("Dismiss button still closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("#dialogTitle")).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.locator("#dialogTitle")).not.toBeVisible();
  });
});
