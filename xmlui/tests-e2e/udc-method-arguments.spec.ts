import { test, expect } from "../src/testing/fixtures";

// Companion tests for the how-to "Pass arguments to a component method".
// A UDC <method> receives call arguments through a NAMED ARROW PARAMETER, in
// both the element and attribute forms. $param / $params are NOT bound in a
// UDC method body (they belong to built-in component methods).

const COUNTER = `
  <Component name="Counter" var.count="{0}"
    method.addAttr="(n) => count = count + n">
    <Text testId="innerCount">{count}</Text>
    <method name="addElem">(n) => count = count + n</method>
    <method name="reset">count = 0</method>
    <method name="getCount">return count</method>
    <method name="echoParam">return typeof $param + ':' + $param</method>
  </Component>
`;

test("attribute form arrow parameter receives the argument", async ({ page, initTestBed }) => {
  await initTestBed(
    `<Fragment var.r="">
       <Counter id="c" />
       <Button testId="go" onClick="() => { c.addAttr(5); r = 'count=' + c.getCount(); }">go</Button>
       <H2 testId="out">{r}</H2>
     </Fragment>`,
    { components: [COUNTER] },
  );
  await page.getByTestId("go").click();
  await expect(page.getByTestId("out")).toHaveText("count=5");
});

test("element form arrow parameter receives the argument", async ({ page, initTestBed }) => {
  await initTestBed(
    `<Fragment var.r="">
       <Counter id="c" />
       <Button testId="go" onClick="() => { c.addElem(3); r = 'count=' + c.getCount(); }">go</Button>
       <H2 testId="out">{r}</H2>
     </Fragment>`,
    { components: [COUNTER] },
  );
  await page.getByTestId("go").click();
  await expect(page.getByTestId("out")).toHaveText("count=3");
});

test("no-arg statement body runs and getter returns a value", async ({ page, initTestBed }) => {
  await initTestBed(
    `<Fragment var.r="">
       <Counter id="c" />
       <Button testId="go" onClick="() => { c.addAttr(9); c.reset(); r = 'count=' + c.getCount(); }">go</Button>
       <H2 testId="out">{r}</H2>
     </Fragment>`,
    { components: [COUNTER] },
  );
  await page.getByTestId("go").click();
  await expect(page.getByTestId("out")).toHaveText("count=0");
});

test("$params is NOT bound in a UDC method body", async ({ page, initTestBed }) => {
  await initTestBed(
    `<Fragment var.r="unset">
       <Counter id="c" />
       <Button testId="go" onClick="() => r = c.echoParam('X')">go</Button>
       <H2 testId="out">{r}</H2>
     </Fragment>`,
    { components: [COUNTER] },
  );
  await page.getByTestId("go").click();
  // $param is undefined inside a UDC method body — the argument 'X' does not land there.
  await expect(page.getByTestId("out")).toHaveText("undefined:undefined");
});
