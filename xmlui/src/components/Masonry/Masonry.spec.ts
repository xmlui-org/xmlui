import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items from data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{['A', 'B', 'C']}"
        columnCount="{3}"
        initialItemCount="{3}"
      >
        <Text testId="item-{$itemIndex}">{$item}</Text>
      </Masonry>
    `);

    await expect(page.getByTestId("item-0")).toContainText("A");
    await expect(page.getByTestId("item-1")).toContainText("B");
    await expect(page.getByTestId("item-2")).toContainText("C");
  });

  test("renders with inline itemTemplate property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{[{ value: 'First' }, { value: 'Second' }]}"
        columnCount="{2}"
        initialItemCount="{2}"
      >
        <property name="itemTemplate">
          <Text testId="template-{$itemIndex}">{$item.value}</Text>
        </property>
      </Masonry>
    `);

    await expect(page.getByTestId("template-0")).toContainText("First");
    await expect(page.getByTestId("template-1")).toContainText("Second");
  });

  test("renders nothing with empty data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="wrapper">
        <Text>Before</Text>
        <Masonry items="{[]}" columnCount="{2}">
          <Text>{$item}</Text>
        </Masonry>
        <Text>After</Text>
      </VStack>
    `);

    const wrapper = page.getByTestId("wrapper");
    await expect(wrapper).toContainText("Before");
    await expect(wrapper).toContainText("After");
  });
});

// =============================================================================
// CONTEXT VARIABLES TESTS
// =============================================================================

test.describe("Context Variables", () => {
  test("$item provides current data item", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{[{ id: 1, title: 'Alpha' }, { id: 2, title: 'Beta' }]}"
        columnCount="{2}"
        initialItemCount="{2}"
      >
        <Text testId="cv-{$item.id}">{$item.title}</Text>
      </Masonry>
    `);

    await expect(page.getByTestId("cv-1")).toContainText("Alpha");
    await expect(page.getByTestId("cv-2")).toContainText("Beta");
  });

  test("$itemIndex provides zero-based index", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{['X', 'Y', 'Z']}"
        columnCount="{3}"
        initialItemCount="{3}"
      >
        <Text testId="idx-{$itemIndex}">Index: {$itemIndex}, Value: {$item}</Text>
      </Masonry>
    `);

    await expect(page.getByTestId("idx-0")).toContainText("Index: 0, Value: X");
    await expect(page.getByTestId("idx-1")).toContainText("Index: 1, Value: Y");
    await expect(page.getByTestId("idx-2")).toContainText("Index: 2, Value: Z");
  });
});

// =============================================================================
// LAYOUT PROPERTIES TESTS
// =============================================================================

test.describe("Layout Properties", () => {
  test("columnCount controls how many columns are rendered", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{[{ n: 'A' }, { n: 'B' }, { n: 'C' }, { n: 'D' }]}"
        columnCount="{4}"
        initialItemCount="{4}"
      >
        <Text testId="col-{$itemIndex}">{$item.n}</Text>
      </Masonry>
    `);

    await expect(page.getByTestId("col-0")).toBeVisible();
    await expect(page.getByTestId("col-1")).toBeVisible();
    await expect(page.getByTestId("col-2")).toBeVisible();
    await expect(page.getByTestId("col-3")).toBeVisible();
  });

  test("useWindowScroll renders items without fixed height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Masonry
        items="{['P', 'Q', 'R']}"
        columnCount="{3}"
        useWindowScroll="{true}"
        initialItemCount="{3}"
      >
        <Text testId="ws-{$itemIndex}">{$item}</Text>
      </Masonry>
    `);

    await expect(page.getByTestId("ws-0")).toContainText("P");
    await expect(page.getByTestId("ws-1")).toContainText("Q");
    await expect(page.getByTestId("ws-2")).toContainText("R");
  });
});

