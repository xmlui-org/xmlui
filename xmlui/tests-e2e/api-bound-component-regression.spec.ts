import { expect, test } from "../src/testing/fixtures";

test("multiple api-bound component don't mix/overwrite state", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <Fragment>
        <Text testId='data1_text'>
          <property name="value">
            <DataSource url="/data1"/>
          </property>
        </Text>
        <Text testId='data2_text'>
          <property name="value">
            <DataSource url="/data2"/>
          </property>
        </Text>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `()=>{
            return 'data1';
          }`,
          },
          "load-api-data2": {
            url: "/data2",
            method: "get",
            handler: `()=>{
            return 'data2';
          }`,
          },
        },
      },
    },
  );

  await expect(page.getByTestId("data1_text")).toHaveText("data1");
  await expect(page.getByTestId("data2_text")).toHaveText("data2");
});
