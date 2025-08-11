import { test, expect } from "../src/testing/fixtures";

// TODO: Are we testing the right thing here? The variable is defined on the App,
// and the test is checking the value in a Page component, but the description
// suggests it's the other way around.
test.fixme("state in page is available in app root", async ({ initTestBed, page }) => {
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
