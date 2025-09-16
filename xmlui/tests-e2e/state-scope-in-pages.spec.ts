import { test, expect } from "../src/testing/fixtures";
import { initApp } from "../src/testing/themed-app-test-helpers";

// TODO: Are we testing the right thing here? The variable is defined on the App,
// and the test is checking the value in a Page component, but the description
// suggests it's the other way around.
// NOTE: Also, this fails for some reason, the test below it works fine.
test.fixme("state in page is available in app root - fix!", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.varBasedOnNumberOfItems="{numberOfItems.value * 2}">
      <Pages>
        <Page url="/">
          <NumberBox initialValue="20" />
          <Text testId="value">{varBasedOnNumberOfItems}</Text>
        </Page>
      </Pages>
    </App> 
    `);
  await expect(page.getByTestId("value")).toHaveText("40");
});

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
})