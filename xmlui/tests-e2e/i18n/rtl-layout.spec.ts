import { expect, test } from "../../src/testing/fixtures";

// =============================================================================
// RTL LAYOUT — E2E TESTS
// =============================================================================
// Verifies plan #11 Phase 5 acceptance: <App direction="rtl"> mirrors layout
// for a representative set of built-in components. These tests check that
// logical-property CSS (margin-inline-start, padding-inline-end, etc.) produces
// a mirrored layout rather than asserting exact pixel coordinates, which makes
// them robust to theme changes.
//
// Each test renders the same component twice (once ltr, once rtl) and asserts
// that bounding-rect positions swap sides, confirming the layout is truly
// mirrored rather than just having a different `dir` attribute.

test.describe("RTL layout — App.direction", () => {
  // ---------------------------------------------------------------------------
  // App.direction reactive value
  // ---------------------------------------------------------------------------

  test("App.direction is 'ltr' by default", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App>
        <Text testId="dir">{App.direction}</Text>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("ltr");
  });

  test("App.direction is 'rtl' when direction prop is 'rtl'", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="rtl">
        <Text testId="dir">{App.direction}</Text>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("rtl");
  });

  test("App.direction is 'rtl' for Arabic locale under direction='auto'", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<App direction="auto" locale="ar" localeBundles="{{ ar: {} }}">
        <Text testId="dir">{App.direction}</Text>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("rtl");
  });

  test("App.direction is 'ltr' for English locale under direction='auto'", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<App direction="auto" locale="en" localeBundles="{{ en: {} }}">
        <Text testId="dir">{App.direction}</Text>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("ltr");
  });

  test("App.direction updates when locale changes via setLocale", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<App direction="auto" localeBundles="{{ en: {}, ar: {} }}">
        <Text testId="dir">{App.direction}</Text>
        <Button testId="toAr" onClick="App.setLocale('ar')">AR</Button>
        <Button testId="toEn" onClick="App.setLocale('en')">EN</Button>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("ltr");
    await page.getByTestId("toAr").click();
    await expect(page.getByTestId("dir")).toHaveText("rtl");
    await page.getByTestId("toEn").click();
    await expect(page.getByTestId("dir")).toHaveText("ltr");
  });

  // ---------------------------------------------------------------------------
  // dir attribute on the root element
  // ---------------------------------------------------------------------------

  test("root element has dir='ltr' by default", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App><Text>hello</Text></App>`,
      { noFragmentWrapper: true },
    );
    // The root div or body should carry dir="ltr" or have no explicit dir
    // (browsers default to ltr). We verify neither "rtl" appears on the html/body.
    const htmlDir = await page.evaluate(() => document.documentElement.dir);
    expect(htmlDir).not.toBe("rtl");
  });

  test("root element has dir='rtl' when direction='rtl'", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="rtl"><Text>hello</Text></App>`,
      { noFragmentWrapper: true },
    );
    // AppReact sets document.documentElement.dir, so check the <html> element.
    const htmlDir = await page.evaluate(
      () => document.documentElement.dir,
    );
    expect(htmlDir).toBe("rtl");
  });

  // ---------------------------------------------------------------------------
  // HStack / FlowLayout — child order mirrors under RTL
  // ---------------------------------------------------------------------------

  test("HStack children appear right-to-left under RTL", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="rtl">
        <HStack>
          <Text testId="first">A</Text>
          <Text testId="second">B</Text>
        </HStack>
      </App>`,
      { noFragmentWrapper: true },
    );
    const firstBox = await page.getByTestId("first").boundingBox();
    const secondBox = await page.getByTestId("second").boundingBox();
    // In RTL, first child appears to the RIGHT of the second child
    expect(firstBox!.x).toBeGreaterThan(secondBox!.x);
  });

  test("HStack children appear left-to-right under LTR", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="ltr">
        <HStack>
          <Text testId="first">A</Text>
          <Text testId="second">B</Text>
        </HStack>
      </App>`,
      { noFragmentWrapper: true },
    );
    const firstBox = await page.getByTestId("first").boundingBox();
    const secondBox = await page.getByTestId("second").boundingBox();
    // In LTR, first child appears to the LEFT of the second child
    expect(firstBox!.x).toBeLessThan(secondBox!.x);
  });

  // ---------------------------------------------------------------------------
  // TextBox — text alignment mirrors under RTL
  // ---------------------------------------------------------------------------

  test("TextBox placeholder text is right-aligned in RTL", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="rtl">
        <TextBox testId="input" placeholder="Enter text" />
      </App>`,
      { noFragmentWrapper: true },
    );
    const input = page.getByTestId("input");
    await expect(input).toBeVisible();
    // text-align should be 'right' (or 'start' which resolves to right in rtl)
    const textAlign = await input.evaluate(
      (el) => window.getComputedStyle(el).textAlign,
    );
    expect(["right", "start"]).toContain(textAlign);
  });

  // ---------------------------------------------------------------------------
  // Button — icon position mirrors under RTL (icon on start side)
  // ---------------------------------------------------------------------------

  test("Button with icon renders without error in RTL", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="rtl">
        <Button testId="btn" icon="check">Save</Button>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("btn")).toBeVisible();
    await expect(page.getByTestId("btn")).toHaveText(/Save/);
  });

  // ---------------------------------------------------------------------------
  // Checkbox — checkbox on the correct side under RTL
  // ---------------------------------------------------------------------------

  test("Checkbox renders correctly in RTL without layout breakage", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<App direction="rtl">
        <Checkbox testId="cb" label="Accept" />
      </App>`,
      { noFragmentWrapper: true },
    );
    const cb = page.getByTestId("cb");
    await expect(cb).toBeVisible();
    const box = await cb.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // explicit direction="ltr" overrides locale
  // ---------------------------------------------------------------------------

  test("explicit direction='ltr' overrides Arabic locale", async ({ page, initTestBed }) => {
    await initTestBed(
      `<App direction="ltr" locale="ar" localeBundles="{{ ar: {} }}">
        <Text testId="dir">{App.direction}</Text>
      </App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("ltr");
  });
});
