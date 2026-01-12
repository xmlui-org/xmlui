import { test, expect } from "../src/testing/fixtures";

test("script var declaration should override var. attribute initial value - App", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.appNum="{1}">
      <script>
        var appNum = 2
      </script>
      <Text testId="appNum">appNum: {appNum}</Text>
      <TestComp/>
    </App>
  `, {
    components: [
      `
      <Component name="TestComp" var.compNum="{3}">
        <script>
          var compNum = 4
        </script>
        <Text testId="compNum">compNum: {compNum}</Text>
      </Component>
      `
    ]
  });

  // Script declarations should override var. attribute values
  await expect(page.getByTestId("appNum")).toHaveText("appNum: 2");
  await expect(page.getByTestId("compNum")).toHaveText("compNum: 4");
});

test("script var declaration should override var. attribute initial value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack var.appNum="{1}">
      <script>
        var appNum = 2
      </script>
      <Text testId="appNum">appNum: {appNum}</Text>
      <TestComp/>
    </Stack>
  `, {
    components: [
      `
      <Component name="TestComp" var.compNum="{3}">
        <script>
          var compNum = 4
        </script>
        <Text testId="compNum">compNum: {compNum}</Text>
      </Component>
      `
    ]
  });

  // Script declarations should override var. attribute values
  await expect(page.getByTestId("appNum")).toHaveText("appNum: 2");
  await expect(page.getByTestId("compNum")).toHaveText("compNum: 4");
});

test("script var declaration takes precedence over initial var. value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack var.count="{0}">
      <script>
        var count = 10
      </script>
      <Text testId="count">{count}</Text>
      <Button testId="increment" onClick="count++">Increment</Button>
    </Stack>
  `);

  // Should start at 10 (from script), not 0 (from var.)
  await expect(page.getByTestId("count")).toHaveText("10");
  
  // Should increment from script value
  await page.getByTestId("increment").click();
  await expect(page.getByTestId("count")).toHaveText("11");
});

test("multiple var declarations in script override corresponding var. attributes", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack var.x="{1}" var.y="{2}" var.z="{3}">
      <script>
        var x = 100;
        var y = 200;
      </script>
      <Text testId="x">{x}</Text>
      <Text testId="y">{y}</Text>
      <Text testId="z">{z}</Text>
    </Stack>
  `);

  // x and y should be overridden by script
  await expect(page.getByTestId("x")).toHaveText("100");
  await expect(page.getByTestId("y")).toHaveText("200");
  // z should keep var. attribute value
  await expect(page.getByTestId("z")).toHaveText("3");
});
