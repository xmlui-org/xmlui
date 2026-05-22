import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";
import { SKIP_REASON } from "../../src/testing/component-test-helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/markup.md"),
);

// display-only example — no interaction to test
test.describe("A literal property", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "A literal property");

  test("renders the literal text value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is rendered as text.")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("A dynamic property", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "A dynamic property");

  test("evaluates the expression and shows 42", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Life, the universe, and everything: 42/)).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("A JSON list", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "A JSON list");

  test("renders all three tube line names", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Bakerloo")).toBeVisible();
    await expect(page.getByText("Central")).toBeVisible();
    await expect(page.getByText("Circle")).toBeVisible();
  });
});

test.describe("A complex JSON object", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "A complex JSON object",
  );

  test("initial state shows the station search form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Search for station amenities")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("submitting form with a station name shows it in the output", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').fill("Liverpool");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.locator("textarea")).toContainText("Liverpool");
  });
});

// display-only example — no interaction to test
test.describe("Declaring a variable with var", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declaring a variable with var",
  );

  test("renders all three tube line names from the var declaration", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Bakerloo")).toBeVisible();
    await expect(page.getByText("Central")).toBeVisible();
    await expect(page.getByText("Circle")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Declaring a variable with <variable>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declaring a variable with <variable>",
  );

  test("renders all three tube line names from the variable tag", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Bakerloo")).toBeVisible();
    await expect(page.getByText("Central")).toBeVisible();
    await expect(page.getByText("Circle")).toBeVisible();
  });
});

test.describe("A variable follows until reassigned", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "A variable follows until reassigned",
  );

  test("initial state shows source and mirror both at 0", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("source = 0")).toBeVisible();
    await expect(page.getByText("mirror = 0")).toBeVisible();
  });

  test("incrementing source also updates mirror when mirror is still reactive", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Increment source" }).click();
    await expect(page.getByText("source = 1")).toBeVisible();
    await expect(page.getByText("mirror = 1")).toBeVisible();
  });

  test("overriding mirror decouples it from source", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Override mirror" }).click();
    await expect(page.getByText("mirror = 999")).toBeVisible();
    // Incrementing source no longer changes mirror
    await page.getByRole("button", { name: "Increment source" }).click();
    await expect(page.getByText("source = 1")).toBeVisible();
    await expect(page.getByText("mirror = 999")).toBeVisible();
  });
});

test.describe("Snapshot decouples from DataSource after assignment", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Snapshot decouples from DataSource after assignment",
  );

  test("initial state shows 4 items in both DataSource and items list", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("DataSource count: 4")).toBeVisible();
    await expect(page.getByText("items count: 4")).toBeVisible();
    await expect(page.getByText("Anna")).toBeVisible();
    await expect(page.getByText("Helga")).toBeVisible();
  });

  test.skip(
    "taking snapshot filters items to active only while DataSource stays reactive",
    SKIP_REASON.TEST_NOT_WORKING(
      "The 'Take snapshot of active items' button's onClick handler is not executing",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      const snapshotButton = page.getByRole("button", { name: "Take snapshot of active items" });
      await snapshotButton.focus();
      await snapshotButton.click({ force: true });
      // Items list shows only active members (Anna, Bob)
      await expect
        .poll(async () => await page.getByText("items count: 2").isVisible(), { timeout: 20000 })
        .toBe(true);
      await expect(page.getByText("Anna")).toBeVisible();
      await expect(page.getByText("Bob")).toBeVisible();
      await expect(page.getByText("Helga")).not.toBeVisible();
    },
  );

  test.skip(
    "adding an item updates DataSource count but items snapshot stays frozen",
    SKIP_REASON.TEST_NOT_WORKING("The 'Add active item' button's onClick handler is not executing"),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor });
      const snapshotButton = page.getByRole("button", { name: "Take snapshot of active items" });
      await snapshotButton.focus();
      await snapshotButton.click({ force: true });
      await expect
        .poll(async () => await page.getByText("items count: 2").isVisible(), { timeout: 20000 })
        .toBe(true);
      const addButton = page.getByRole("button", { name: "Add active item" });
      await addButton.focus();
      await addButton.click({ force: true });
      // DataSource count increases but snapshot remains at 2
      await expect
        .poll(async () => await page.getByText("DataSource count: 5").isVisible(), {
          timeout: 20000,
        })
        .toBe(true);
      await expect(page.getByText("items count: 2")).toBeVisible();
    },
  );
});

