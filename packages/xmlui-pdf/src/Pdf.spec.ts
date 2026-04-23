import { test, expect } from "xmlui/testing";

// =============================================================================
// PDF COMPONENT TESTS
// =============================================================================

// Use a small PDF served by the test bed itself. Going through an external
// URL (e.g. w3.org) makes these tests dependent on network availability and
// is the historical cause of CI flakes.
const SAMPLE_PDF = "/resources/sample.pdf";

test.describe("PDF Component", () => {
  test("renders PDF component on screen", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Pdf testId="pdfComponent" src="${SAMPLE_PDF}" />
      </App>
    `,
      {
        extensionIds: "xmlui-pdf",
      }
    );
    
    // Wait for PDF component to be visible
    await expect(page.getByTestId("pdfComponent")).toBeVisible();
  });

  test("supports multiple extensions array syntax", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Pdf testId="pdfComponent" src="${SAMPLE_PDF}" />
      </App>
    `,
      {
        extensionIds: ["xmlui-pdf"],
      }
    );
    
    // Wait for PDF component to be visible
    await expect(page.getByTestId("pdfComponent")).toBeVisible();
  });
});
