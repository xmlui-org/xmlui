import { test, expect } from "../src/testing/fixtures";

test("vars shadowing works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack var.x="x in outer stack" var.y="y in outer stack">
      <Stack var.y="y in inner stack">
        <Button testId="button" onClick="y = 123">change y in inner stack</Button>
        <Text testId="y_in_inner_stack">{y}</Text>
      </Stack>
      <Text testId="y_in_outer_stack">{y}</Text>
    </Stack>
  `);
  await page.getByTestId("button").click();
  await expect(page.getByTestId("y_in_inner_stack")).toHaveText("123");
  await expect(page.getByTestId("y_in_outer_stack")).toHaveText("y in outer stack");
});

test("inner input is available in the file (implicit containers because of vars)", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <Stack var.x="x in outer stack" var.y="y in outer stack">
        <Stack var.y="y in inner stack">
          <TextBox id="textbox"/>
        </Stack>
      </Stack>
      <Text testId="textbox_value_outside">{textbox.value}</Text>
    </Fragment>
  `);
  await page.getByTestId("textbox").getByRole("textbox").fill("textbox-value");
  await expect(page.getByTestId("textbox_value_outside")).toHaveText("textbox-value");
});

test("inner datasource is available in the file (implicit containers because of vars)", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(
    `
    <Fragment>
      <Stack var.x="x in outer stack" var.y="y in outer stack">
        <Stack var.y="y in inner stack">
          <DataSource url="/data1" id="explicitDataSource"/>
        </Stack>
      </Stack>
      <Text testId="datasource_value_outside">{explicitDataSource.value}</Text>
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
        },
      },
    },
  );
  await expect(page.getByTestId("datasource_value_outside")).toHaveText("data1");
});
