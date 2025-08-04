import { expect, test } from "../src/testing/fixtures";

test("context vars dont get resolved multiple times", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment>
      <DataSource url="/data1" id="stringsLoader"/>
      <Items items="{stringsLoader.value}">
        <Text testId="text-{$itemIndex}">{$item}</Text>
      </Items>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `()=>{
            return ['text0', 'text1', 'text{ 1 + 2 }'];
          }`,
          },
        },
      },
    },
  );
  await expect(page.getByTestId("text-0")).toHaveText("text0");
  await expect(page.getByTestId("text-1")).toHaveText("text1");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }");
});

test("can use context vars in simple var declarations", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment>
      <DataSource url="/data1" id="stringsLoader"/>
      <Items items="{stringsLoader.value}">
        <script>
          var something = $item + '_modified';
        </script>
        <Text testId="text-{$itemIndex}">{something}</Text>
      </Items>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `()=>{
            return ['text0', 'text1', 'text{ 1 + 2 }'];
          }`,
          },
        },
      },
    },
  );

  await expect(page.getByTestId("text-0")).toHaveText("text0_modified");
  await expect(page.getByTestId("text-1")).toHaveText("text1_modified");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }_modified");
});

test("can use context vars in combination with vars and calculated props", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `
    <Fragment>
      <script>
        var something = 'modified';
      </script>
      <DataSource url="/data1" id="stringsLoader"/>
      <Items items="{stringsLoader.value}">
        <Text testId="text-{$itemIndex}">{$item}_{something}</Text>
      </Items>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `()=>{
            return ['text0', 'text1', 'text{ 1 + 2 }'];
          }`,
          },
        },
      },
    },
  );

  await expect(page.getByTestId("text-0")).toHaveText("text0_modified");
  await expect(page.getByTestId("text-1")).toHaveText("text1_modified");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }_modified");
});

test("context vars in formItems", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment>
      <Form data="{{ customText: 'hello {1 + 2}' }}">
          <FormItem bindTo="customText">
            <TextBox initialValue="{$value}" testId="textBox"/>
          </FormItem>
      </Form>
    </Fragment>
    `,
    {
      apiInterceptor: {
        operations: {
          "load-api-data1": {
            url: "/data1",
            method: "get",
            handler: `()=>{
            return ['text0', 'text1', 'text{ 1 + 2 }'];
          }`,
          },
        },
      },
    },
  );
  await expect(page.getByTestId("textBox").getByRole("textbox")).toHaveValue("hello {1 + 2}");
});

test("$data context var in form event handlers", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment var.dataFromSubmit="" var.dataFromCancel="" var.dataFromReset="">
      <Form testId="form">
        <FormItem bindTo="customText" testId="textBox"/>
        <event name="submit" value="dataFromSubmit = $data.customText"/>
        <event name="cancel" value="dataFromCancel = $data.customText"/>
        <event name="reset" value="dataFromReset = $data.customText"/>
      </Form>
      <Text testId="dataFromSubmit">{dataFromSubmit}</Text>
      <Text testId="dataFromCancel">{dataFromCancel}</Text>
      <Text testId="dataFromReset">{dataFromReset}</Text>
    </Fragment>
  `);
  await page.getByTestId("textBox").getByRole("textbox").fill("hello {1 + 2}");
  await page.getByTestId("form").locator("button[type=button]").click();
  await expect(page.getByTestId("dataFromCancel")).toHaveText("hello {1 + 2}");
  await page.getByTestId("form").locator("button[type=submit]").click();
  await expect(page.getByTestId("dataFromSubmit")).toHaveText("hello {1 + 2}");
  //reset is called after submit
  await expect(page.getByTestId("dataFromReset")).toHaveText("hello {1 + 2}");
});
