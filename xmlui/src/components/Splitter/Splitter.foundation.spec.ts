import { expect, test } from "../../testing/fixtures";

test.describe("Splitter foundation", () => {
  test("renders horizontal Splitter with two panels and a resizer", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" initialPrimarySize="40%" testId="splitter">
        <Text testId="primary">Primary</Text>
        <Text testId="secondary">Secondary</Text>
      </Splitter>
    `);

    await expect(page.getByTestId("splitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    await expect(page.getByTestId("secondary")).toBeVisible();
    await expect(page.getByTestId("splitter").locator('[class*="resizer"]')).toBeVisible();
  });

  test("HSplitter and VSplitter force their orientations", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <HSplitter height="100px" width="300px" orientation="vertical" testId="horizontal-splitter">
          <Text>Left</Text>
          <Text>Right</Text>
        </HSplitter>
        <VSplitter height="100px" width="300px" orientation="horizontal" testId="vertical-splitter">
          <Text>Top</Text>
          <Text>Bottom</Text>
        </VSplitter>
      </VStack>
    `);

    await expect(page.getByTestId("horizontal-splitter")).toHaveCSS("flex-direction", "row");
    await expect(page.getByTestId("vertical-splitter")).toHaveCSS("flex-direction", "column");
  });

  test("supports state updates from content inside a pane", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" var.count="{0}">
        <VStack>
          <Button testId="increment" onClick="count++">Increment</Button>
        </VStack>
        <Text testId="value">Count: {count}</Text>
      </Splitter>
    `);

    await expect(page.getByTestId("value")).toContainText("Count: 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });

  test("fires a single initial resize event when the handler updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App height="200px" var.counter="{0}">
        <Splitter onResize="counter++" height="200px">
          <Stack backgroundColor="lightblue" height="100%">
            <Text testId="resize-count" value="Resize event called {counter} number of times" />
          </Stack>
          <Stack backgroundColor="darksalmon" height="100%" />
        </Splitter>
      </App>
    `);

    await expect(page.getByTestId("resize-count")).toContainText(
      "Resize event called 1 number of times",
    );
  });
});
