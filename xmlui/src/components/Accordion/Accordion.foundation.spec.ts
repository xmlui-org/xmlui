import { expect, test } from "../../testing/fixtures";

test.describe("Accordion foundation", () => {
  test("clicking on header expands and collapses content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Accordion>
        <AccordionItem header="Header">Content</AccordionItem>
      </Accordion>
    `);

    await expect(page.getByText("Content")).not.toBeVisible();
    await page.getByRole("button", { name: /Header/ }).click();
    await expect(page.getByText("Content")).toBeVisible();
    await page.getByRole("button", { name: /Header/ }).click();
    await expect(page.getByText("Content")).not.toBeVisible();
  });

  test("initiallyExpanded opens an item and displayDidChange reports expanded ids", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.expanded="{''}">
        <Accordion onDisplayDidChange="ids => expanded = ids">
          <AccordionItem id="first" header="First" initiallyExpanded="true">First content</AccordionItem>
          <AccordionItem id="second" header="Second">Second content</AccordionItem>
        </Accordion>
        <Text testId="expanded">{expanded}</Text>
      </App>
    `);

    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByTestId("expanded")).toContainText("first");
    await page.getByRole("button", { name: /Second/ }).click();
    await expect(page.getByText("Second content")).toBeVisible();
    await expect(page.getByTestId("expanded")).toContainText("first,second");
  });

  test("headerTemplate renders and expanded content can mutate state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Accordion var.count="{0}">
        <AccordionItem>
          <property name="headerTemplate">
            <Text>Templated header</Text>
          </property>
          <Button testId="increment" onClick="count++">Increment</Button>
          <Text testId="value">Count: {count}</Text>
        </AccordionItem>
      </Accordion>
    `);

    const header = page.getByRole("button", { name: /Templated header/ });
    await expect(header).toBeVisible();
    await expect(page.getByTestId("value")).not.toBeVisible();

    await header.click();
    await expect(page.getByTestId("value")).toContainText("Count: 0");
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });
});
