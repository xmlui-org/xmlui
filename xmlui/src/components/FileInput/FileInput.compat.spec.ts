import { expect, test } from "../../testing/fixtures";

test.describe("FileInput - compatibility polish", () => {
  test("default Browse button label is centered when the default icon has no rendered glyph", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<FileInput />`);

    const browseButton = page.getByRole("button", { name: "Browse" });
    await expect(browseButton).toBeVisible();

    const metrics = await browseButton.evaluate((button) => {
      const textNode = Array.from(button.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes("Browse"),
      );
      if (!textNode) {
        throw new Error("Browse text node not found");
      }

      const range = document.createRange();
      range.selectNodeContents(textNode);
      const textRect = range.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const firstChild = button.firstElementChild;

      return {
        firstChildDisplay: firstChild ? window.getComputedStyle(firstChild).display : undefined,
        leftInset: textRect.left - buttonRect.left,
        rightInset: buttonRect.right - textRect.right,
      };
    });

    expect(metrics.firstChildDisplay).toBe("none");
    expect(Math.abs(metrics.leftInset - metrics.rightInset)).toBeLessThan(0.5);
  });
});
