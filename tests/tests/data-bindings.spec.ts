import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";
import { ApiInterceptorDefinition } from "xmlui";

const MyComponent = `
  <Component name="MyComponent">
    <Text testId="dataValue">{$props.data}</Text>
  </Component>
`;

const apiInterceptor: ApiInterceptorDefinition = {
  operations: {
    "load-api-data": {
      url: "/api/data",
      method: "get",
      handler: `()=>{
          return 'STRING_DATA_FROM_API';
        }`,
    },
  },
};

test("raw_data binds as data", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <MyComponent raw_data="RUNNING"/>
    `,
    components: MyComponent
  });

  await expect(page.getByTestId("dataValue")).toHaveText("RUNNING");
});

test("inline datasource as data", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <MyComponent>
          <property name="data">
            <DataSource url="/api/data"/>
          </property>
        </MyComponent>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference as data", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <MyComponent data="{someDataSource}"/>
      </Fragment>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference as any property", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <Text testId="dataValue" value="{someDataSource}"/>
      </Fragment>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference outside of implicit container", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <Stack backgroundColor="lightgreen" var.something="something that makes it an implicit container">
            <MyComponent data="{someDataSource}"/>
        </Stack>
      </Fragment>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource value as data", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <MyComponent data="{someDataSource.value}"/>
      </Fragment>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("data url", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <MyComponent data="/api/data"/>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("data url from binding expression", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <script>
          var dataUrl = "/api/data";
        </script>
        <MyComponent data="{dataUrl}"/>
      </Fragment>
    `,
    components: MyComponent,
    apiInterceptor: apiInterceptor
  });

  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});
