import { test, expect } from "../../testing/fixtures";

test.describe("Select foundation", () => {
  test("renders options and honors initialValue", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <Select initialValue="2">
        <Option value="1" label="One" />
        <Option value="2" label="Two" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component).toBeVisible();
    await driver.toggleOptionsVisibility();
    await expect(page.getByRole("option")).toHaveCount(2);
    expect(await driver.value()).toBe("2");
  });

  test("didChange fires when selection changes", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <App var.selected="">
        <Select onDidChange="value => selected = value">
          <Option value="a" label="Alpha" />
          <Option value="b" label="Beta" />
        </Select>
        <Text testId="selected">{selected}</Text>
      </App>
    `);
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await page.getByRole("option", { name: "Beta" }).click({ force: true });
    await expect(page.getByTestId("selected")).toHaveText("b");
  });

  test("renders options from data", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <App var.items="{[
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' }
      ]}">
        <Select data="{items}" valueField="id" labelField="name" initialValue="b" />
      </App>
    `);
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await expect(page.getByRole("option")).toHaveText(["Alpha", "Beta"]);
    expect(await driver.value()).toBe("b");
  });

  test("stretches to the available width by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container" width="420px">
        <Select testId="select" initialValue="bakerloo">
          <Option value="bakerloo" label="Bakerloo" />
          <Option value="central" label="Central" />
        </Select>
      </VStack>
    `);

    const delta = await page.getByTestId("select").evaluate((select) => {
      const container = document.querySelector('[data-testid="container"]') as HTMLElement;
      return Math.abs(select.getBoundingClientRect().width - container.getBoundingClientRect().width);
    });

    expect(delta).toBeLessThan(1);
  });

  test("honors an explicit authored width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack width="420px">
        <Select testId="select" width="180px" initialValue="bakerloo">
          <Option value="bakerloo" label="Bakerloo" />
          <Option value="central" label="Central" />
        </Select>
      </VStack>
    `);

    await expect(page.getByTestId("select")).toHaveCSS("width", "180px");
  });
});
