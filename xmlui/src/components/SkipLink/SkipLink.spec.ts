import { expect, test } from "../../testing/fixtures";

test.describe("SkipLink", () => {
  test("renders offscreen until keyboard focus", async ({ page, initTestBed }) => {
    await initTestBed(`<SkipLink target="main" />`);

    const link = page.getByRole("link", { name: "Skip to main content" });
    await expect(link).toBeAttached();
    await expect(link).toHaveCSS("top", "-999px");

    await page.keyboard.press("Tab");

    await expect(link).toBeFocused();
    await expect(link).toHaveCSS("top", "16px");
    await expect(link).toHaveCSS("transform", /matrix\(1, 0, 0, 1, -?\d+(\.\d+)?, 0\)/);
    await expect(link).toBeVisible();
    await expect.poll(() => link.evaluate((el) => el.parentElement === document.body)).toBe(true);
  });

  test("moves focus to the target when activated", async ({ page, initTestBed }) => {
    await initTestBed(`<SkipLink target="main" />`);
    await page.evaluate(() => {
      const target = document.createElement("button");
      target.id = "main";
      target.textContent = "Main target";
      document.body.append(target);
    });

    const link = page.getByRole("link", { name: "Skip to main content" });
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "Main target" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("moves focus to an XMLUI component target", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <SkipLink target="mainAction" />
        <Button id="mainAction" label="Main action" />
      </Fragment>
    `);

    const link = page.getByRole("link", { name: "Skip to main content" });
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "Main action" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("moves focus to a focusable descendant inside a XMLUI component target", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Fragment>
        <SkipLink target="searchBox" />
        <TextBox id="searchBox" label="Search" />
      </Fragment>
    `);

    const link = page.getByRole("link", { name: "Skip to main content" });
    await expect(page.locator('[data-xmlui-id="searchBox"]')).toBeAttached();
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("textbox", { name: "Search" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("resolves XMLUI component ids without relying on test ids", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <SkipLink target="searchBox" />
        <TextBox id="searchBox" label="Search" />
      </Fragment>
    `);

    await page.evaluate(() => {
      document.querySelectorAll('[data-testid="searchBox"]').forEach((element) => {
        element.removeAttribute("data-testid");
      });
    });

    const link = page.getByRole("link", { name: "Skip to main content" });
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("textbox", { name: "Search" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("activates with Space without changing the hash", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <SkipLink target="searchBox" />
        <TextBox id="searchBox" label="Search" />
      </Fragment>
    `);

    const link = page.getByRole("link", { name: "Skip to main content" });
    await link.focus();
    await page.keyboard.press(" ");

    await expect(page.getByRole("textbox", { name: "Search" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("uses custom target and label", async ({ page, initTestBed }) => {
    await initTestBed(`<SkipLink target="content" label="Skip navigation" />`);

    const link = page.getByRole("link", { name: "Skip navigation" });

    await expect(link).toHaveAttribute("href", "#content");
  });
});
