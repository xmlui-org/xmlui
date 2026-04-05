import { expect, test } from "../src/testing/fixtures";

test("directly bound datasource doesn't show empty list template during load", async ({
  page,
  initTestBed,
}) => {
  const reqPromise = page.waitForRequest("/data1", { timeout: 0 });
  await initTestBed(
    `
    <Fragment>
        <DataSource url="/data1" id="data"/>
        <List data="{data}" testId="list">
          <property name="emptyListTemplate">
            <Text testId="emptyLabel">Empty</Text>
          </property>
        </List>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `() => { return ['data1', 'data2']; }`,
          },
        },
      },
    },
  );
  await reqPromise;
  //asserts that the emptyListTemplate is not rendered
  expect(await page.getByTestId("emptyLabel").count()).toEqual(0);
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});

test("directly bound datasource through multiple container levels", async ({
  page,
  initTestBed,
}) => {
  const reqPromise = page.waitForRequest("/data1");
  await initTestBed(
    `
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
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `() => { return ['data1', 'data2']; }`,
          },
        },
      },
    },
  );

  await reqPromise;
  //asserts that the emptyListTemplate is not rendered
  expect(await page.getByTestId("emptyLabel").count()).toEqual(0);
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});

test("DataSource inside App preceded by a script tag works without error", async ({
  page,
  initTestBed,
}) => {
  // Regression: having a <script> tag before a <DataSource> in an <App> caused
  // "Prop holder component, shouldn't render" because the parser wraps non-helper
  // children in a Fragment when a script is present, and the DataSource transform
  // did not look inside that Fragment.
  const reqPromise = page.waitForRequest("/data1");
  await initTestBed(
    `
    <App>
      <script>
        var greeting = "hello";
      </script>
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
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `() => { return ['data1', 'data2']; }`,
          },
        },
      },
    },
  );

  await reqPromise;
  expect(await page.getByTestId("emptyLabel").count()).toEqual(0);
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});
