import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("context vars dont get resolved multiple times", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Fragment>
        <DataSource url="/data1" id="stringsLoader"/>
        <Items items="{stringsLoader.value}">
          <Text testId="text-{$itemIndex}">{$item}</Text>
        </Items>
    </Fragment>
    `,
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
  });

  await expect(page.getByTestId("text-0")).toHaveText("text0");
  await expect(page.getByTestId("text-1")).toHaveText("text1");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }");
});


test("can use context vars in simple var declarations", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
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
  });

  await expect(page.getByTestId("text-0")).toHaveText("text0_modified");
  await expect(page.getByTestId("text-1")).toHaveText("text1_modified");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }_modified");
});


test("can use context vars in combination with vars and calculated props", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
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
  });

  await expect(page.getByTestId("text-0")).toHaveText("text0_modified");
  await expect(page.getByTestId("text-1")).toHaveText("text1_modified");
  await expect(page.getByTestId("text-2")).toHaveText("text{ 1 + 2 }_modified");
});


test("context vars in formItems", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Fragment>
      <Form data="{{ customText: 'hello {1 + 2}' }}">
          <FormItem bindTo="customText">
            <TextBox initialValue="{$value}" testId="textBox"/>
          </FormItem>
      </Form>
    </Fragment>
    `,
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
  });

  await expect(page.getByTestId("textBox").getByRole('textbox')).toHaveValue("hello {1 + 2}");
});


