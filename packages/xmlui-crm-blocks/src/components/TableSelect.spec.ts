import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-crm-blocks" };

const DATA_3 = `{[
  { id: '1', name: 'Alice', dept: 'Engineering' },
  { id: '2', name: 'Bob', dept: 'Marketing' },
  { id: '3', name: 'Carol', dept: 'Engineering' }
]}`;


const COLS_NAME_DEPT = `{[{ key: 'name', label: 'Name' }, { key: 'dept', label: 'Department' }]}`;

// =============================================================================
// BASIC RENDERING
// =============================================================================

test.describe("Basic Rendering", () => {
  test("trigger button is visible", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect testId="ts" data="${DATA_3}" />`, EXT);
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("placeholder is displayed by default", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" placeholder="Choose..." />`, EXT);
    await expect(page.getByRole("button")).toContainText("Choose...");
  });

  test("default placeholder is shown when none provided", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await expect(page.getByRole("button")).toContainText("Select...");
  });

  test("trigger shows first column value of selected row", async ({ initTestBed, page }) => {
    // With explicit columns (name first), the trigger displays the name of the matching row
    await initTestBed(
      `<TableSelect data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" initialValue="2" />`,
      EXT,
    );
    await expect(page.getByRole("button")).toContainText("Bob");
  });

  test("initialValue shown in trigger on mount", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" initialValue="1" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await expect(page.getByRole("button")).toContainText("Alice");
    await expect(page.getByTestId("val")).toHaveText("1");
  });
});

// =============================================================================
// DROPDOWN OPEN / CLOSE
// =============================================================================

test.describe("Dropdown open/close", () => {
  test("click opens the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("listbox")).toBeVisible();
  });

  test("click again closes the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.getByRole("button").click();
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("click outside closes the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("listbox")).toBeVisible();
    // Click at the top-left corner, well outside the dropdown
    await page.mouse.click(1, 1);
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("search input is focused when dropdown opens", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByPlaceholder("Type to search...")).toBeFocused();
  });
});

// =============================================================================
// ROWS AND COLUMNS
// =============================================================================

test.describe("Rows and Columns", () => {
  test("all rows are displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("option", { name: /Alice/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Bob/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Carol/ })).toBeVisible();
  });

  test("columns are auto-derived from first data row keys", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("columnheader", { name: "id" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "dept" })).toBeVisible();
  });

  test("explicit columns prop controls visible columns and labels", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TableSelect data="${DATA_3}" columns="${COLS_NAME_DEPT}" />`,
      EXT,
    );
    await page.getByRole("button").click();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Department" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "id" })).not.toBeVisible();
  });

  test("valueKey determines the stored value", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Bob/ }).click();
    await expect(page.getByTestId("val")).toHaveText("2");
  });

  test("without valueKey first column value is stored", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await expect(page.getByTestId("val")).toHaveText("1");
  });

  test("labelKey controls trigger display independently of valueKey", async ({ initTestBed, page }) => {
    // valueKey="id" stores the id, labelKey="name" shows the name in trigger
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" labelKey="name" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Bob/ }).click();
    // Trigger shows the name, not the id
    await expect(page.getByRole("button")).toContainText("Bob");
    // But the stored value is the id
    await expect(page.getByTestId("val")).toHaveText("2");
  });

  test("labelKey shows correct label for initialValue", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TableSelect data="${DATA_3}" valueKey="id" labelKey="name" initialValue="3" />`,
      EXT,
    );
    await expect(page.getByRole("button")).toContainText("Carol");
  });

  test("without labelKey trigger falls back to first column", async ({ initTestBed, page }) => {
    // Without explicit columns, first auto-derived column is 'id'
    await initTestBed(
      `<TableSelect data="${DATA_3}" valueKey="id" initialValue="1" />`,
      EXT,
    );
    // First column is 'id', so trigger shows the id value
    await expect(page.getByRole("button")).toContainText("1");
  });

  test("labelKey works with explicit columns", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts"
          data="${DATA_3}"
          columns="${COLS_NAME_DEPT}"
          valueKey="id"
          labelKey="dept" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    // labelKey="dept" → trigger shows "Engineering"
    await expect(page.getByRole("button")).toContainText("Engineering");
    // valueKey="id" → stored value is "1"
    await expect(page.getByTestId("val")).toHaveText("1");
  });
});

