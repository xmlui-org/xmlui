import { expect, test } from "./fixtures";
import { initApp } from "./component-test-helpers";

test("empty items list", async ({ page }) => {
  const containerId = "itemContainer";
  const childrenData = [];
  const expectedChildrenCount = childrenData.length;

  await initApp(page, {
    entryPoint: `
    <Stack testId="${containerId}">
      <Items items="{${toSingleQuoteString(childrenData)}}">
        <Text>{$item.idx} - {$item.value}</Text>
      </Items>
    </Stack>`,
  });

  const children = page.locator(`[data-testid="${containerId}"] > *`);
  await expect(children).toHaveCount(expectedChildrenCount);
});

test("has items", async ({ page }) => {
  const containerId = "itemContainer";
  const childrenData = [
    { idx: 1, value: 'One lion' },
    { idx: 2, value: 'Two monkeys' },
    { idx: 3, value: 'Three rabbits' },
  ];
  const expectedChildrenCount = childrenData.length;
  const expectedChildrenDisplay = childrenData.map((item) => `${item.idx} - ${item.value}`);

  await initApp(page, {
    entryPoint: `
    <Stack testId="${containerId}">
      <Items items="{${toSingleQuoteString(childrenData)}}">
        <Text>{$item.idx} - {$item.value}</Text>
      </Items>
    </Stack>`,
  });

  const children = page.locator(`[data-testid="${containerId}"] > *`);
  await expect(children).toHaveCount(expectedChildrenCount);
  await expect(children).toHaveText(expectedChildrenDisplay);
});

test("reverse", async ({ page }) => {
  const container1Id = "itemContainer1";
  const container2Id = "itemContainer2";
  const childrenData = [{ idx: "1" }, { idx: "2" }, { idx: "3" }];
  const expectedChild1 = childrenData[0].idx;
  const expectedChild2 = childrenData[childrenData.length-1].idx;

  await initApp(page, {
    entryPoint: `
    <Stack>
      <Stack testId="${container1Id}">
        <Items items="{${toSingleQuoteString(childrenData)}}">
          <Text>{$item.idx}</Text>
        </Items>
      </Stack>
      <Stack testId="${container2Id}">
        <Items items="{${toSingleQuoteString(childrenData)}}" reverse="true">
          <Text>{$item.idx}</Text>
        </Items>
      </Stack>
    </Stack>`,
  });

  const child1 = page.locator(`[data-testid="${container1Id}"] > *`).first();
  const child2 = page.locator(`[data-testid="${container2Id}"] > *`).first();

  await expect(child1).toHaveText(expectedChild1);
  await expect(child2).toHaveText(expectedChild2);
});

// --- Utils

function toSingleQuoteString(str: any) {
  return JSON.stringify(str).replace(/"/g, "'");
}
