import { expect, test } from "../../testing/fixtures";

test.describe("Behavior Interop Tests", () => {

  test("label is not styled on inline styling the component & other behaviors are applied", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <TextBox label="hey" bindTo="name" backgroundColor="rgb(255, 0, 0)" />
        <TextBox label="hello" backgroundColor="rgb(255, 0, 0)" />
        <TextBox label="yo" tooltip="hello" backgroundColor="rgb(255, 0, 0)" />
        <TextBox label="hola" required backgroundColor="rgb(255, 0, 0)" />
        <TextBox label="hiya" variant="test" backgroundColor="rgb(255, 0, 0)" />
      </Form>
    `);
    await expect(page.locator("[data-part-id='labeledItem']").nth(0)).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='label']").nth(0)).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='labeledItem']").nth(1)).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='label']").nth(1)).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='labeledItem']").nth(2)).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='label']").nth(2)).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='labeledItem']").nth(3)).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='label']").nth(3)).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='labeledItem']").nth(4)).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.locator("[data-part-id='label']").nth(4)).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
  });
});
