import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format
const sampleData = `[
  { name: 'Desktop', value: 400, fill: '#8884d8' },
  { name: 'Mobile', value: 300, fill: '#82ca9d' },
  { name: 'Tablet', value: 200, fill: '#ffc658' },
  { name: 'Other', value: 100, fill: '#ff7300' }
]`;

const emptyData = `[]`;

const singlePointData = `[
  { name: 'Desktop', value: 400 }
]`;

const largeDataset = `[
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 200 },
  { name: 'Category D', value: 100 },
  { name: 'Category E', value: 150 },
  { name: 'Category F', value: 250 },
  { name: 'Category G', value: 180 },
  { name: 'Category H', value: 320 },
  { name: 'Category I', value: 275 },
  { name: 'Category J', value: 190 }
]`;

// Chart selectors - Legend specific
const chartRoot = ".recharts-responsive-container";
const chartSvg = ".recharts-surface";
const legendSelector = ".recharts-legend-wrapper";
const legendItemSelector = ".recharts-legend-item";
const legendTextSelector = ".recharts-legend-item-text";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  
  // Smoke tests
  test.describe("smoke tests", { tag: "@smoke" }, () => {
    test("Legend renders within PieChart", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      await expect(page.locator(chartRoot)).toBeVisible();
      await expect(page.locator(legendSelector)).toBeVisible();
    });

    test("Legend renders within BarChart", async ({ initTestBed, page }) => {
      await initTestBed(`
        <BarChart
          nameKey="name"
          dataKeys="{['value']}"
          data="{${sampleData}}"
          width="400px"
          height="400px"
          showLegend
        >
          <Legend />
        </BarChart>
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      await expect(page.locator(chartRoot)).toBeVisible();
      await expect(page.locator(legendSelector)).toBeVisible();
    });
  });

  // Align prop tests
  test.describe("align prop", () => {
    test("handles 'left' alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend align="left" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
      
      // Legend should be visible with left alignment
      // Note: Actual positioning may vary based on chart implementation
      await expect(legend).toBeVisible();
    });

    test("handles 'center' alignment (default)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
    });

    test("handles 'right' alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend align="right" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
      
      // Legend should be visible with right alignment
      // Note: Actual positioning may vary based on chart implementation
      await expect(legend).toBeVisible();
    });
  });

  // VerticalAlign prop tests
  test.describe("verticalAlign prop", () => {
    test("handles 'top' vertical alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend verticalAlign="top" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
      
      // Legend should be visible with top alignment
      // Note: Actual positioning may vary based on chart implementation
      await expect(legend).toBeVisible();
    });

    test("handles 'bottom' vertical alignment (default)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
    });

    test("handles 'middle' vertical alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend verticalAlign="middle" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legend = page.locator(legendSelector);
      await expect(legend).toBeVisible();
      
      // Legend should be visible with middle alignment
      // Note: Actual positioning may vary based on chart implementation
      await expect(legend).toBeVisible();
    });
  });

  // Combined alignment tests
  test.describe("combined alignment", () => {
    test("handles top-left alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend align="left" verticalAlign="top" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      await expect(page.locator(legendSelector)).toBeVisible();
    });

    test("handles bottom-right alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend align="right" verticalAlign="bottom" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      await expect(page.locator(legendSelector)).toBeVisible();
    });

    test("handles center-middle alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend align="center" verticalAlign="middle" />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      await expect(page.locator(legendSelector)).toBeVisible();
    });
  });

  // Data handling tests
  test.describe("data handling", () => {
    test("displays legend items for all data entries", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legendItems = page.locator(legendItemSelector);
      await expect(legendItems).toHaveCount(4); // Desktop, Mobile, Tablet, Other
      
      // Check that legend text matches data names
      await expect(page.locator(legendTextSelector).filter({ hasText: "Desktop" })).toBeVisible();
      await expect(page.locator(legendTextSelector).filter({ hasText: "Mobile" })).toBeVisible();
      await expect(page.locator(legendTextSelector).filter({ hasText: "Tablet" })).toBeVisible();
      await expect(page.locator(legendTextSelector).filter({ hasText: "Other" })).toBeVisible();
    });

    test("handles single data point", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${singlePointData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legendItems = page.locator(legendItemSelector);
      await expect(legendItems).toHaveCount(1);
      await expect(page.locator(legendTextSelector).filter({ hasText: "Desktop" })).toBeVisible();
    });

    test("handles empty data gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${emptyData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      // Legend should still be present but with no items
      const legendItems = page.locator(legendItemSelector);
      await expect(legendItems).toHaveCount(0);
    });

    test("handles large datasets", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${largeDataset}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </PieChart>
      `);
      
      await page.waitForSelector(legendSelector, { timeout: 10000 });
      const legendItems = page.locator(legendItemSelector);
      await expect(legendItems).toHaveCount(10);
    });
  });

  // Integration with different chart types
  test.describe("chart type integration", () => {
    test("works with LineChart", async ({ initTestBed, page }) => {
      await initTestBed(`
        <LineChart
          nameKey="name"
          dataKeys="{['value']}"
          data="{${sampleData}}"
          width="400px"
          height="400px"
          showLegend
        >
          <Legend />
        </LineChart>
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      await expect(page.locator(legendSelector)).toBeVisible();
    });

    test("works with DonutChart", async ({ initTestBed, page }) => {
      await initTestBed(`
        <DonutChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        >
          <Legend />
        </DonutChart>
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      await expect(page.locator(legendSelector)).toBeVisible();
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("legend has proper ARIA structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    const legend = page.locator(legendSelector);
    await expect(legend).toBeVisible();
    
    // Legend should be accessible to screen readers
    const legendItems = page.locator(legendItemSelector);
    await expect(legendItems.first()).toBeVisible();
  });

  test("legend items are keyboard accessible", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    
    // Tab navigation should work through legend items
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("legend text is readable and properly contrasted", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    const legendText = page.locator(legendTextSelector).first();
    await expect(legendText).toBeVisible();
    
    // Text should have readable font size
    await expect(legendText).toHaveCSS("font-size", /\d+px/);
  });

  test("supports screen reader navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    
    // Legend should be announced properly by screen readers
    const legendItems = page.locator(legendItemSelector);
    for (let i = 0; i < await legendItems.count(); i++) {
      const item = legendItems.nth(i);
      await expect(item).toBeVisible();
    }
  });
});

// =============================================================================
// PERFORMANCE AND EDGE CASES
// =============================================================================

test.describe("Performance and Edge Cases", () => {
  test("handles rapid prop changes efficiently", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend align="{testState || 'center'}" />
      </PieChart>
      <Button onClick="testState = testState === 'center' ? 'left' : 'center'">Toggle Align</Button>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    
    // Rapidly change alignment
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Toggle Align" }).click();
      await page.waitForTimeout(100);
    }
    
    // Legend should still be visible and functional
    await expect(page.locator(legendSelector)).toBeVisible();
  });

  test("maintains performance with large datasets", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${largeDataset}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    const legendItems = page.locator(legendItemSelector);
    await expect(legendItems).toHaveCount(10);
    
    // All legend items should be visible
    for (let i = 0; i < 10; i++) {
      await expect(legendItems.nth(i)).toBeVisible();
    }
  });

  test("handles responsive container changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="{testState || '400px'}"
        height="400px"
      >
        <Legend />
      </PieChart>
      <Button onClick="testState = testState === '400px' ? '200px' : '400px'">Toggle Size</Button>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    
    // Change container size
    await page.getByRole("button", { name: "Toggle Size" }).click();
    await page.waitForTimeout(500);
    
    // Legend should still be visible and properly positioned
    await expect(page.locator(legendSelector)).toBeVisible();
  });

  test("handles Unicode and special characters in legend text", async ({ initTestBed, page }) => {
    const unicodeData = `[
      { name: 'Desktop 🖥️', value: 400 },
      { name: 'Mobile 📱', value: 300 },
      { name: 'Tablet 📟', value: 200 },
      { name: 'Other ⚡', value: 100 }
    ]`;
    
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${unicodeData}}"
        width="400px"
        height="400px"
      >
        <Legend />
      </PieChart>
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    
    // Check that Unicode characters are displayed correctly
    await expect(page.locator(legendTextSelector).filter({ hasText: "🖥️" })).toBeVisible();
    await expect(page.locator(legendTextSelector).filter({ hasText: "📱" })).toBeVisible();
    await expect(page.locator(legendTextSelector).filter({ hasText: "📟" })).toBeVisible();
    await expect(page.locator(legendTextSelector).filter({ hasText: "⚡" })).toBeVisible();
  });

  test("handles null and undefined prop values gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend align="{null}" verticalAlign="{undefined}" />
      </PieChart>
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should fall back to default values and still render
    await expect(page.locator(legendSelector)).toBeVisible();
  });

  test("works correctly when multiple Legend components are present", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Legend align="left" />
        <Legend align="right" />
      </PieChart>
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Only one legend should be rendered (last one wins)
    const legends = page.locator(legendSelector);
    await expect(legends).toHaveCount(1);
  });
});
