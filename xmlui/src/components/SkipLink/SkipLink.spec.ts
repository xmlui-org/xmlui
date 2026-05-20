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
  });

  test("uses custom target and label", async ({ page, initTestBed }) => {
    await initTestBed(`<SkipLink target="content" label="Skip navigation" />`);

    const link = page.getByRole("link", { name: "Skip navigation" });

    await expect(link).toHaveAttribute("href", "#content");
  });
});
