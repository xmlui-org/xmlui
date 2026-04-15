import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// applyLayoutProperties APPGLOBALS SWITCH TESTS
// =============================================================================

test.describe("applyLayoutProperties: 'all' (default)", () => {
  test("applies dimension properties without explicit setting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Stack width="200px" height="80px" testId="box" />
      </App>
    `);
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("width", "200px");
    await expect(box).toHaveCSS("height", "80px");
  });

  test("applies dimension and non-dimension properties with 'all'", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="80px" backgroundColor="purple" color="white" testId="box">
          <H3 testId="heading">Hello</H3>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "all" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("width", "200px");
    await expect(box).toHaveCSS("height", "80px");
    await expect(box).toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("heading")).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("applies padding properties with 'all'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack padding="20px" testId="box">
          <Text testId="content">Hello</Text>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "all" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("padding", "20px");
  });
});

test.describe("applyLayoutProperties: 'none'", () => {
  test("does not apply dimension properties with 'none'", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Stack width="300px" height="120px" testId="box"><Text>content</Text></Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "none" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const width = await box.evaluate((el) => window.getComputedStyle(el).width);
    expect(width).not.toBe("300px");
    const height = await box.evaluate((el) => window.getComputedStyle(el).height);
    expect(height).not.toBe("120px");
  });

  test("does not apply background color with 'none'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="80px" backgroundColor="purple" testId="box"><Text>content</Text></Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "none" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const bg = await box.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgb(128, 0, 128)");
  });

  test("does not apply padding with 'none'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack padding="30px" testId="box">
          <Text testId="content">Hello</Text>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "none" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const padding = await box.evaluate((el) => window.getComputedStyle(el).padding);
    expect(padding).not.toBe("30px");
  });

  test("does not apply color with 'none'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack color="red" testId="box">
          <Text testId="content">Hello</Text>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "none" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const color = await box.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).not.toBe("rgb(255, 0, 0)");
  });
});

test.describe("applyLayoutProperties: 'dims'", () => {
  test("applies width and height with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="80px" testId="box" />
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("width", "200px");
    await expect(box).toHaveCSS("height", "80px");
  });

  test("applies minWidth and maxWidth with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack minWidth="100px" maxWidth="400px" testId="box"><Text>content</Text></Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("min-width", "100px");
    await expect(box).toHaveCSS("max-width", "400px");
  });

  test("applies minHeight and maxHeight with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack minHeight="50px" maxHeight="200px" testId="box"><Text>content</Text></Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    await expect(box).toHaveCSS("min-height", "50px");
    await expect(box).toHaveCSS("max-height", "200px");
  });

  test("does not apply background color with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="80px" backgroundColor="purple" testId="box" />
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    // Width and height are applied
    await expect(box).toHaveCSS("width", "200px");
    await expect(box).toHaveCSS("height", "80px");
    // Background color is NOT applied
    const bg = await box.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgb(128, 0, 128)");
  });

  test("does not apply padding with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" padding="30px" testId="box">
          <Text testId="content">Hello</Text>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    // Width is applied
    await expect(box).toHaveCSS("width", "200px");
    // Padding is NOT applied
    const padding = await box.evaluate((el) => window.getComputedStyle(el).padding);
    expect(padding).not.toBe("30px");
  });

  test("does not apply color with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack color="red" testId="box">
          <Text testId="content">Hello</Text>
        </Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const color = await box.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).not.toBe("rgb(255, 0, 0)");
  });

  test("does not apply margin with 'dims'", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Stack margin="40px" testId="box"><Text>content</Text></Stack>
      </App>
    `,
      {
        appGlobals: { applyLayoutProperties: "dims" },
      },
    );
    const box = page.getByTestId("box");
    await expect(box).toBeVisible();
    const margin = await box.evaluate((el) => window.getComputedStyle(el).margin);
    expect(margin).not.toBe("40px");
  });
});
