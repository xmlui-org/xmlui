import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic value", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="https://example.com" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("renders with custom size", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" size="128" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("renders with different error correction levels", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" level="H" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("renders with custom colors", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" color="#FF0000" backgroundColor="#0000FF" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("renders with UTF-8 text", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="한글 테스트 😊" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("renders with title for accessibility", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" title="QR code for test" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("init event fires on component initialization", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`<QRCode value="test" onInit="testState = 'initialized'" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
    await expect.poll(testStateDriver.testState).toEqual("initialized");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies backgroundColor theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" testId="qr"/>`, {
      testThemeVars: { "backgroundColor-QRCode": "rgb(255, 0, 0)" },
    });
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("applies padding theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" testId="qr"/>`, {
      testThemeVars: { "padding-QRCode": "20px" },
    });
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toHaveCSS("padding", "20px");
  });

  test("applies size theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test" testId="qr"/>`, {
      testThemeVars: { "size-QRCode": "128" },
    });
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
    // Size is applied to the SVG width and height attributes
    const svg = qrCode.locator("svg");
    await expect(svg).toHaveAttribute("width", "128");
    await expect(svg).toHaveAttribute("height", "128");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles empty string value", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("handles long text value", async ({ initTestBed, page }) => {
    const longText = "A".repeat(500);
    await initTestBed(`<QRCode value="${longText}" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });

  test("handles special characters", async ({ initTestBed, page }) => {
    await initTestBed(`<QRCode value="test@example.com?param=value&amp;other=123" testId="qr"/>`);
    
    const qrCode = page.getByTestId("qr");
    await expect(qrCode).toBeVisible();
  });
});
