import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-masonry" };

// =============================================================================
// Masonry — rendering
// =============================================================================

test.describe("Masonry", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(`<Masonry testId="masonry" />`, EXT);
    await expect(page.getByTestId("masonry")).toBeAttached();
  });

  test("renders static children", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Masonry testId="masonry">
        <Text testId="item1">First</Text>
        <Text testId="item2">Second</Text>
        <Text testId="item3">Third</Text>
      </Masonry>`,
      EXT,
    );
    await expect(page.getByTestId("item1")).toHaveText("First");
    await expect(page.getByTestId("item2")).toHaveText("Second");
    await expect(page.getByTestId("item3")).toHaveText("Third");
  });

  test("renders items from data array via itemTemplate", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Masonry testId="masonry" data="{items}">
        <Text testId="item-{$itemIndex}">{$item}</Text>
      </Masonry>`,
      { ...EXT, mainXs: `var items = ["Alpha", "Beta", "Gamma"];` },
    );
    await expect(page.getByTestId("item-0")).toHaveText("Alpha");
    await expect(page.getByTestId("item-1")).toHaveText("Beta");
    await expect(page.getByTestId("item-2")).toHaveText("Gamma");
  });

  test("exposes $itemIndex context variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Masonry data="{items}">
        <Text testId="idx-{$itemIndex}">{$itemIndex}</Text>
      </Masonry>`,
      { ...EXT, mainXs: `var items = ["a", "b"];` },
    );
    await expect(page.getByTestId("idx-0")).toHaveText("0");
    await expect(page.getByTestId("idx-1")).toHaveText("1");
  });

  test("exposes $isFirst and $isLast context variables", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Masonry data="{items}">
        <Text testId="flag-{$itemIndex}">{$isFirst ? 'first' : $isLast ? 'last' : 'middle'}</Text>
      </Masonry>`,
      { ...EXT, mainXs: `var items = ["a", "b", "c"];` },
    );
    await expect(page.getByTestId("flag-0")).toHaveText("first");
    await expect(page.getByTestId("flag-1")).toHaveText("middle");
    await expect(page.getByTestId("flag-2")).toHaveText("last");
  });
});
