import { expect, test } from "../../testing/fixtures";

test.describe("InspectButton foundation", () => {
  test("toggles shared inspect mode and active visual state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <InspectButton testId="inspect-toggle">Inspect</InspectButton>
        <InspectButton testId="inspect-toggle-peer">Peer</InspectButton>
      </App>
    `);

    await expect(page.getByTestId("inspect-toggle")).toHaveAttribute("data-inspect-mode", "off");
    await expect(page.getByTestId("inspect-toggle-peer")).toHaveAttribute("data-inspect-mode", "off");

    await page.getByTestId("inspect-toggle").click();
    await expect(page.getByTestId("inspect-toggle")).toHaveAttribute("data-inspect-mode", "on");
    await expect(page.getByTestId("inspect-toggle-peer")).toHaveAttribute("data-inspect-mode", "on");

    await page.getByTestId("inspect-toggle-peer").click();
    await expect(page.getByTestId("inspect-toggle")).toHaveAttribute("data-inspect-mode", "off");
  });
});
