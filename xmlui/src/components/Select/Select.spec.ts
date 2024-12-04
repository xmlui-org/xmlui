import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";
import { initComponent } from "@testing/component-test-helpers";

class SelectDriver extends ComponentDriver {
  async selectOption(value: string) {
    await this.locator.click();
    await this.page.getByLabel(value).click();
  }
}

const test = createTestWithDriver(SelectDriver);

test("options with number type keeps number type - outside of forms", async ({ createDriver }) => {
  const driver = await createDriver(
    `<Select onDidChange="(value) => testState = value">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
     </Select>`,
  );
  await driver.selectOption("One");
  await expect.poll(driver.testState).toStrictEqual(1);
});

test("options with number type keeps number type - inside a form", async ({ page }) => {

  //temp, until we have a better way to test component hierarchy
  await initComponent(page, {
    entryPoint: `<Form var.testState="{null}">
                   <Select onDidChange="(value) => testState = value" testId="comp">
                     <Option value="{1}" label="One"/>
                     <Option value="{2}" label="Two"/>
                   </Select>
                   <Text testId="test-state-id" value="{ JSON.stringify(testState) }"/>
                 </Form>`,
  });

  const driver = new SelectDriver({
    page,
    locator: page.getByTestId("comp"),
    testStateLocator: page.getByTestId("test-state-id")
  });

  await driver.selectOption("One");
  await expect.poll(driver.testState).toStrictEqual(1);
});
