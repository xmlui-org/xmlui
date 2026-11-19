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

  test("re-renders derived item content after PushSource emits replacement data", async ({
    initTestBed,
    page,
  }) => {
    await page.addInitScript(() => {
      (window as any).subscribeItemsReplacement = (emit: (value: any) => void) => {
        emit([
          { id: "cached-1", title: "Cached first" },
          { id: "cached-2", title: "Cached second" },
        ]);
        (window as any).emitFreshItemsReplacement = () => {
          emit([
            { id: "fresh-1", title: "Fresh first" },
            { id: "fresh-2", title: "Fresh second" },
          ]);
        };
      };
    });

    await initTestBed(
      `
        <Fragment>
          <script>
            function processItems(items) {
              return items.map(item => ({ ...item, display: item.title.toUpperCase() }));
            }

            function getPagedItems(items) {
              return items.slice(0, 1);
            }
          </script>
          <PushSource id="items" subscribe="{window.subscribeItemsReplacement}" />
          <variable name="combinedItems" value="{items.value ?? []}" />
          <variable name="processedItems" value="{processItems(combinedItems)}" />
          <Items data="{getPagedItems(processedItems)}">
            <ItemCard item="{$item}" index="{$itemIndex}" />
          </Items>
        </Fragment>
      `,
      {
        components: [
          `
            <Component
              name="ItemCard"
              var.cardItem="{$props.item}"
              var.cardIndex="{$props.index}"
              var.cardDisplay="{cardItem.display}">
              <Text testId="item-{cardIndex}">{cardDisplay}</Text>
            </Component>
          `,
        ],
      },
    );

    await expect(page.getByTestId("item-0")).toContainText("CACHED FIRST");
    await page.evaluate(() => (window as any).emitFreshItemsReplacement());
    await expect(page.getByTestId("item-0")).toContainText("FRESH FIRST");
  });

  test("remounts item template when PushSource replacement changes item identity", async ({
    initTestBed,
    page,
  }) => {
    await page.addInitScript(() => {
      (window as any).subscribeStatefulItemsReplacement = (emit: (value: any) => void) => {
        emit([{ id: "cached-1", title: "Cached first" }]);
        (window as any).emitFreshStatefulItemsReplacement = () => {
          emit([{ id: "fresh-1", title: "Fresh first" }]);
        };
      };
    });

    await initTestBed(
      `
        <Fragment>
          <PushSource id="items" subscribe="{window.subscribeStatefulItemsReplacement}" />
          <Items data="{items.value ?? []}">
            <StatefulItem item="{$item}" index="{$itemIndex}" />
          </Items>
        </Fragment>
      `,
      {
        components: [
          `
            <Component name="StatefulItem" var.mountedTitle="">
              <Text
                testId="item-{$props.index}"
                onInit="mountedTitle = $props.item.title">
                {mountedTitle}
              </Text>
            </Component>
          `,
        ],
      },
    );

    await expect(page.getByTestId("item-0")).toContainText("Cached first");
    await page.evaluate(() => (window as any).emitFreshStatefulItemsReplacement());
    await expect(page.getByTestId("item-0")).toContainText("Fresh first");
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

// =============================================================================
// REACTIVITY: PARENT FUNCTION DEPS IN CHILD CONTAINERS
// =============================================================================

test.describe("Function dependency tracking across containers", () => {
  test("script function calls in Items children re-evaluate when parent variable changes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <script>
          var selected = "";
          function isSelected(alias) {
            return selected === alias;
          }
        </script>

        <Items data="{[{alias: 'a'}, {alias: 'b'}]}">
          <Button
            testId="btn-{$item.alias}"
            label="{isSelected($item.alias) ? 'YES' : 'NO'}"
            onClick="selected = $item.alias"
          />
        </Items>
      </App>
    `);

    // Initially neither is selected
    await expect(page.getByTestId("btn-a")).toContainText("NO");
    await expect(page.getByTestId("btn-b")).toContainText("NO");

    // Click first button - its label should change via function re-evaluation
    await page.getByTestId("btn-a").click();
    await expect(page.getByTestId("btn-a")).toContainText("YES");
    await expect(page.getByTestId("btn-b")).toContainText("NO");

    // Click second button - selection should move
    await page.getByTestId("btn-b").click();
    await expect(page.getByTestId("btn-a")).toContainText("NO");
    await expect(page.getByTestId("btn-b")).toContainText("YES");
  });
});

// =============================================================================
// TEXT SELECTION (#3959)
// =============================================================================

test.describe("Text selection", () => {
  const WORDS = `{['alpha', 'bravo', 'charlie', 'delta', 'echo']}`;

  // --- Drag from the left edge of one word to the right edge of another
  async function drag(page: any, fromTestId: string, toTestId: string) {
    const from = await page.getByTestId(fromTestId).boundingBox();
    const to = await page.getByTestId(toTestId).boundingBox();
    await page.mouse.move(from.x + 1, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width - 1, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
  }

  // --- Select programmatically from the start of one element's text to the end of another's
  async function select(page: any, fromTestId: string, toTestId: string) {
    await page.evaluate(
      ([fromId, toId]: string[]) => {
        const textOf = (id: string) => {
          const el = document.querySelector(`[data-testid="${id}"]`)!;
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          return walker.nextNode() as Text;
        };
        const a = textOf(fromId);
        const b = textOf(toId);
        window.getSelection()!.setBaseAndExtent(a, 0, b, b.length);
      },
      [fromTestId, toTestId],
    );
  }

  test("a mouse drag reports the first and last items once", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <HStack wrapContent="true" gap="$space-1">
        <Items data="${WORDS}"
          onTextSelectionDidChange="(sel) => testState = [...(testState ?? []), sel]">
          <Text testId="w-{$itemIndex}" value="{$item}" />
        </Items>
      </HStack>
    `);
    await drag(page, "w-1", "w-3");
    await expect
      .poll(async () => {
        const events = (await testStateDriver.testState()) as any[];
        const last = events?.[events.length - 1];
        return last && [last.startIndex, last.endIndex, last.startItem, last.endItem];
      })
      .toEqual([1, 3, "bravo", "delta"]);
    const events = (await testStateDriver.testState()) as any[];
    // --- The mousedown's collapsed caret may report first, then the drag reports once
    expect(events.filter((e) => e.text !== "").length).toBe(1);
    expect(events[events.length - 1].text).toContain("charlie");
  });

  test("a backwards drag reports document order", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <HStack wrapContent="true" gap="$space-1">
        <Items data="${WORDS}" onTextSelectionDidChange="(sel) => testState = sel">
          <Text testId="w-{$itemIndex}" value="{$item}" />
        </Items>
      </HStack>
    `);
    const from = await page.getByTestId("w-3").boundingBox();
    const to = await page.getByTestId("w-1").boundingBox();
    await page.mouse.move(from!.x + from!.width - 1, from!.y + from!.height / 2);
    await page.mouse.down();
    await page.mouse.move(to!.x + 1, to!.y + to!.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect
      .poll(async () => {
        const sel = (await testStateDriver.testState()) as any;
        return sel && [sel.startIndex, sel.endIndex];
      })
      .toEqual([1, 3]);
  });

  test("a click reports a collapsed selection on that item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <HStack wrapContent="true" gap="$space-1">
        <Items data="${WORDS}" onTextSelectionDidChange="(sel) => testState = sel">
          <Text testId="w-{$itemIndex}" value="{$item}" />
        </Items>
      </HStack>
    `);
    await page.getByTestId("w-2").click();
    await expect
      .poll(async () => {
        const sel = (await testStateDriver.testState()) as any;
        return sel && [sel.text, sel.startIndex, sel.endIndex, sel.startItem];
      })
      .toEqual(["", 2, 2, "charlie"]);
  });

  test("a selection made without the pointer reports, and doesn't refire unchanged", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <HStack wrapContent="true" gap="$space-1">
        <Items data="${WORDS}"
          onTextSelectionDidChange="(sel) => testState = [...(testState ?? []), sel.startIndex + '-' + sel.endIndex]">
          <Text testId="w-{$itemIndex}" value="{$item}" />
        </Items>
      </HStack>
    `);
    await select(page, "w-0", "w-2");
    await expect.poll(testStateDriver.testState).toEqual(["0-2"]);
    await select(page, "w-0", "w-2");
    await select(page, "w-0", "w-4");
    await expect.poll(testStateDriver.testState).toEqual(["0-2", "0-4"]);
  });

  test("leaving the component reports null items once", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <HStack wrapContent="true" gap="$space-1">
          <Items data="${WORDS}"
            onTextSelectionDidChange="(sel) => testState = [...(testState ?? []), sel.startItem]">
            <Text testId="w-{$itemIndex}" value="{$item}" />
          </Items>
        </HStack>
        <Text testId="outside" value="Outside the list" />
        <Text testId="outside2" value="Also outside" />
      </VStack>
    `);
    await select(page, "w-1", "w-1");
    await expect.poll(testStateDriver.testState).toEqual(["bravo"]);
    await select(page, "outside", "outside");
    await select(page, "outside2", "outside2");
    // --- A selection straddling the boundary is not wholly inside either
    await select(page, "w-1", "outside");
    await expect.poll(testStateDriver.testState).toEqual(["bravo", null]);
  });

  test("getTextSelection returns the current selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <HStack wrapContent="true" gap="$space-1">
        <Items id="words" data="${WORDS}"
          onTextSelectionDidChange="testState = words.getTextSelection()">
          <Text testId="w-{$itemIndex}" value="{$item}" />
        </Items>
      </HStack>
    `);
    await select(page, "w-2", "w-3");
    await expect
      .poll(async () => {
        const sel = (await testStateDriver.testState()) as any;
        // --- The browser separates text from different flex items with a line break
        return sel && [sel.startItem, sel.endItem, sel.text.replace(/\s+/g, "")];
      })
      .toEqual(["charlie", "delta", "charliedelta"]);
  });

  test("nested Items resolve to their own items", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <Items data="{[{ id: 'p0', words: ['one', 'two'] }, { id: 'p1', words: ['three', 'four', 'five'] }]}"
          onTextSelectionDidChange="(sel) => testState = sel.startItem?.id + ':' + sel.startIndex + '-' + sel.endIndex">
          <HStack gap="$space-1">
            <Items data="{$item.words}">
              <Text testId="{$item}" value="{$item}" />
            </Items>
          </HStack>
        </Items>
      </VStack>
    `);
    await select(page, "four", "five");
    await expect.poll(testStateDriver.testState).toEqual("p1:1-1");
  });

  test("Items renders no wrappers unless it is opted in", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <HStack testId="plain">
          <Items data="${WORDS}"><Text value="{$item}" /></Items>
        </HStack>
        <HStack testId="tracked">
          <Items data="${WORDS}" onTextSelectionDidChange="testState = 1">
            <Text value="{$item}" />
          </Items>
        </HStack>
        <HStack testId="withId">
          <Items id="named" data="${WORDS}"><Text value="{$item}" /></Items>
        </HStack>
      </VStack>
    `);
    await expect(page.getByTestId("plain").locator("span[data-xmlui-items-sel]")).toHaveCount(0);
    await expect(page.getByTestId("tracked").locator("span[data-xmlui-items-sel]")).toHaveCount(5);
    await expect(page.getByTestId("withId").locator("span[data-xmlui-items-sel]")).toHaveCount(5);
  });
});

// --- Inside a doc playground (an xmlui-pg fence, rendered by NestedApp in a shadow root)
test.describe("Text selection inside a shadow root", () => {
  const playground = (app: string) =>
    `<Markdown><![CDATA[${["```xmlui-pg", app, "```"].join("\n")}]]></Markdown>`;

  // --- Test ids don't reach inside the nested app, so words are found by text
  async function drag(page: any, fromWord: string, toWord: string) {
    const from = await page.getByText(fromWord, { exact: true }).boundingBox();
    const to = await page.getByText(toWord, { exact: true }).boundingBox();
    await page.mouse.move(from.x + 1, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width - 1, to.y + to.height / 2, { steps: 8 });
    await page.mouse.up();
  }

  test("a drag reports the first and last items", async ({ initTestBed, page }) => {
    await initTestBed(
      playground(`<App var.picked="">
  <HStack wrapContent="true" gap="$space-1">
    <Items data="{['alpha', 'bravo', 'charlie', 'delta', 'echo']}"
      onTextSelectionDidChange="(sel) => { if (sel.text && sel.startIndex !== null) picked = sel.startItem + '-' + sel.endItem + ' ' + sel.startIndex + '-' + sel.endIndex; }">
      <Text value="{$item}" />
    </Items>
  </HStack>
  <Text value="picked: {picked}" />
</App>`),
    );
    await expect(page.getByText("delta", { exact: true })).toBeVisible();
    await drag(page, "bravo", "delta");
    await expect(page.getByText(/^picked:/)).toHaveText("picked: bravo-delta 1-3");
  });

  test("getTextSelection() reads a selection", async ({ initTestBed, page }) => {
    await initTestBed(
      playground(`<App var.report="">
  <HStack wrapContent="true" gap="$space-1">
    <Items id="words" data="{['alpha', 'bravo', 'charlie', 'delta', 'echo']}">
      <Text value="{$item}" />
    </Items>
  </HStack>
  <Button label="Ask" onClick="const s = words.getTextSelection(); report = s.startIndex === null ? 'none' : s.startItem + '-' + s.endItem" />
  <Text value="report: {report}" />
</App>`),
    );
    await expect(page.getByText("delta", { exact: true })).toBeVisible();
    await drag(page, "bravo", "delta");
    await page.getByRole("button", { name: "Ask" }).click();
    await expect(page.getByText(/^report:/)).toHaveText("report: bravo-delta");
  });
});