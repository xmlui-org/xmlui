import { expect, test } from "../../testing/fixtures";

test("secondary solid hover uses original default colors", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <HStack>
        <Button label="Button" themeColor="primary" testId="primary" />
        <Button label="Button" themeColor="secondary" testId="secondary" />
        <Button label="Button" themeColor="attention" testId="attention" />
      </HStack>
    </App>
  `);

  const secondary = page.getByRole("button", { name: "Button" }).nth(1);
  await secondary.hover();
  await expect(secondary).toHaveCSS("border-color", "rgb(226, 229, 234)");
  await expect(secondary).toHaveCSS("background-color", "rgb(140, 151, 169)");
});
