import { expect, test } from "../../testing/fixtures";

test.describe("ExpandableItem foundation", () => {
  test("toggles content from summary click", async ({ initTestBed, page }) => {
    await initTestBed(`<ExpandableItem summary="Details">Hidden content</ExpandableItem>`);

    await expect(page.getByText("Hidden content")).not.toBeVisible();
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByText("Hidden content")).toBeVisible();
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByText("Hidden content")).not.toBeVisible();
  });

  test("expandedChange mutates visible state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.expanded="{false}">
        <ExpandableItem summary="Details" onExpandedChange="value => expanded = value">
          <Text>Hidden content</Text>
        </ExpandableItem>
        <Text testId="state">Expanded: {expanded}</Text>
      </App>
    `);

    await expect(page.getByTestId("state")).toContainText("Expanded: false");
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByTestId("state")).toContainText("Expanded: true");
  });

  test("summary template and content updates work", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ExpandableItem initiallyExpanded="true" var.count="{0}">
        <property name="summary">
          <Text>Templated summary</Text>
        </property>
        <Button testId="increment" onClick="count++">Increment</Button>
        <Text testId="value">Count: {count}</Text>
      </ExpandableItem>
    `);

    await expect(page.getByRole("button", { name: /Templated summary/ })).toBeVisible();
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });

  test("expanded items preserve original border and stack gap", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <VStack gap="space-4">
          <ExpandableItem summary="Default content width (100%)" initiallyExpanded="true">
            <Stack backgroundColor="lightblue" padding="space-3">
              <Text>Content fills the full width</Text>
            </Stack>
          </ExpandableItem>
          <ExpandableItem
            summary="Custom content width (50%)"
            contentWidth="50%"
            initiallyExpanded="true">
            <Stack backgroundColor="lightgreen" padding="space-3">
              <Text>Content is 50% width</Text>
            </Stack>
          </ExpandableItem>
        </VStack>
      </App>
    `);

    const items = page.locator('[data-xmlui-component="ExpandableItem"]');
    await expect(items).toHaveCount(2);

    const first = items.nth(0);
    const second = items.nth(1);
    await expect(first).toHaveCSS("border-bottom-width", "0px");
    await expect(second).toHaveCSS("border-bottom-width", "0px");

    const firstBox = await first.boundingBox();
    const secondBox = await second.boundingBox();
    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();
    expect(secondBox!.y - firstBox!.y - firstBox!.height).toBeCloseTo(16, 0);
  });

  test("rich summary template preserves horizontal layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <VStack gap="space-4">
          <ExpandableItem summary="Simple text summary" initiallyExpanded="true">
            <Text>This expandable item uses a simple text string for its summary.</Text>
          </ExpandableItem>

          <ExpandableItem initiallyExpanded="false">
            <property name="summary">
              <CHStack gap="space-2">
                <Icon name="apps" />
                <Text fontWeight="600">Custom Summary with Icon</Text>
                <Badge label="New" variant="success" />
              </CHStack>
            </property>
            <Text>
              This expandable item uses a rich component
              definition with icons and badges in the summary.
            </Text>
          </ExpandableItem>
        </VStack>
      </App>
    `);

    const summary = page.getByRole("button", { name: /Custom Summary with Icon/ });
    const stack = summary.locator('[data-xmlui-component="CHStack"]');
    const text = stack.locator('[data-xmlui-component="Text"]').filter({
      hasText: "Custom Summary with Icon",
    });
    const badgeLabel = stack.getByText("New").first();

    await expect(stack).toHaveCSS("display", "flex");
    await expect(stack).toHaveCSS("flex-direction", "row");
    await expect(stack).toHaveCSS("gap", "16px");

    const textBox = await text.boundingBox();
    const badgeBox = await badgeLabel.boundingBox();
    const summaryBox = await summary.boundingBox();
    expect(textBox).not.toBeNull();
    expect(badgeBox).not.toBeNull();
    expect(summaryBox).not.toBeNull();
    expect(textBox!.height).toBeLessThan(35);
    expect(badgeBox!.height).toBeLessThan(25);
    expect(badgeBox!.width).toBeGreaterThan(37);
    expect(badgeBox!.x).toBeGreaterThan(textBox!.x + textBox!.width);
    expect(summaryBox!.width).toBeGreaterThan(355);
  });
});
