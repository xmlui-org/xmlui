import { expect } from "@playwright/test";
import { test } from "../../../xmlui/src/testing";

const EXT = { extensionIds: "xmlui-grid-layout" };

const BASIC_LAYOUT = `layout="{[
  { i: '0', x: 0, y: 0, w: 6, h: 2 },
  { i: '1', x: 6, y: 0, w: 6, h: 2 }
]}"`;

test.describe("GridLayout", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<GridLayout testId="grid" draggable="false" resizable="false" ${BASIC_LAYOUT}>
        <Text>Tile A</Text>
        <Text>Tile B</Text>
      </GridLayout>`,
      EXT,
    );

    await expect(page.getByTestId("grid")).toBeAttached();
    await expect(page.locator(".react-grid-layout")).toHaveCount(1);
    await expect(page.locator(".react-grid-item")).toHaveCount(2);
  });

  test("renders static children in layout items", async ({ initTestBed, page }) => {
    await initTestBed(
      `<GridLayout testId="grid" draggable="false" resizable="false" ${BASIC_LAYOUT}>
        <Text testId="tile-a">Tile A</Text>
        <Text testId="tile-b">Tile B</Text>
      </GridLayout>`,
      EXT,
    );

    await expect(page.getByTestId("tile-a")).toHaveText("Tile A");
    await expect(page.getByTestId("tile-b")).toHaveText("Tile B");
  });

  test("applies rowHeight and gap props", async ({ initTestBed, page }) => {
    await initTestBed(
      `<GridLayout
        testId="grid"
        rowHeight="{70}"
        gap="20px"
        draggable="false"
        resizable="false"
        ${BASIC_LAYOUT}
      >
        <Text>Tile A</Text>
        <Text>Tile B</Text>
      </GridLayout>`,
      EXT,
    );

    const firstItem = page.locator(".react-grid-item").first();
    await expect(firstItem).toHaveCSS("height", "160px");
  });

  test("state updates rerender child content", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Button testId="update" label="Update tile" onClick="tileLabel = 'Updated Tile'" />
        <GridLayout testId="grid" draggable="false" resizable="false" ${BASIC_LAYOUT}>
          <Text testId="tile-a" value="{tileLabel}" />
          <Text>Tile B</Text>
        </GridLayout>
      </VStack>`,
      { ...EXT, mainXs: `var tileLabel = 'Initial Tile';` },
    );

    await expect(page.getByTestId("tile-a")).toHaveText("Initial Tile");
    await page.getByTestId("update").click();
    await expect(page.getByTestId("tile-a")).toHaveText("Updated Tile");
  });

  test("renders items from data array via itemTemplate", async ({ initTestBed, page }) => {
    await initTestBed(
      `<GridLayout data="{items}" ${BASIC_LAYOUT}>
        <Text>{$item}</Text>
      </GridLayout>`,
      { ...EXT, mainXs: `var items = ['Alpha', 'Beta'];` },
    );
    await expect(page.locator(".react-grid-item").first()).toContainText("Alpha");
    await expect(page.locator(".react-grid-item").nth(1)).toContainText("Beta");
  });
});
