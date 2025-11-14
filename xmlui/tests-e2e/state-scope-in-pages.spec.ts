import { test, expect } from "../src/testing/fixtures";

test("state in page is available in app root", async ({ page, initTestBed }) => {
  await initTestBed(
    `<App var.varBasedOnNumberOfItems="{numberOfItems.value * 2}">
      <Pages>
        <Page url="/">
          <NumberBox initialValue="20" id="numberOfItems"/>
          <Text testId="value">{varBasedOnNumberOfItems}</Text>
        </Page>
      </Pages>
    </App>`,
  );

  await expect(page.getByTestId("value")).toHaveText("40");
});
