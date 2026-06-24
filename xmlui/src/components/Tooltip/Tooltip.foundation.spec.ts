import { expect, test } from "../../testing/fixtures";

test.describe("Tooltip foundation", () => {
  test("shows text tooltip on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip text="Helpful detail" delayDuration="{0}">
        <Button testId="trigger">Hover me</Button>
      </Tooltip>
    `);

    await page.getByTestId("trigger").hover();
    await expect(page.getByRole("tooltip")).toContainText("Helpful detail");
  });

  test("defaultOpen renders tooltip content immediately", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip text="Already visible" defaultOpen="{true}">
        <Button testId="trigger">Trigger</Button>
      </Tooltip>
    `);

    await expect(page.getByRole("tooltip")).toContainText("Already visible");
  });

  test("renders tiny markdown content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tooltip markdown="This *example* uses \`code\`" defaultOpen="{true}">
        <Button testId="trigger">Trigger</Button>
      </Tooltip>
    `);

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip.locator("em")).toContainText("example");
    await expect(tooltip.locator("code")).toContainText("code");
  });

  test("tooltipTemplate renders and wrapped content can mutate state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{0}">
        <Tooltip defaultOpen="{true}">
          <property name="tooltipTemplate">
            <Text testId="tip">Count: {count}</Text>
          </property>
          <Button testId="increment" onClick="count++">Increment</Button>
        </Tooltip>
      </App>
    `);

    await expect(page.getByTestId("tip")).toContainText("Count: 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("tip")).toContainText("Count: 1");
  });
});
