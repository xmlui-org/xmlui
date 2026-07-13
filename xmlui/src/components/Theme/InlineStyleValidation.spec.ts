import { expect, test } from "../../testing/fixtures";

test.describe("Inline style validation", () => {
  test("strict theming drops blocked raw style declarations", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack
        testId="target"
        width="20px"
        height="20px"
        style="position: fixed; color: rgb(255, 0, 0)"
      />
    `);

    const target = page.getByTestId("target");
    await expect(target).not.toHaveCSS("position", "fixed");
    await expect(target).toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("non-strict theming warns but keeps blocked raw style declarations", async ({
    initTestBed,
    page,
  }) => {
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      const text = message.text();
      if (text.includes("[XMLUI Theme]")) {
        diagnostics.push(text);
      }
    });

    await initTestBed(
      `
      <VStack
        testId="target"
        width="20px"
        height="20px"
        style="position: sticky; top: 0px"
      />
    `,
      { strictTheming: false },
    );

    const target = page.getByTestId("target");
    await expect(target).toHaveCSS("position", "sticky");
    await expect.poll(() => diagnostics.some((text) => text.includes("position-fixed-blocked"))).toBe(true);
  });

  test("allowInlineRawCss blocks unknown raw css only when disabled in strict mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <VStack
        testId="blocked"
        width="20px"
        height="20px"
        style="background-image: linear-gradient(rgb(1, 2, 3), rgb(1, 2, 3))"
      />
    `,
      { xmluiConfig: { allowInlineRawCss: false } },
    );

    await expect(page.getByTestId("blocked")).toHaveCSS("background-image", "none");

    await initTestBed(
      `
      <VStack
        testId="allowed"
        width="20px"
        height="20px"
        style="background-image: linear-gradient(rgb(1, 2, 3), rgb(1, 2, 3))"
      />
    `,
      { xmluiConfig: { allowInlineRawCss: true } },
    );

    await expect(page.getByTestId("allowed")).toHaveCSS(
      "background-image",
      /linear-gradient\(rgb\(1, 2, 3\), rgb\(1, 2, 3\)\)/,
    );
  });

  test("maxZIndex clamps numeric layout props through the adapter", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <VStack testId="target" width="20px" height="20px" zIndex="{5000}" />
    `,
      { xmluiConfig: { maxZIndex: 10 } },
    );

    await expect(page.getByTestId("target")).toHaveCSS("z-index", "10");
  });

  test("maxZIndex uses the old nullish default without normalizing config values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <VStack testId="target" width="20px" height="20px" zIndex="{5000}" />
    `,
      { xmluiConfig: { maxZIndex: "10" } },
    );

    await expect(page.getByTestId("target")).toHaveCSS("z-index", "10");
  });

  test("responsive part-targeted layout props remain active after validation", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await initTestBed(`
      <TextBox testId="field" width-input-md="240px" />
    `);

    await expect(page.locator('[data-xmlui-component="TextBox"][data-xmlui-part="input"]')).toHaveCSS(
      "width",
      "240px",
    );
  });
});
