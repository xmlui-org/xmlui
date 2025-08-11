import type { ApiInterceptorDefinition } from "../src";
import { expect, test } from "../src/testing/fixtures";

const CustomComponent = [
  `
  <Component name="CustomComponent">
    <Text testId="dataValue">{$props.data}</Text>
  </Component>
`,
];
const apiInterceptor: ApiInterceptorDefinition = {
  operations: {
    "load-api-data": {
      url: "/api/data",
      method: "get",
      handler: `() => { return 'STRING_DATA_FROM_API'; }`,
    },
  },
};

test("raw_data binds as data", async ({ page, initTestBed }) => {
  await initTestBed(`<CustomComponent raw_data="RUNNING"/>`, {
    components: CustomComponent,
  });
  await expect(page.getByTestId("dataValue")).toHaveText("RUNNING");
});

test("inline datasource as data", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <CustomComponent>
        <property name="data">
          <DataSource url="/api/data"/>
        </property>
      </CustomComponent>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference as data", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <CustomComponent data="{someDataSource}"/>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference as any property", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <Text testId="dataValue" value="{someDataSource}"/>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource reference outside of implicit container", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <Stack backgroundColor="lightgreen" var.something="something that makes it an implicit container">
          <CustomComponent data="{someDataSource}"/>
        </Stack>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("datasource value as data", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <DataSource url="/api/data" id="someDataSource"/>
        <CustomComponent data="{someDataSource.value}"/>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("data url", async ({ page, initTestBed }) => {
  await initTestBed(`<CustomComponent data="/api/data"/>`, {
    components: CustomComponent,
    apiInterceptor: apiInterceptor,
  });
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});

test("data url from binding expression", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <script>
          var dataUrl = "/api/data";
        </script>
        <CustomComponent data="{dataUrl}"/>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );
  await expect(page.getByTestId("dataValue")).toHaveText("STRING_DATA_FROM_API");
});
