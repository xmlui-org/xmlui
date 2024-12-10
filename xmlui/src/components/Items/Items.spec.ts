import {} from "@components/abstractions";
import { ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class ItemsDriver extends ComponentDriver {}

const test = createTestWithDriver(ItemsDriver);

// --- Testing

test.skip("Items does not render htmlon its own", async ({ createDriver }) => {});

test.skip("Items only renders children", async ({ createDriver }) => {});

test.skip("data property renders children", async ({ createDriver }) => {});

test.skip("order of children is reversed", async ({ createDriver }) => {});

test.skip("customize item template for children", async ({ createDriver }) => {});

test.skip("$item accesses the shape of data", async ({ createDriver }) => {});

test.skip("$itemIndex accesses the index of a data item", async ({ createDriver }) => {});

test.skip("$isFirst tests if $item is first", async ({ createDriver }) => {});

test.skip("$isLast tests if $item is last", async ({ createDriver }) => {});
