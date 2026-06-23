import { expect, test } from "../../testing/fixtures";

test.describe("ScrollViewer foundation", () => {
  test("renders scrollable content and header/footer templates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" height="120px">
        <property name="headerTemplate">
          <Text testId="header">Header</Text>
        </property>
        <VStack gap="8px">
          <Text testId="row-1">Row 1</Text>
          <Text>Row 2</Text>
          <Text>Row 3</Text>
          <Text>Row 4</Text>
          <Text>Row 5</Text>
          <Text>Row 6</Text>
        </VStack>
        <property name="footerTemplate">
          <Text testId="footer">Footer</Text>
        </property>
      </ScrollViewer>
    `);

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
    await expect(page.getByTestId("header")).toHaveText("Header");
    await expect(page.getByTestId("footer")).toHaveText("Footer");
    await expect(page.getByTestId("row-1")).toBeVisible();
  });

  test("supports state updates inside scrollable content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" height="120px" var.count="{0}">
        <Button testId="increment" onClick="count++">Increment {count}</Button>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("increment")).toHaveText("Increment 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("increment")).toHaveText("Increment 1");
  });
});
