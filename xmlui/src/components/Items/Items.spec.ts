import { SKIP_REASON } from "../../testing/component-test-helpers";
import { test } from "../../testing/fixtures";

// TODO: Get children reliably and clearly via driver or otherwise

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test.skip(
    "Items does not render html on its own",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Place empty Items in the app and check that it does not render html
      // How: parent of Items has no children
    },
  );

  test.skip(
    "data property renders children",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Setting the data property renders children
    },
  );

  test.skip(
    "customize item template for children",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Set itemTemplate="..."
    },
  );

  test.skip(
    "data property only renders children if itemTemplate is set",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Setting the data property renders children
    },
  );

  test.skip(
    "Items only renders children",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // When children are provided, Items does not render extra containers in html
    },
  );

  test.skip(
    "order of children is reversed",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // Set reverse="true" and check that the order of children is reversed
    },
  );
});

// =============================================================================
// CONTEXT VARIABLE TESTS
// =============================================================================

test.describe("Context Variables", () => {
  test.skip(
    "$item can access the shape of data",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "$itemIndex provides the index of a data item",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "$isFirst tests if $item is first",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "$isLast tests if $item is last",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});