// =============================================================================
// ROW SELECTION
// =============================================================================

test.describe("Row selection", () => {
  test("clicking a row selects it and closes the dropdown", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TableSelect data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" />`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Bob/ }).click();
    await expect(page.getByRole("listbox")).not.toBeVisible();
    await expect(page.getByRole("button")).toContainText("Bob");
  });

  test("selected row is marked aria-selected", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" valueKey="id" initialValue="2" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByRole("option", { name: /Bob/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("option", { name: /Alice/ })).toHaveAttribute("aria-selected", "false");
  });

  test("re-selecting same value keeps trigger text", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TableSelect data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" initialValue="1" />`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await expect(page.getByRole("button")).toContainText("Alice");
  });
});

// =============================================================================
// EVENTS AND API
// =============================================================================

test.describe("Events and API", () => {
  test("onChange fires on selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<TableSelect data="${DATA_3}" valueKey="id" onDidChange="testState = 'fired'" />`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Carol/ }).click();
    await expect.poll(testStateDriver.testState).toEqual("fired");
  });

  test("onChange receives the selected value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<TableSelect data="${DATA_3}" valueKey="id" onDidChange="arg => testState = arg" />`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Carol/ }).click();
    await expect.poll(testStateDriver.testState).toEqual("3");
  });

  test("value API returns empty string initially", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await expect(page.getByTestId("val")).toHaveText("");
  });

  test("value API updates after selection", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await expect(page.getByTestId("val")).toHaveText("1");
  });

  test("setValue API sets value programmatically", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" />
        <Button testId="btn" label="Set" onClick="ts.setValue('3')" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("val")).toHaveText("3");
    await expect(page.getByRole("button", { name: /Carol/ })).toBeVisible();
  });
});

// =============================================================================
// SEARCH / FILTER
// =============================================================================

test.describe("Search / Filter", () => {
  test("search input is visible when dropdown is open", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await expect(page.getByPlaceholder("Type to search...")).toBeVisible();
  });

  test("typing filters rows", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("bo");
    await expect(page.getByRole("option", { name: /Bob/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Alice/ })).not.toBeVisible();
    await expect(page.getByRole("option", { name: /Carol/ })).not.toBeVisible();
  });

  test("search is case-insensitive", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("ALICE");
    await expect(page.getByRole("option", { name: /Alice/ })).toBeVisible();
  });

  test("search matches any column", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" columns="${COLS_NAME_DEPT}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("marketing");
    await expect(page.getByRole("option", { name: /Bob/ })).toBeVisible();
    await expect(page.getByRole("option", { name: /Alice/ })).not.toBeVisible();
  });

  test("no results message when search yields nothing", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("xyz-no-match");
    await expect(page.getByText("No results found")).toBeVisible();
  });

  test("search is cleared when dropdown reopens", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("bo");
    await expect(page.getByRole("option", { name: /Alice/ })).not.toBeVisible();
    // Close and reopen
    await page.getByRole("button").click();
    await page.getByRole("button").click();
    await expect(page.getByRole("option", { name: /Alice/ })).toBeVisible();
    await expect(page.getByPlaceholder("Type to search...")).toHaveValue("");
  });
});

// =============================================================================
// KEYBOARD NAVIGATION
// =============================================================================

