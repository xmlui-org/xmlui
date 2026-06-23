import { expect, test } from "../../testing/fixtures";

test.describe("Tabs foundation", () => {
  test("switches visible panel when a tab is clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="First">First content</TabItem>
        <TabItem label="Second">Second content</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "First" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByText("Second content")).not.toBeVisible();
    await page.getByRole("tab", { name: "Second" }).click();
    await expect(page.getByRole("tab", { name: "Second" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Second content")).toBeVisible();
  });

  test("didChange mutates visible state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.active="{0}">
        <Tabs onDidChange="index => active = index">
          <TabItem label="First">First content</TabItem>
          <TabItem label="Second">Second content</TabItem>
        </Tabs>
        <Text testId="active">Active: {active}</Text>
      </App>
    `);

    await expect(page.getByTestId("active")).toContainText("Active: 0");
    await page.getByRole("tab", { name: "Second" }).click();
    await expect(page.getByTestId("active")).toContainText("Active: 1");
  });

  test("tab content can mutate local state and headerTemplate renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs var.count="{0}">
        <TabItem label="Counter">
          <property name="headerTemplate">
            <Text>Counter tab</Text>
          </property>
          <Button testId="increment" onClick="count++">Increment</Button>
          <Text testId="value">Count: {count}</Text>
        </TabItem>
        <TabItem label="Other">Other content</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "Counter tab" })).toBeVisible();
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });
});
