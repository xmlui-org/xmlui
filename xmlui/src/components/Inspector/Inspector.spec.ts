import { expect, test } from "../../testing/fixtures";

test.describe("Inspector foundation", () => {
  test("opens and closes the inspector dialog from the trigger", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Inspector testId="inspector-trigger" src="/xmlui/xs-diff.html" dialogTitle="Runtime Inspector" dialogWidth="640px" dialogHeight="360px" />
      </App>
    `);

    await page.getByTestId("inspector-trigger").click();
    await expect(page.getByRole("dialog", { name: "Runtime Inspector" })).toBeVisible();
    await expect(page.getByTestId("InspectorFrame")).toHaveAttribute("src", "/xmlui/xs-diff.html");
    await expect(page.getByRole("dialog", { name: "Runtime Inspector" })).toHaveCSS("min-width", "640px");

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog", { name: "Runtime Inspector" })).toHaveCount(0);
  });

  test("exposes open and close APIs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Inspector id="inspector" testId="inspector-trigger" dialogTitle="API Inspector" />
        <Button testId="open" onClick="inspector.open()">Open</Button>
        <Button testId="close" onClick="inspector.close()">Close</Button>
      </App>
    `);

    await page.getByTestId("open").click();
    await expect(page.getByRole("dialog", { name: "API Inspector" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "API Inspector" })).toHaveCount(0);
  });

  test("shows debug bridge events inside the dialog", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{0}">
        <Inspector testId="inspector-trigger" dialogTitle="Debug Inspector" />
        <Button testId="emit" onClick="debugWatch('count', count); count++">Emit</Button>
      </App>
    `);

    await page.getByTestId("emit").click();
    await page.getByTestId("inspector-trigger").click();

    await expect(page.getByTestId("InspectorEvents")).toContainText("watch count = 0");
  });
});