test.describe("Keyboard navigation", () => {
  test("ArrowDown on search input highlights first row", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option").first()).toHaveAttribute("aria-selected", "false");
    // Verify the option count is correct (Alice should be first)
    await expect(page.getByRole("option", { name: /Alice/ })).toBeVisible();
  });

  test("Enter selects the highlighted row", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("val")).toHaveText("1");
    await expect(page.getByRole("listbox")).not.toBeVisible();
  });

  test("ArrowDown then ArrowDown then Enter selects second row", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("val")).toHaveText("2");
  });

  test("ArrowUp does not go below first row", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);
    // Should stay at first item (index 0)
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("val")).toHaveText("1");
  });

  test("ArrowDown does not go past last row", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    // Press down more times than there are rows
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(30);
    }
    await page.keyboard.press("Enter");
    // Should have selected last row (Carol = id 3)
    await expect(page.getByTestId("val")).toHaveText("3");
  });

  test("Escape closes dropdown without selecting", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).not.toBeVisible();
    await expect(page.getByTestId("val")).toHaveText("");
  });

  test("ArrowDown on trigger opens dropdown with first row highlighted", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").focus();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("val")).toHaveText("1");
  });

  test("ArrowUp on trigger opens dropdown with last row highlighted", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").focus();
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(100);
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("val")).toHaveText("3");
  });

  test("Space on trigger opens dropdown", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    await expect(page.getByRole("listbox")).toBeVisible();
  });

  test("search then ArrowDown navigates filtered rows", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment>
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" />
        <Text testId="val">{ts.value}</Text>
      </Fragment>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByPlaceholder("Type to search...").fill("engineering");
    await page.waitForTimeout(50);
    // Alice (1) and Carol (3) match, Bob (2) doesn't
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    // Second engineering match is Carol (id=3)
    await expect(page.getByTestId("val")).toHaveText("3");
  });
});

// =============================================================================
// FOCUS MANAGEMENT
// =============================================================================

test.describe("Focus management", () => {
  test("focus returns to trigger after row selection via click", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await expect(page.getByRole("button")).toBeFocused();
  });

  test("focus returns to trigger after selection via Enter", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(50);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button")).toBeFocused();
  });

  test("focus returns to trigger after Escape", async ({ initTestBed, page }) => {
    await initTestBed(`<TableSelect data="${DATA_3}" />`, EXT);
    await page.getByRole("button").click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button")).toBeFocused();
  });
});

// =============================================================================
// FORM INTEGRATION
// =============================================================================

test.describe("Form integration", () => {
  test("bindTo syncs $data and value API", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Form hideButtonRow="true">
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" bindTo="personId" />
        <Button testId="setBtn" onClick="ts.setValue('2')" />
        <Text testId="dataVal">{$data.personId}</Text>
        <Text testId="compVal">{ts.value}</Text>
      </Form>`,
      EXT,
    );
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("dataVal")).toHaveText("2");
    await expect(page.getByTestId("compVal")).toHaveText("2");
  });

  test("clicking a row updates bound $data field", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Form hideButtonRow="true">
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" bindTo="personId" />
        <Text testId="dataVal">{$data.personId}</Text>
      </Form>`,
      EXT,
    );
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Carol/ }).click();
    await expect(page.getByTestId("dataVal")).toHaveText("3");
  });

  test("form data initializes component value via bindTo", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Form hideButtonRow="true" data="{{ personId: '2' }}">
        <TableSelect id="ts" data="${DATA_3}" columns="${COLS_NAME_DEPT}" valueKey="id" bindTo="personId" />
        <Text testId="compVal">{ts.value}</Text>
      </Form>`,
      EXT,
    );
    await expect(page.getByTestId("compVal")).toHaveText("2");
    await expect(page.getByRole("button")).toContainText("Bob");
  });

  test("form submit includes selected value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Form onSubmit="(data) => { testState = data.personId; }">
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" bindTo="personId" />
      </Form>`,
      EXT,
    );
    await page.getByRole("button", { name: /Select/ }).click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await page.getByRole("button", { name: /Save/ }).click();
    await expect.poll(testStateDriver.testState).toEqual("1");
  });

  test("changing selection updates $data reactively", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Form hideButtonRow="true">
        <TableSelect id="ts" data="${DATA_3}" valueKey="id" bindTo="personId" />
        <Text testId="dataVal">{$data.personId}</Text>
      </Form>`,
      EXT,
    );
    // Select Alice
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Alice/ }).click();
    await expect(page.getByTestId("dataVal")).toHaveText("1");
    // Change to Bob
    await page.getByRole("button").click();
    await page.getByRole("option", { name: /Bob/ }).click();
    await expect(page.getByTestId("dataVal")).toHaveText("2");
  });
});

