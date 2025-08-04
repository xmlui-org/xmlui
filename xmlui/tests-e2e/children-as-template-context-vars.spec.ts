import { expect, test } from "../src/testing/fixtures";

test("items works", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Items data="{['1', '2']}">
        <DataSource url="/data/{$item}" id="data"/>
        <Text testId='data{$item}_text'>{data.value}</Text>
    </Items>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data/:taskId",
            method: "get",
            handler: `()=>{
            return 'data' + $pathParams.taskId;
          }`,
          },
        },
      },
    },
  );
  await expect(page.getByTestId("data1_text")).toHaveText("data1");
  await expect(page.getByTestId("data2_text")).toHaveText("data2");
});

test("list works", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <List data="{['1', '2']}">
        <DataSource url="/data/{$item}" id="data"/>
        <Text testId='data{$item}_text'>{data.value}</Text>
    </List>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data/:taskId",
            method: "get",
            handler: `()=>{
            return 'data' + $pathParams.taskId;
          }`,
          },
        },
      },
    },
  );

  await expect(page.getByTestId("data1_text")).toHaveText("data1");
  await expect(page.getByTestId("data2_text")).toHaveText("data2");
});
