import { expect, test } from "../../testing/fixtures";

test.describe("CodeText", () => {
  test("code fence renders as a pre element", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`js\nconst a = 1;\n\`\`\`</Markdown></App>`);

    await expect(page.locator("pre")).toBeVisible();
    await expect(page.locator("pre > code")).toHaveText("const a = 1;");
  });

  test("multiple code fences render independently", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`\none\n\`\`\`\n\`\`\`\ntwo\n\`\`\`</Markdown></App>`);

    await expect(page.locator("pre")).toHaveCount(2);
    await expect(page.locator("pre").nth(0)).toContainText("one");
    await expect(page.locator("pre").nth(1)).toContainText("two");
  });

  test("code fence preserves indentation", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`\nif (a) {\n  return b;\n}\n\`\`\`</Markdown></App>`);

    await expect(page.locator("pre > code")).toHaveText("if (a) {\n  return b;\n}");
  });

  test("inline code does not produce a pre element", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>Use \`inline\` code.</Markdown></App>`);

    await expect(page.locator("pre")).toHaveCount(0);
    await expect(page.locator("p > code")).toHaveText("inline");
  });

  test("pre element has zero margin and non-zero padding", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`\ncode\n\`\`\`</Markdown></App>`);

    await expect(page.locator("pre")).toHaveCSS("margin-top", "0px");
    await expect(page.locator("pre")).toHaveCSS("margin-right", "0px");
    await expect(page.locator("pre")).toHaveCSS("margin-bottom", "0px");
    await expect(page.locator("pre")).toHaveCSS("margin-left", "0px");
    expect(Number.parseFloat(await page.locator("pre").evaluate((element) => getComputedStyle(element).paddingTop))).toBeGreaterThan(0);
  });

  test("pre has overflow-x auto and code child has left padding", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`\ncode\n\`\`\`</Markdown></App>`);

    await expect(page.locator("pre")).toHaveCSS("overflow-x", "auto");
    expect(Number.parseFloat(await page.locator("pre > code").evaluate((element) => getComputedStyle(element).paddingLeft))).toBeGreaterThan(0);
  });

  test("code child respects codefence theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Markdown>\`\`\`\ncode\n\`\`\`</Markdown></App>`, {
      testThemeVars: {
        "textColor-Text-codefence": "rgb(255, 0, 0)",
        "fontFamily-Text-codefence": "Courier New",
      },
    });

    await expect(page.locator("pre > code")).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(page.locator("pre > code")).toHaveCSS("font-family", /Courier New/);
  });
});
