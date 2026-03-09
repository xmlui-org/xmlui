import type { ApiInterceptorDefinition } from "../src";
import { expect, test } from "../src/testing/fixtures";

// CustomComponent accepts an optional testId prop so multiple instances can
// coexist in one Fragment with unique testIds.
const CustomComponent = [
  `
  <Component name="CustomComponent">
    <Text testId="{$props.testId ?? 'dataValue'}">{$props.data}</Text>
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

// All API-based binding mechanisms in one render: each uses a different approach
// to deliver data from /api/data, all expected to display STRING_DATA_FROM_API.
test("all API data binding mechanisms resolve correctly", async ({ page, initTestBed }) => {
  await initTestBed(
    `
      <Fragment>
        <script>
          var dataUrl = "/api/data";
        </script>

        <!-- inline DataSource as a property node -->
        <CustomComponent testId="t-inline">
          <property name="data">
            <DataSource url="/api/data"/>
          </property>
        </CustomComponent>

        <!-- DataSource referenced by id -->
        <DataSource url="/api/data" id="ds1"/>
        <CustomComponent testId="t-ref" data="{ds1}"/>

        <!-- DataSource value property via .value -->
        <DataSource url="/api/data" id="ds2"/>
        <CustomComponent testId="t-val" data="{ds2.value}"/>

        <!-- DataSource reference used as any property (on Text, not CustomComponent) -->
        <DataSource url="/api/data" id="ds3"/>
        <Text testId="t-any-prop" value="{ds3}"/>

        <!-- DataSource outside an implicit container (Stack with var.something) -->
        <DataSource url="/api/data" id="ds4"/>
        <Stack var.something="makes-it-a-container">
          <CustomComponent testId="t-outside" data="{ds4}"/>
        </Stack>

        <!-- URL string passed directly as data prop -->
        <CustomComponent testId="t-url" data="/api/data"/>

        <!-- URL provided via binding expression -->
        <CustomComponent testId="t-url-binding" data="{dataUrl}"/>
      </Fragment>
    `,
    {
      components: CustomComponent,
      apiInterceptor: apiInterceptor,
    },
  );

  const expected = "STRING_DATA_FROM_API";
  await expect(page.getByTestId("t-inline")).toHaveText(expected);      // inline DataSource
  await expect(page.getByTestId("t-ref")).toHaveText(expected);         // DataSource reference
  await expect(page.getByTestId("t-val")).toHaveText(expected);         // DataSource .value
  await expect(page.getByTestId("t-any-prop")).toHaveText(expected);    // any-property binding
  await expect(page.getByTestId("t-outside")).toHaveText(expected);     // outside implicit container
  await expect(page.getByTestId("t-url")).toHaveText(expected);         // URL string
  await expect(page.getByTestId("t-url-binding")).toHaveText(expected); // URL from binding
});
