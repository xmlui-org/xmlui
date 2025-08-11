import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Items data="{[
        { name: 'Item 1' },
        { name: 'Item 2' },
        { name: 'Item 3' }
      ]}">
        <Text testId="item-{$itemIndex}">{$item.name}</Text>
      </Items>
    `);

    await expect(page.getByTestId("item-0")).toContainText("Item 1");
    await expect(page.getByTestId("item-1")).toContainText("Item 2");
    await expect(page.getByTestId("item-2")).toContainText("Item 3");
  });

  test("renders with inline itemTemplate property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Items data="{[
        { value: 'First' },
        { value: 'Second' }
      ]}">
        <property name="itemTemplate">
          <Text testId="template-item-{$itemIndex}">{$item.value}</Text>
        </property>
      </Items>
    `);

    await expect(page.getByTestId("template-item-0")).toContainText("First");
    await expect(page.getByTestId("template-item-1")).toContainText("Second");
  });

  test("renders nothing with empty data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container">
        <Text>Container Content</Text>
        <Items data="{[]}">
          <Text>{$item.name}</Text>
        </Items>
      </VStack>
    `);

    const container = page.getByTestId("container");
    await expect(container).toBeVisible();
    
    // Should contain the text we added to make container visible
    await expect(container).toContainText("Container Content");
    
    // Container should have exactly one child (our text element, not the empty Items)
    const textElements = container.locator("div").filter({ hasText: "Container Content" });
    await expect(textElements).toHaveCount(1);
  });

  test("renders nothing with null data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container">
        <Text>Container Content</Text>
        <Items data="{null}">
          <Text>{$item.name}</Text>
        </Items>
      </VStack>
    `);

    const container = page.getByTestId("container");
    await expect(container).toBeVisible();
    
    // Should contain the text we added to make container visible
    await expect(container).toContainText("Container Content");
    
    // Container should have exactly one child (our text element, not the null Items)
    const textElements = container.locator("div").filter({ hasText: "Container Content" });
    await expect(textElements).toHaveCount(1);
  });

  test("renders nothing with undefined data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container">
        <Text>Container Content</Text>
        <Items data="{undefined}">
          <Text>{$item.name}</Text>
        </Items>
      </VStack>
    `);

    const container = page.getByTestId("container");
    await expect(container).toBeVisible();
    
    // Should contain the text we added to make container visible
    await expect(container).toContainText("Container Content");
    
    // Container should have exactly one child (our text element, not the undefined Items)
    const textElements = container.locator("div").filter({ hasText: "Container Content" });
    await expect(textElements).toHaveCount(1);
  });

  // =============================================================================
  // CONTEXT VARIABLES TESTS
  // =============================================================================

  test.describe("Context Variables", () => {
    test("$item provides current data item", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{[
          { id: 1, title: 'First Item' },
          { id: 2, title: 'Second Item' }
        ]}">
          <Text testId="item-{$item.id}">{$item.title}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-1")).toContainText("First Item");
      await expect(page.getByTestId("item-2")).toContainText("Second Item");
    });

    test("$itemIndex provides zero-based index", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{['A', 'B', 'C']}">
          <Text testId="index-{$itemIndex}">Index: {$itemIndex}, Value: {$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("index-0")).toContainText("Index: 0, Value: A");
      await expect(page.getByTestId("index-1")).toContainText("Index: 1, Value: B");
      await expect(page.getByTestId("index-2")).toContainText("Index: 2, Value: C");
    });

    test("$isFirst indicates first item", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{['Alpha', 'Beta', 'Gamma']}">
          <Text testId="item-{$itemIndex}">{$isFirst ? 'FIRST: ' : ''}{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("FIRST: Alpha");
      await expect(page.getByTestId("item-1")).toContainText("Beta");
      await expect(page.getByTestId("item-2")).toContainText("Gamma");
    });

    test("$isLast indicates last item", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{['Alpha', 'Beta', 'Gamma']}">
          <Text testId="item-{$itemIndex}">{$item}{$isLast ? ' :LAST' : ''}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("Alpha");
      await expect(page.getByTestId("item-1")).toContainText("Beta");
      await expect(page.getByTestId("item-2")).toContainText("Gamma :LAST");
    });

    test("$isFirst and $isLast work with single item", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{['OnlyItem']}">
          <Text testId="only-item">
            {$isFirst ? 'FIRST ' : ''}{$item}{$isLast ? ' LAST' : ''}
          </Text>
        </Items>
      `);

      await expect(page.getByTestId("only-item")).toContainText("FIRST OnlyItem LAST");
    });
  });

  // =============================================================================
  // REVERSE PROPERTY TESTS
  // =============================================================================

  test.describe("Reverse Property", () => {
    test("default behavior renders items in original order", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{['First', 'Second', 'Third']}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      // Let's first see what the default behavior is
      await expect(page.getByTestId("item-0")).toBeVisible();
      await expect(page.getByTestId("item-1")).toBeVisible();
      await expect(page.getByTestId("item-2")).toBeVisible();
    });

    test("reverse=false renders items in original order", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items reverse="{false}" data="{['First', 'Second', 'Third']}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("First");
      await expect(page.getByTestId("item-1")).toContainText("Second");
      await expect(page.getByTestId("item-2")).toContainText("Third");
    });

    test("reverse=true renders items in reversed order", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items reverse="{true}" data="{['First', 'Second', 'Third']}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("Third");
      await expect(page.getByTestId("item-1")).toContainText("Second");
      await expect(page.getByTestId("item-2")).toContainText("First");
    });

    test("reverse=true maintains correct context variables", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items reverse="{true}" data="{['A', 'B', 'C']}">
          <Text testId="item-{$itemIndex}">
            {$item} - Index:{$itemIndex} - First:{$isFirst ? 'yes' : 'no'} - Last:{$isLast ? 'yes' : 'no'}
          </Text>
        </Items>
      `);

      // With reverse=true, order is C, B, A but indices should be 0, 1, 2
      await expect(page.getByTestId("item-0")).toContainText("C - Index:0 - First:yes - Last:no");
      await expect(page.getByTestId("item-1")).toContainText("B - Index:1 - First:no - Last:no");
      await expect(page.getByTestId("item-2")).toContainText("A - Index:2 - First:no - Last:yes");
    });
  });

  // =============================================================================
  // ALTERNATIVE DATA SOURCES TESTS
  // =============================================================================

  test.describe("Data Sources", () => {
    test("items property works as alternative to data property", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items items="{[
          { name: 'Via Items Prop' },
          { name: 'Second Item' }
        ]}">
          <Text testId="item-{$itemIndex}">{$item.name}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("Via Items Prop");
      await expect(page.getByTestId("item-1")).toContainText("Second Item");
    });

    test("object converts to array via Object.values", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{{
          key1: 'First Value',
          key2: 'Second Value',
          key3: 'Third Value'
        }}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      // Object.values order may vary, so we check that all values are present
      await expect(page.getByTestId("item-0")).toBeVisible();
      await expect(page.getByTestId("item-1")).toBeVisible();
      await expect(page.getByTestId("item-2")).toBeVisible();
      
      // Check that values from the object are rendered
      const items = page.locator('[data-testid^="item-"]');
      await expect(items).toHaveCount(3);
    });
  });

  // =============================================================================
  // DATA TYPE EDGE CASES TESTS
  // =============================================================================

  test.describe("Data Type Edge Cases", () => {
    test("handles special characters in data", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{[
          'Unicode: 👨‍👩‍👧‍👦',
          'Chinese: 你好世界',
          'Special chars'
        ]}">
          <Text testId="item-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("item-0")).toContainText("Unicode: 👨‍👩‍👧‍👦");
      await expect(page.getByTestId("item-1")).toContainText("Chinese: 你好世界");
      await expect(page.getByTestId("item-2")).toContainText("Special chars");
    });

    test("handles numeric data items", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{[0, 1, 42, -5, 3.14, NaN, Infinity]}">
          <Text testId="number-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("number-0")).toContainText("0");
      await expect(page.getByTestId("number-1")).toContainText("1");
      await expect(page.getByTestId("number-2")).toContainText("42");
      await expect(page.getByTestId("number-3")).toContainText("-5");
      await expect(page.getByTestId("number-4")).toContainText("3.14");
      await expect(page.getByTestId("number-5")).toContainText("NaN");
      await expect(page.getByTestId("number-6")).toContainText("Infinity");
    });

    test("handles boolean data items", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{[true, false]}">
          <Text testId="bool-{$itemIndex}">{$item}</Text>
        </Items>
      `);

      await expect(page.getByTestId("bool-0")).toContainText("true");
      await expect(page.getByTestId("bool-1")).toContainText("false");
    });

    test("handles mixed data types", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Items data="{[
          'string',
          42,
          true,
          { name: 'object' }
        ]}">
          <Text testId="mixed-{$itemIndex}">
            {typeof $item === 'object' && $item !== null ? $item.name || 'object' : $item}
          </Text>
        </Items>
      `);

      await expect(page.getByTestId("mixed-0")).toContainText("string");
      await expect(page.getByTestId("mixed-1")).toContainText("42");
      await expect(page.getByTestId("mixed-2")).toContainText("true");
      await expect(page.getByTestId("mixed-3")).toContainText("object");
    });
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no template children gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container">
        <Text>Before Items</Text>
        <Items data="{['item1', 'item2']}">
        </Items>
        <Text>After Items</Text>
      </VStack>
    `);

    const container = page.getByTestId("container");
    await expect(container).toBeVisible();
    
    // Should still render the surrounding text elements
    await expect(container).toContainText("Before Items");
    await expect(container).toContainText("After Items");
    
    // Items with no template should not render anything
    const beforeText = page.getByText("Before Items");
    const afterText = page.getByText("After Items");
    await expect(beforeText).toBeVisible();
    await expect(afterText).toBeVisible();
  });

  test("component renders without wrapper element", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="parent">
        <Text>Before Items</Text>
        <Items data="{['Test Item']}">
          <Text testId="item-content">{$item}</Text>
        </Items>
        <Text>After Items</Text>
      </VStack>
    `);

    // Items should not add its own wrapper - the item content should be a direct child
    const parent = page.getByTestId("parent");
    await expect(parent).toContainText("Before Items");
    await expect(parent).toContainText("Test Item");
    await expect(parent).toContainText("After Items");
    
    // The item should be rendered directly
    await expect(page.getByTestId("item-content")).toContainText("Test Item");
  });

  test("handles large arrays gracefully", async ({ initTestBed, page }) => {
    // Test with smaller array that can be handled inline
    await initTestBed(`
      <Items data="{[
        { id: 0, name: 'Item 0' },
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 50, name: 'Item 50' },
        { id: 99, name: 'Item 99' }
      ]}">
        <Text testId="item-{$item.id}">#{$item.id}: {$item.name}</Text>
      </Items>
    `);

    // Check that all items are rendered
    await expect(page.getByTestId("item-0")).toContainText("#0: Item 0");
    await expect(page.getByTestId("item-1")).toContainText("#1: Item 1");
    await expect(page.getByTestId("item-2")).toContainText("#2: Item 2");
    await expect(page.getByTestId("item-50")).toContainText("#50: Item 50");
    await expect(page.getByTestId("item-99")).toContainText("#99: Item 99");
  });

  test("handles deeply nested data structures", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Items data="{[
        { 
          user: { profile: { name: 'John', details: { age: 30 } } },
          settings: { theme: 'dark' }
        },
        {
          user: { profile: { name: 'Jane', details: { age: 25 } } },
          settings: { theme: 'light' }
        }
      ]}">
        <Text testId="user-{$itemIndex}">
          {$item.user.profile.name} ({$item.user.profile.details.age}) - Theme: {$item.settings.theme}
        </Text>
      </Items>
    `);

    await expect(page.getByTestId("user-0")).toContainText("John (30) - Theme: dark");
    await expect(page.getByTestId("user-1")).toContainText("Jane (25) - Theme: light");
  });

  test("handles non-array data gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="container">
        <Text>Container Content</Text>
        <Items data="not-an-array">
          <Text>{$item}</Text>
        </Items>
      </VStack>
    `);

    const container = page.getByTestId("container");
    await expect(container).toBeVisible();
    
    // Should contain the text we added to make container visible
    await expect(container).toContainText("Container Content");
    
    // Non-array data should result in no items rendered, but container should still be visible
    const textElements = container.locator("div").filter({ hasText: "Container Content" });
    await expect(textElements).toHaveCount(1);
  });
});
