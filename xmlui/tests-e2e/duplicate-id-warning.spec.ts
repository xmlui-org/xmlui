import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// E2E tests: duplicate component id warning
// When two or more components in the same markup share the same id value, a
// console.warn is emitted (in the Node.js test process) during markup parsing.
// In the vite-xmlui-plugin the warnings appear via this.warn(); in StandaloneApp
// they are displayed using console.group + console.warn just like lint warnings.
// =============================================================================

/**
 * Intercept Node.js console.warn during initTestBed and return the captured messages.
 * The returned array is populated synchronously by the time initTestBed resolves.
 */
function captureNodeWarnings(
  block: (warnings: string[]) => Promise<void>,
): Promise<string[]> {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    warnings.push(String(args[0]));
    originalWarn(...args);
  };
  return block(warnings).finally(() => {
    console.warn = originalWarn;
  }).then(() => warnings);
}

test.describe("Duplicate component id — console warning", () => {
  test("emits no warning when all ids are unique", async ({ initTestBed, page }) => {
    const warnings = await captureNodeWarnings(async () => {
      await initTestBed(`
        <Fragment>
          <Text id="a" testId="a">A</Text>
          <Text id="b" testId="b">B</Text>
        </Fragment>
      `);
      await expect(page.getByTestId("a")).toBeVisible();
    });
    // The console.group header for the warning block starts with "[xmlui] Warnings in"
    expect(warnings.filter((w) => w.includes("[xmlui] Warnings in"))).toHaveLength(0);
  });

  test("emits a warning group when two sibling components share an id", async ({
    initTestBed,
    page,
  }) => {
    const warnings = await captureNodeWarnings(async () => {
      await initTestBed(`
        <Fragment>
          <Text id="dup" testId="first">First</Text>
          <Text id="dup" testId="second">Second</Text>
        </Fragment>
      `);
      await expect(page.getByTestId("first")).toBeVisible();
    });
    // The individual warning message is emitted via console.warn
    expect(warnings.some((w) => w.includes("dup") && w.includes("Duplicate"))).toBe(true);
  });

  test("warning message contains the duplicated id value", async ({ initTestBed, page }) => {
    const warnings = await captureNodeWarnings(async () => {
      await initTestBed(`
        <Fragment>
          <Text id="my-unique-id" testId="t1">First</Text>
          <Button id="my-unique-id" testId="t2">Second</Button>
        </Fragment>
      `);
      await expect(page.getByTestId("t1")).toBeVisible();
    });
    expect(warnings.some((w) => w.includes("my-unique-id"))).toBe(true);
  });

  test("emits a warning for each extra occurrence beyond the first", async ({
    initTestBed,
    page,
  }) => {
    const warnings = await captureNodeWarnings(async () => {
      await initTestBed(`
        <Fragment>
          <Text id="triple" testId="t1">One</Text>
          <Text id="triple" testId="t2">Two</Text>
          <Text id="triple" testId="t3">Three</Text>
        </Fragment>
      `);
      await expect(page.getByTestId("t1")).toBeVisible();
    });
    // Second and third occurrences each emit one warning message
    expect(
      warnings.filter((w) => w.includes("triple") && w.includes("Duplicate")),
    ).toHaveLength(2);
  });

  test("emits a warning when a nested component duplicates an ancestor id", async ({
    initTestBed,
    page,
  }) => {
    const warnings = await captureNodeWarnings(async () => {
      await initTestBed(`
        <VStack id="container" testId="outer">
          <Text id="container" testId="inner">Duplicate ancestor id</Text>
        </VStack>
      `);
      await expect(page.getByTestId("outer")).toBeVisible();
    });
    expect(
      warnings.filter((w) => w.includes("container") && w.includes("Duplicate")),
    ).toHaveLength(1);
  });
});
