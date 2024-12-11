import {} from "@components/abstractions";
import { ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class ItemsDriver extends ComponentDriver {}

const test = createTestWithDriver(ItemsDriver);

// --- Testing

test.skip("Items does not render html on its own", async ({ createDriver }) => {
  // Place empty Items in the app and check that it does not render html
});

test.skip("data property renders children", async ({ createDriver }) => {
  // Setting the data property renders children 
});

test.skip("customize item template for children", async ({ createDriver }) => {
  // Set itemTemplate="..."
});

test.skip("data property only renders children if itemTemplate is set", async ({ createDriver }) => {
  // Setting the data property renders children 
});

test.skip("Items only renders children", async ({ createDriver }) => {
  // When children are provided, Items does not render extra containers in html
});

test.skip("order of children is reversed", async ({ createDriver }) => {
  // Set reverse="true" and check that the order of children is reversed
});

test.skip("$item can access the shape of data", async ({ createDriver }) => {});

test.skip("$itemIndex provides the index of a data item", async ({ createDriver }) => {});

test.skip("$isFirst tests if $item is first", async ({ createDriver }) => {});

test.skip("$isLast tests if $item is last", async ({ createDriver }) => {});
