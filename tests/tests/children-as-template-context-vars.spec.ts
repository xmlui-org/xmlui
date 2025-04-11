import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("items works", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Items data="{['1', '2']}">
        <DataSource url="/data/{$item}" id="data"/>
        <Text testId='data{$item}_text'>{data.value}</Text>
    </Items>
    `,
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
  });

  await expect(page.getByTestId("data1_text")).toHaveText("data1");
  await expect(page.getByTestId("data2_text")).toHaveText("data2");

});


test("list works", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <List data="{['1', '2']}">
        <DataSource url="/data/{$item}" id="data"/>
        <Text testId='data{$item}_text'>{data.value}</Text>
    </List>
    `,
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
  });

  await expect(page.getByTestId("data1_text")).toHaveText("data1");
  await expect(page.getByTestId("data2_text")).toHaveText("data2");

});
