import { expect, test } from "../../testing/fixtures";

test.describe("Br component", () => {
  test("br and Br both render and attach to DOM", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <br testId="lowercase" />
        <Br testId="uppercase" />
      </Fragment>
    `);
    await expect(page.getByTestId("lowercase")).toBeAttached();
    await expect(page.getByTestId("uppercase")).toBeAttached();
  });

  test("br and Br both render with attributes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <br testId="test-break" />
        <Br testId="test-break-capitalized" />
      </Fragment>
    `);
    await expect(page.getByTestId("test-break")).toBeAttached();
    await expect(page.getByTestId("test-break")).toHaveAttribute("data-testid", "test-break");
    await expect(page.getByTestId("test-break-capitalized")).toBeAttached();
    await expect(page.getByTestId("test-break-capitalized")).toHaveAttribute("data-testid", "test-break-capitalized");
  });

  test("br and Br both work in text content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Text testId="text-container">
          First line<br />Second line
        </Text>
        <Text testId="text-container-capitalized">
          First line<Br />Second line
        </Text>
      </Fragment>
    `);
    await expect(page.getByTestId("text-container").locator("br")).toBeAttached();
    await expect(page.getByTestId("text-container-capitalized").locator("br")).toBeAttached();
  });

  test("both br and Br can be used together", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Text testId="mixed-container">
        Line 1<br />Line 2<Br />Line 3
      </Text>
    `);
    
    const container = page.getByTestId('mixed-container');
    await expect(container).toBeAttached();
    
    const brElements = container.locator("br");
    await expect(brElements).toHaveCount(2);
  });
});
