import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders children content in default slot", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Custom>
        <Button label="Create" />
        <Button label="Edit" />
        <Button label="Delete" />
      </Custom>
    `, {
      components: [
        `
        <Component name="Custom">
          <Card>
            <H3>Use these actions</H3>
            <HStack>
              <Slot />
            </HStack>
          </Card>
        </Component>
        `
      ]
    });

    // Verify all passed children are rendered in the slot
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
    
    // Verify they are within the card structure from the component
    await expect(page.getByText("Use these actions")).toBeVisible();
  });

  test("renders default content when no children provided", async ({ initTestBed, page }) => {
    await initTestBed(`<ActionBar />`, {
      components: [
        `
        <Component name="ActionBar">
          <Card>
            <H3>Use these actions</H3>
            <HStack>
              <Slot>
                <Button label="Default" />
              </Slot>
            </HStack>
          </Card>
        </Component>
        `
      ]
    });

    // Verify default content is rendered when no children provided
    await expect(page.getByRole("button", { name: "Default" })).toBeVisible();
    await expect(page.getByText("Use these actions")).toBeVisible();
  });

  test("overrides default content with provided children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ActionBar>
        <Button label="Custom Button" />
      </ActionBar>
    `, {
      components: [
        `
        <Component name="ActionBar">
          <Card>
            <H3>Use these actions</H3>
            <HStack>
              <Slot>
                <Button label="Default" />
              </Slot>
            </HStack>
          </Card>
        </Component>
        `
      ]
    });

    // Verify provided children override default content
    await expect(page.getByRole("button", { name: "Custom Button" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Default" })).not.toBeVisible();
  });

  test("works with named slots using property template syntax", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ActionBar>
        <property name="headerTemplate">
          <H2>Click one of these actions</H2>
        </property>
        <property name="footerTemplate">
          <Text>Footer content goes here</Text>
        </property>
        <Button label="Create" />
        <Button label="Edit" />
        <Button label="Delete" />
      </ActionBar>
    `, {
      components: [
        `
        <Component name="ActionBar">
          <Card>
            <Slot name="headerTemplate">
              <H3>Use these actions</H3>
            </Slot>
            <HStack>
              <Slot>
                <Button label="Default" />
              </Slot>
            </HStack>
            <Slot name="footerTemplate" />
          </Card>
        </Component>
        `
      ]
    });

    // Verify named slots render their provided content
    await expect(page.getByRole("heading", { name: "Click one of these actions" })).toBeVisible();
    await expect(page.getByText("Footer content goes here")).toBeVisible();
    
    // Verify default header is not shown (overridden by headerTemplate)
    await expect(page.getByRole("heading", { name: "Use these actions" })).not.toBeVisible();
    
    // Verify default slot content (buttons)
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("renders default content for named slots when no template provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ActionBar>
        <Button label="Main Button" />
      </ActionBar>
    `, {
      components: [
        `
        <Component name="ActionBar">
          <Card>
            <Slot name="headerTemplate">
              <H3>Default header</H3>
            </Slot>
            <HStack>
              <Slot />
            </HStack>
            <Slot name="footerTemplate">
              <Text>Default footer</Text>
            </Slot>
          </Card>
        </Component>
        `
      ]
    });

    // Verify default content for named slots is rendered
    await expect(page.getByRole("heading", { name: "Default header" })).toBeVisible();
    await expect(page.getByText("Default footer")).toBeVisible();
    
    // Verify main slot content
    await expect(page.getByRole("button", { name: "Main Button" })).toBeVisible();
  });

  test("supports template properties with context variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ActionBar header="Action Bar Example">
        <property name="headerTemplate">
          <Text variant="title">{$processedHeader}</Text>
        </property>
        <Button label="Create" />
        <Button label="Edit" />
        <Button label="Delete" />
      </ActionBar>
    `, {
      components: [
        `
        <Component name="ActionBar">
          <Card var.transformedHeader="*** {$props.header.toUpperCase()} ***">
            <Slot name="headerTemplate" processedHeader="{transformedHeader}">
              <H3>{transformedHeader}</H3>
            </Slot>
            <HStack>
              <Slot>
                <Button label="Default" />
              </Slot>
            </HStack>
          </Card>
        </Component>
        `
      ]
    });

    // Verify template property is processed and passed to slot template
    await expect(page.getByText("*** ACTION BAR EXAMPLE ***")).toBeVisible();
    
    // Verify main slot content
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("works with multiple context variables in template properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DataDisplay>
        <property name="contentTemplate">
          <Text>{$title}: {$value}</Text>
        </property>
      </DataDisplay>
    `, {
      components: [
        `
        <Component name="DataDisplay">
          <Slot name="contentTemplate" title="Score" value="{42}">
            <Text>No data available</Text>
          </Slot>
        </Component>
        `
      ]
    });

    // Verify multiple context variables work
    await expect(page.getByText("Score: 42")).toBeVisible();
    await expect(page.getByText("No data available")).not.toBeVisible();
  });

  test("supports complex nested content in slots", async ({ initTestBed, page }) => {
    await initTestBed(`
      <CustomCard>
        <property name="headerTemplate">
          <HStack>
            <Icon name="star" />
            <Text fontWeight="bold">Custom Header</Text>
          </HStack>
        </property>
        <VStack>
          <Text>Line 1</Text>
          <Text>Line 2</Text>
          <Button label="Action" />
        </VStack>
      </CustomCard>
    `, {
      components: [
        `
        <Component name="CustomCard">
          <Card>
            <Slot name="headerTemplate">
              <H3>Default Header</H3>
            </Slot>
            <ContentSeparator />
            <Slot />
          </Card>
        </Component>
        `
      ]
    });

    // Verify complex nested content renders correctly
    await expect(page.getByText("Custom Header")).toBeVisible();
    await expect(page.getByText("Line 1")).toBeVisible();
    await expect(page.getByText("Line 2")).toBeVisible();
    await expect(page.getByRole("button", { name: "Action" })).toBeVisible();
    
    // Verify default header is not shown
    await expect(page.getByRole("heading", { name: "Default Header" })).not.toBeVisible();
  });

  test("maintains proper rendering order with multiple slots", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MultiSlotComponent>
        <property name="topTemplate">
          <Text testId="top">Top Content</Text>
        </property>
        <property name="bottomTemplate">
          <Text testId="bottom">Bottom Content</Text>
        </property>
        <Text testId="middle">Middle Content</Text>
      </MultiSlotComponent>
    `, {
      components: [
        `
        <Component name="MultiSlotComponent">
          <VStack>
            <Slot name="topTemplate" />
            <Slot />
            <Slot name="bottomTemplate" />
          </VStack>
        </Component>
        `
      ]
    });

    // Verify all content is rendered
    await expect(page.getByTestId("top")).toBeVisible();
    await expect(page.getByTestId("middle")).toBeVisible();
    await expect(page.getByTestId("bottom")).toBeVisible();
    
    // Verify rendering order by checking positions
    const topElement = page.getByTestId("top");
    const middleElement = page.getByTestId("middle");
    const bottomElement = page.getByTestId("bottom");
    
    const topBox = await topElement.boundingBox();
    const middleBox = await middleElement.boundingBox();
    const bottomBox = await bottomElement.boundingBox();
    
    expect(topBox?.y).toBeLessThan(middleBox?.y || 0);
    expect(middleBox?.y).toBeLessThan(bottomBox?.y || 0);
  });

  test("works with dynamic context in template properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ContextComponent>
        <property name="messageTemplate">
          <Text>{$message}</Text>
        </property>
      </ContextComponent>
    `, {
      components: [
        `
        <Component name="ContextComponent" var.currentMessage="Initial Message">
          <VStack>
            <Button label="Update Message" onClick="currentMessage = 'Updated Message'" />
            <Slot name="messageTemplate" message="{currentMessage}">
              <Text>No message</Text>
            </Slot>
          </VStack>
        </Component>
        `
      ]
    });

    // Verify initial context value
    await expect(page.getByText("Initial Message")).toBeVisible();
    
    // Update the context and verify template updates
    await page.getByRole("button", { name: "Update Message" }).click();
    await expect(page.getByText("Updated Message")).toBeVisible();
    await expect(page.getByText("Initial Message")).not.toBeVisible();
  });

  test("handles empty slots gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <EmptySlotComponent>
      </EmptySlotComponent>
    `, {
      components: [
        `
        <Component name="EmptySlotComponent">
          <Card>
            <Text>Before slot</Text>
            <Slot />
            <Text>After slot</Text>
          </Card>
        </Component>
        `
      ]
    });

    // Verify component renders without errors when slot is empty
    await expect(page.getByText("Before slot")).toBeVisible();
    await expect(page.getByText("After slot")).toBeVisible();
  });

  test("supports slot with no default content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MinimalComponent>
        <Text>Provided content</Text>
      </MinimalComponent>
    `, {
      components: [
        `
        <Component name="MinimalComponent">
          <VStack>
            <Text>Component content</Text>
            <Slot name="contentTemplate" />
            <Slot />
          </VStack>
        </Component>
        `
      ]
    });

    // Verify provided content renders in default slot
    await expect(page.getByText("Provided content")).toBeVisible();
    
    // Verify component structure renders without errors
    await expect(page.getByText("Component content")).toBeVisible();
  });
});