test.describe("Keeping reactivity with a separate override variable", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Keeping reactivity with a separate override variable",
  );

  test("initial state shows all 4 items with count of 4", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Visible count: 4")).toBeVisible();
    await expect(page.getByText("Anna")).toBeVisible();
    await expect(page.getByText("Helga")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText("John")).toBeVisible();
  });

  test("toggling active filter shows only active items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Toggle active filter" }).click();
    await expect(page.getByText("Visible count: 2")).toBeVisible();
    await expect(page.getByText("Anna")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText("Helga")).not.toBeVisible();
    await expect(page.getByText("John")).not.toBeVisible();
  });

  test("adding an item stays reactive after toggling filter", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Add active item" }).click();
    await expect(page.getByText("Visible count: 5")).toBeVisible();
    await expect(page.getByText("Frank")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Defining and using nested variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Defining and using nested variables",
  );

  test("inner scope shadows outer scope variable", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Hello, from App/)).toBeVisible();
    await expect(page.getByText(/Hello, from VStack/)).toBeVisible();
  });
});

test.describe("Isolated component instances", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Isolated component instances",
  );

  test("initial state shows two counter instances both starting at 0", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Counter Instance 1")).toBeVisible();
    await expect(page.getByText("Counter Instance 2")).toBeVisible();
    await expect(page.getByText("Counter ID: 1")).toBeVisible();
    await expect(page.getByText("Counter ID: 2")).toBeVisible();
    // Both start at count 0
    const countTexts = page.getByText("Count: 0");
    await expect(countTexts.first()).toBeVisible();
  });

  test("incrementing first counter does not affect second counter", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Click the first increment button
    await page
      .getByRole("button", { name: /Increment/ })
      .first()
      .click();
    await expect(page.getByText("Count: 1")).toBeVisible();
    await expect(page.getByText("Count: 0")).toBeVisible();
  });
});

test.describe("Defining and using reactive variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Defining and using reactive variables",
  );

  test("initial state shows count 0 and countTimes3 0", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Click count = 0 (changes directly)")).toBeVisible();
    await expect(page.getByText("Click count * 3 = 0 (changes indirectly)")).toBeVisible();
  });

  test("clicking increment updates both count directly and countTimes3 reactively", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Click to increment the count" }).click();
    await expect(page.getByText("Click count = 1 (changes directly)")).toBeVisible();
    await expect(page.getByText("Click count * 3 = 3 (changes indirectly)")).toBeVisible();
  });
});

test.describe("Declare an event handler using the <event> tag", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declare an event handler using the <event> tag",
  );

  test("renders button with initial click count of 0", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: /Click me! Click count = 0/ })).toBeVisible();
  });

  test("clicking the button increments the count in its label", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: /Click me! Click count = 0/ }).click();
    await expect(page.getByRole("button", { name: /Click me! Click count = 1/ })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Declaring a global variable with global", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declaring a global variable with global",
  );

  test("renders Station List heading and all three lines accessible from child component", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await expect(page.getByText("Station List")).toBeVisible();
    await expect(page.getByText(/Bakerloo/)).toBeVisible();
    await expect(page.getByText(/Central/)).toBeVisible();
    await expect(page.getByText(/Circle/)).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Declaring a global variable with <global>", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declaring a global variable with <global>",
  );

  test("renders Station List heading and all three lines accessible from child component", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await expect(page.getByText("Station List")).toBeVisible();
    await expect(page.getByText(/Bakerloo/)).toBeVisible();
    await expect(page.getByText(/Central/)).toBeVisible();
    await expect(page.getByText(/Circle/)).toBeVisible();
  });
});
