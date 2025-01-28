import { TextVariantElement } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, test } from "@testing/fixtures";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("Text is rendered", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeAttached();
  });

  // --- value

  // correct types: string, undefined, null, number, boolean -> everything will be coerced to strings
  [
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string", value: "'test'", toExpect: "test" },
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "boolean", value: "'{true}'", toExpect: "true" },
    { label: "empty object", value: "'{{}}'", toExpect: {}.toString() },
    { label: "object", value: "\"{{ a: 1, b: 'hi' }}\"", toExpect: { a: 1, b: "hi" }.toString() },
    { label: "empty array", value: "'{[]}'", toExpect: "" },
    { label: "array", value: "'{[1, 2, 3]}'", toExpect: [1, 2, 3].toString() },
  ].forEach(({ label, value, toExpect }) => {
    test(`setting value to ${label} sets value of field`, async ({
      initTestBed,
      createTextDriver,
    }) => {
      await initTestBed(`<Text value=${value} />`);
      const driver = await createTextDriver();

      await expect(driver.component).toHaveText(toExpect);
    });
  });

  // --- enabled

  test("enabled=true enables component", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text enabled="true" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeEnabled();
  });

  test.skip(
    "enabled=false disables component",
    SKIP_REASON.UNSURE("Not sure why this doesn't work"),
    async ({ initTestBed, createTextDriver }) => {
      await initTestBed(`<Text enabled="false" />`);
      const driver = await createTextDriver();

      await expect(driver.component).toBeDisabled();
    },
  );
});

// --- Props

// --- variant

Object.entries(TextVariantElement).forEach(([variant, htmlElement]) => {
  test.skip(
    `variant=${variant} renders the HTML element: ${htmlElement}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- maxLines

test.skip(
  `maxLines determines the maximum number of lines to wrap to`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- preserveLinebreaks

test.skip(
  `preserveLinebreaks=true preserves linebreaks`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  `preserveLinebreaks=false removes linebreaks`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- ellipses

test.skip(
  `ellipses=true renders ellipses`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  `ellipses=false does not render ellipses`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
