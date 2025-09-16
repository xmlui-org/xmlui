import { test, expect } from "../src/testing/fixtures";
import { initApp } from "../src/testing/themed-app-test-helpers";

test("state in page is available in app root", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <App var.varBasedOnNumberOfItems="{numberOfItems.value * 2}">
      <Pages>
        <Page url="/">
          <NumberBox initialValue="20" id="numberOfItems"/>
          <Text testId="value">{varBasedOnNumberOfItems}</Text>
        </Page>
      </Pages>
    </App> 
    `,
  });

  await expect(page.getByTestId("value")).toHaveText("40");
});
