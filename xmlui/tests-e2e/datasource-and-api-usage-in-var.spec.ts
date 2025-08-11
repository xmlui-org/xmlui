import { expect, test } from "../src/testing/fixtures";

test("regression: datasource usage in compound component var", async ({ page, initTestBed }) => {
  await initTestBed(`<TestComp />`, {
    components: [
      `
      <Component name="TestComp">
        <Fragment var.sortFiles="{(files)=> files}">
          <DataSource url="/data1" id="datasource"/>
          <variable name="x" value="{datasource.value.listing[0].name + '_transformed'}"/>
          <Text testId="transformed_text" value="{x}"/>
        </Fragment>
      </Component>
    `,
    ],
    apiInterceptor: {
      operations: {
        "load-api-data1": {
          url: "/data1",
          method: "get",
          handler: `() => { return {listing: [{name: 'data1'}]}; }`,
        },
      },
    },
  });
  await expect(page.getByTestId("transformed_text")).toHaveText("data1_transformed");
});

test("regression: api usage in compound component var", async ({ page, initTestBed }) => {
  await initTestBed(`<TestComp />`, {
    components: [
      `
      <Component name="TestComp">
        <Stack var.itemsInVar="{uploadQueue.getQueuedItems()}">
          <Queue id="uploadQueue" clearAfterFinish="false"/>
          <Button onClick="uploadQueue.enqueueItems([1, 2, 3])" testId="button">add to queue</Button>
          <Text testId="result">{itemsInVar.map(item => item.item)}</Text>
        </Stack>
      </Component>
    `,
    ],
  });
  await page.getByTestId("button").click();
  await expect(page.getByTestId("result")).toHaveText("123");
});
