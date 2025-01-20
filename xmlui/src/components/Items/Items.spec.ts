import {} from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { ComponentDriver } from "@testing/ComponentDrivers";
import { createTestWithDriver } from "@testing/fixtures";

// --- Setup

class ItemsDriver extends ComponentDriver {}

const test = createTestWithDriver(ItemsDriver);

// --- Testing

test.skip("Items does not render html on its own",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // Place empty Items in the app and check that it does not render html
  // How: parent of Items has no children
});

test.skip("data property renders children",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // Setting the data property renders children 
});

test.skip("customize item template for children",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // Set itemTemplate="..."
});

test.skip("data property only renders children if itemTemplate is set",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // Setting the data property renders children 
});

test.skip("Items only renders children",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // When children are provided, Items does not render extra containers in html
});

test.skip("order of children is reversed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // Set reverse="true" and check that the order of children is reversed
});

test.skip("$item can access the shape of data",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("$itemIndex provides the index of a data item",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("$isFirst tests if $item is first",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("$isLast tests if $item is last",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});
