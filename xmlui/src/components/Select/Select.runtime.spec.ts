import { expect, test } from "../../testing/fixtures";

test("default empty list template is shown when no custom template is provided", async ({
  initTestBed,
  page,
  createSelectDriver,
}) => {
  await initTestBed(`
    <Select testId="select" />
  `);

  const driver = await createSelectDriver("select");
  await driver.click();

  await expect(page.getByText("List is empty", { exact: true })).toBeVisible();
});

test("custom empty list template replaces the default empty list template", async ({
  initTestBed,
  page,
  createSelectDriver,
}) => {
  await initTestBed(`
    <Select testId="select">
      <property name="emptyListTemplate">
        <Text variant="strong" value="Nothing to see here!" />
      </property>
    </Select>
  `);

  const driver = await createSelectDriver("select");
  await driver.click();

  await expect(page.getByText("Nothing to see here!", { exact: true })).toBeVisible();
  await expect(page.getByText("List is empty", { exact: true })).not.toBeVisible();
});
