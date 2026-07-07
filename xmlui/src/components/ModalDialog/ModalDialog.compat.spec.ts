import { expect, test } from "../../testing/fixtures";

test("default backdrop and title typography match original theme defaults", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <ModalDialog when="{true}" title="Example Dialog">
        <Text>Dialog content</Text>
      </ModalDialog>
    </App>
  `);

  await expect(page.getByRole("dialog", { name: "Example Dialog" })).toBeVisible();

  const overlayColor = await page.evaluate(() => {
    const dialog = document.querySelector<HTMLElement>("[role='dialog']");
    const overlayBackground = dialog?.parentElement?.previousElementSibling;
    return overlayBackground instanceof HTMLElement
      ? getComputedStyle(overlayBackground).backgroundColor
      : undefined;
  });
  expect(overlayColor).toBe("rgba(0, 0, 0, 0.2)");

  const title = page.locator("[data-part-id='title'] header");
  await expect(title).toHaveCSS("font-family", /Inter/);
  await expect(title).toHaveCSS("font-size", "36px");
  await expect(title).toHaveCSS("font-weight", "400");
});
