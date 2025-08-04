import { expect, test } from "../src/testing/fixtures";

test("onLoaded has access to the loaded datasource state", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment var.dataFromOnLoaded="{[]}">
        <DataSource url="/data1" id="data" onLoaded="dataFromOnLoaded = data.value;"/>
        <List data="{dataFromOnLoaded}" testId="list">
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
  await expect(page.getByTestId("list")).toHaveText("data1data2");
});
