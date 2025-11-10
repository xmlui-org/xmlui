import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders matching case child", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="option1">
        <Text case="option1" value="First Option" testId="text1" />
        <Text case="option2" value="Second Option" testId="text2" />
      </Choose>
    `);

    await expect(page.getByTestId("text1")).toBeVisible();
    await expect(page.getByTestId("text1")).toHaveText("First Option");
    await expect(page.getByTestId("text2")).not.toBeVisible();
  });

  test("renders first matching case when multiple matches exist", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="match">
        <Text case="match" value="First Match" testId="text1" />
        <Text case="match" value="Second Match" testId="text2" />
      </Choose>
    `);

    await expect(page.getByTestId("text1")).toBeVisible();
    await expect(page.getByTestId("text2")).not.toBeVisible();
  });

  test("renders default case when no match found", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="nonexistent">
        <Text case="option1" value="First Option" testId="text1" />
        <Text case="option2" value="Second Option" testId="text2" />
        <Text value="Default Option" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("text2")).not.toBeVisible();
    await expect(page.getByTestId("default")).toBeVisible();
    await expect(page.getByTestId("default")).toHaveText("Default Option");
  });

  test("renders nothing when no match and no default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Text value="Before" testId="before" />
        <Choose condition="nonexistent">
          <Text case="option1" value="First Option" testId="text1" />
          <Text case="option2" value="Second Option" testId="text2" />
        </Choose>
        <Text value="After" testId="after" />
      </Fragment>
    `);

    await expect(page.getByTestId("before")).toBeVisible();
    await expect(page.getByTestId("after")).toBeVisible();
    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("text2")).not.toBeVisible();
  });

  test("renders nothing when no children provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Text value="Before" testId="before" />
        <Choose condition="test" />
        <Text value="After" testId="after" />
      </Fragment>
    `);

    await expect(page.getByTestId("before")).toBeVisible();
    await expect(page.getByTestId("after")).toBeVisible();
  });

  test("removes 'case' prop from rendered child", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="option1">
        <Button case="option1" testId="btn">Click Me</Button>
      </Choose>
    `);

    const button = page.getByTestId("btn");
    await expect(button).toBeVisible();
    // Verify button doesn't have 'case' attribute in DOM
    await expect(button).not.toHaveAttribute("case");
  });
});

test.describe("condition prop", () => {
  test("matches string values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="admin">
        <Text case="admin" value="Admin Panel" testId="result" />
        <Text case="user" value="User Panel" />
      </Choose>
    `);

    await expect(page.getByTestId("result")).toHaveText("Admin Panel");
  });

  test("matches numeric values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="42">
        <Text case="0" value="Zero" />
        <Text case="42" value="Forty Two" testId="result" />
        <Text case="100" value="Hundred" />
      </Choose>
    `);

    await expect(page.getByTestId("result")).toHaveText("Forty Two");
  });

  test("matches boolean values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="true">
        <Text case="true" value="True Value" testId="result" />
        <Text case="false" value="False Value" />
      </Choose>
    `);

    await expect(page.getByTestId("result")).toHaveText("True Value");
  });

  test("works with binding expressions", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Choose condition="{testState}">
          <Text case="active" value="Active" testId="result" />
          <Text case="inactive" value="Inactive" />
        </Choose>
        <Button testId="btn" onClick="testState = 'active'" />
      </Fragment>
    `);

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe("active");
    await expect(page.getByTestId("result")).toHaveText("Active");
  });

  test("handles null condition", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="{null}">
        <Text case="something" value="Something" testId="text1" />
        <Text value="Default" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("default")).toBeVisible();
  });

  test("handles undefined condition", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="{undefined}">
        <Text case="something" value="Something" testId="text1" />
        <Text value="Default" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("default")).toBeVisible();
  });

  test("distinguishes between 0 and false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="0">
        <Text case="0" value="Zero" testId="zero" />
        <Text case="false" value="False" testId="false" />
      </Choose>
    `);

    await expect(page.getByTestId("zero")).toBeVisible();
    await expect(page.getByTestId("false")).not.toBeVisible();
  });

  test("distinguishes between empty string and undefined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="">
        <Text case="" value="Empty String" testId="empty" />
        <Text value="Default" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("empty")).toBeVisible();
    await expect(page.getByTestId("default")).not.toBeVisible();
  });
});

