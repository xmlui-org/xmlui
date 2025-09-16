import { expect, test } from "../src/testing/fixtures";
import { initApp } from "../src/testing/themed-app-test-helpers";

test("push to array", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Fragment var.fruits="{['1', '2']}" >
        <Button id="addSomething" onClick="fruits.push('something')">Add</Button>
        <Text id="fruits_text">{fruits.join(',')}</Text>
    </Fragment>
    `,
  });

  await expect(page.getByTestId("fruits_text")).toHaveText("1,2");
  await page.getByTestId("addSomething").click();
  await expect(page.getByTestId("fruits_text")).toHaveText("1,2,something");
});
