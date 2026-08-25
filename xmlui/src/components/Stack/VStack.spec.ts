import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items vertically, supports empty, ignores orientation prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <VStack testId="vs-main">
          <Stack testId="vs-i1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="vs-i2" height="32px" width="32px" backgroundColor="blue" />
          <Stack testId="vs-i3" height="32px" width="32px" backgroundColor="green" />
        </VStack>
        <VStack testId="vs-empty"></VStack>
        <VStack testId="vs-orient" orientation="horizontal">
          <Stack testId="vs-oi1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="vs-oi2" height="32px" width="32px" backgroundColor="blue" />
        </VStack>
      </Fragment>
    `);

    // Verify vertical layout
    await expect(page.getByTestId("vs-main")).toBeVisible();
    const i1Box = await page.getByTestId("vs-i1").boundingBox();
    const i2Box = await page.getByTestId("vs-i2").boundingBox();
    const i3Box = await page.getByTestId("vs-i3").boundingBox();
    expect(i2Box!.y).toBeGreaterThan(i1Box!.y + i1Box!.height - 1);
    expect(i3Box!.y).toBeGreaterThan(i2Box!.y + i2Box!.height - 1);
    expect(Math.abs(i1Box!.x - i2Box!.x)).toBeLessThan(1);
    expect(Math.abs(i2Box!.x - i3Box!.x)).toBeLessThan(1);

    // Verify empty renders
    await expect(page.getByTestId("vs-empty")).toBeAttached();
    await expect(page.getByTestId("vs-empty")).toBeEmpty();

    // Verify orientation is ignored (still renders vertically)
    const oi1Box = await page.getByTestId("vs-oi1").boundingBox();
    const oi2Box = await page.getByTestId("vs-oi2").boundingBox();
    expect(oi2Box!.y).toBeGreaterThan(oi1Box!.y + oi1Box!.height - 1);
  });

  test("runs synchronous onUnmount cleanup without async lifecycle violation", async ({
    initTestBed,
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await initTestBed(`
      <Fragment>
        <VStack
          testId="cleanup-target"
          when="{testState !== 'hide'}"
          onUnmount="window.__xmluiUnmountCleanup()">
          <Text>Visible</Text>
        </VStack>
        <Button label="Hide" onClick="testState = 'hide'" />
      </Fragment>
    `);
    await page.evaluate(() => {
      (window as any).__xmluiUnmountCount = 0;
      (window as any).__xmluiUnmountCleanup = () => {
        (window as any).__xmluiUnmountCount += 1;
      };
    });

    await expect(page.getByTestId("cleanup-target")).toBeVisible();
    await page.getByRole("button", { name: "Hide" }).click();

    await expect.poll(() => page.evaluate(() => (window as any).__xmluiUnmountCount ?? 0)).toBe(1);
    expect(consoleErrors.some((error) => error.includes("async 'unmount' handler"))).toBe(false);
  });
});