test.describe("case prop", () => {
  test("matches with binding expression in case", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.targetValue="option2">
        <Choose condition="option2">
          <Text case="option1" value="First" testId="text1" />
          <Text case="{targetValue}" value="Second" testId="text2" />
        </Choose>
      </Fragment>
    `);

    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("text2")).toBeVisible();
  });

  test("handles complex child components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="card">
        <Button case="button">Button Option</Button>
        <Card case="card" testId="card">
          <Text value="Card Content" testId="content" />
        </Card>
      </Choose>
    `);

    await expect(page.getByTestId("card")).toBeVisible();
    await expect(page.getByTestId("content")).toHaveText("Card Content");
  });

  test("works with nested Choose components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="outer1">
        <Text case="outer0" value="Outer 0" />
        <Choose case="outer1" condition="inner2">
          <Text case="inner1" value="Inner 1" />
          <Text case="inner2" value="Inner 2" testId="result" />
        </Choose>
      </Choose>
    `);

    await expect(page.getByTestId("result")).toHaveText("Inner 2");
  });
});

test.describe("default case", () => {
  test("renders first child without case as default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="nomatch">
        <Text case="option1" value="Option 1" />
        <Text value="Default 1" testId="default1" />
        <Text value="Default 2" testId="default2" />
      </Choose>
    `);

    await expect(page.getByTestId("default1")).toBeVisible();
    await expect(page.getByTestId("default2")).not.toBeVisible();
  });

  test("default case appears before matching cases", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="option2">
        <Text case="option1" value="Option 1" testId="text1" />
        <Text value="Default" testId="default" />
        <Text case="option2" value="Option 2" testId="text2" />
      </Choose>
    `);

    // Default appears first, so it should be rendered, not option2
    await expect(page.getByTestId("default")).toBeVisible();
    await expect(page.getByTestId("text1")).not.toBeVisible();
    await expect(page.getByTestId("text2")).not.toBeVisible();
  });

  test("default case can contain complex components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="nomatch">
        <Text case="option1" value="Option 1" />
        <Card testId="defaultCard">
          <Heading level="2" testId="heading">Default Heading</Heading>
          <Text value="Default content" testId="content" />
        </Card>
      </Choose>
    `);

    await expect(page.getByTestId("defaultCard")).toBeVisible();
    await expect(page.getByTestId("heading")).toHaveText("Default Heading");
    await expect(page.getByTestId("content")).toHaveText("Default content");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles empty condition value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="">
        <Text case="" value="Empty Match" testId="empty" />
        <Text value="Default" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("empty")).toBeVisible();
    await expect(page.getByTestId("default")).not.toBeVisible();
  });

  test("handles whitespace in case values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="  spaces  ">
        <Text case="  spaces  " value="Match" testId="match" />
        <Text value="Default" testId="default" />
      </Choose>
    `);

    await expect(page.getByTestId("match")).toBeVisible();
  });

  test("handles special characters in condition and case", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="@#$%^&amp;*()">
        <Text case="@#$%^&amp;*()" value="Special Chars" testId="special" />
        <Text value="Default" />
      </Choose>
    `);

    await expect(page.getByTestId("special")).toBeVisible();
  });

  test("handles unicode characters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="👨‍👩‍👧‍👦">
        <Text case="👨‍👩‍👧‍👦" value="Family Emoji" testId="emoji" />
        <Text value="Default" />
      </Choose>
    `);

    await expect(page.getByTestId("emoji")).toBeVisible();
  });

  test("handles Chinese characters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="你好">
        <Text case="你好" value="Chinese Match" testId="chinese" />
        <Text value="Default" />
      </Choose>
    `);

    await expect(page.getByTestId("chinese")).toBeVisible();
  });

  test("dynamic condition updates render correct child", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.status="pending">
        <Choose condition="{status}">
          <Text case="pending" value="Pending" testId="result" />
          <Text case="active" value="Active"  testId="result" />
          <Text case="completed" value="Completed" testId="result" />
        </Choose>
        <Button testId="activate" onClick="status = 'active'" />
        <Button testId="complete" onClick="status = 'completed'" />
      </Fragment>
    `);

    await expect(page.getByTestId("result")).toHaveText("Pending");

    await page.getByTestId("activate").click();
    await expect(page.getByTestId("result")).toHaveText("Active");

    await page.getByTestId("complete").click();
    await expect(page.getByTestId("result")).toHaveText("Completed");
  });

  test("works with Fragment as direct child", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="fragment">
        <Text case="text" value="Text" />
        <Fragment case="fragment">
          <Text value="First in Fragment" testId="first" />
          <Text value="Second in Fragment" testId="second" />
        </Fragment>
      </Choose>
    `);

    await expect(page.getByTestId("first")).toBeVisible();
    await expect(page.getByTestId("second")).toBeVisible();
  });

  test("case-sensitive matching", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="Option">
        <Text case="option" value="Lowercase" testId="lower" />
        <Text case="Option" value="Capitalized" testId="cap" />
        <Text case="OPTION" value="Uppercase" testId="upper" />
      </Choose>
    `);

    await expect(page.getByTestId("lower")).not.toBeVisible();
    await expect(page.getByTestId("cap")).toBeVisible();
    await expect(page.getByTestId("upper")).not.toBeVisible();
  });

  test("preserves child component props and events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Choose condition="button">
        <Button 
          case="button" 
          testId="btn" 
          variant="primary" 
          size="lg"
          onClick="testState = 'clicked'"
        >
          Click Me
        </Button>
      </Choose>
    `);

    const button = page.getByTestId("btn");
    await expect(button).toBeVisible();
    await expect(button).toHaveText("Click Me");

    await button.click();
    await expect.poll(testStateDriver.testState).toBe("clicked");
  });

  test("works with all component types", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Choose condition="stack">
        <Button case="button">Button</Button>
        <Card case="card">Card</Card>
        <Stack case="stack" testId="stack">
          <Text value="In Stack" testId="text" />
        </Stack>
      </Choose>
    `);

    await expect(page.getByTestId("stack")).toBeVisible();
    await expect(page.getByTestId("text")).toHaveText("In Stack");
  });

  test("multiple Choose components work independently", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Choose condition="a">
          <Text case="a" value="First A" testId="first" />
          <Text case="b" value="First B" />
        </Choose>
        <Choose condition="b">
          <Text case="a" value="Second A" />
          <Text case="b" value="Second B" testId="second" />
        </Choose>
      </Fragment>
    `);

    await expect(page.getByTestId("first")).toHaveText("First A");
    await expect(page.getByTestId("second")).toHaveText("Second B");
  });
});
