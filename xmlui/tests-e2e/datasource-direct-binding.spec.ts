import { expect, test } from "../src/testing/fixtures";

test("directly bound datasource doesn't show empty list template during load", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
        <DataSource url="/data1" id="data"/>
        <List data="{data}" testId="list">
          <property name="emptyListTemplate">
            <Text testId="emptyLabel">Empty</Text>
          </property>
        </List>
    </Fragment>
    `, {
    apiInterceptor: {
      operations: {
        "load-api-data1": {
          url: "/data1",
          method: "get",
          handler: `() => { return ['data1', 'data2']; }`,
        },
      },
    },
  });
  await page.waitForRequest("/data1", {timeout: 0});
  //asserts that the emptyListTemplate is not rendered
  expect(await page.getByTestId("emptyLabel").count()).toEqual(0);
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});


test("directly bound datasource through multiple container levels", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <DataSource id="allContacts" url="/data1" />
      <Pages>
        <Page url="/">
          <List data="{allContacts}" testId="list">
            <property name="emptyListTemplate">
              <Text testId="emptyLabel">Empty</Text>
            </property>
          </List>
        </Page>
      </Pages>
    </App>
    `, {
    apiInterceptor: {
      operations: {
        "load-api-data1": {
          url: "/data1",
          method: "get",
          handler: `() => { return ['data1', 'data2']; }`,
        },
      },
    },
  });

  await page.waitForRequest("/data1", {timeout: 0});
  //asserts that the emptyListTemplate is not rendered
  expect(await page.getByTestId("emptyLabel").count()).toEqual(0);
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});
