import { test, expect } from "xmlui/testing";

// =============================================================================
// PDF COMPONENT TESTS
// =============================================================================

test.describe("PDF Component", () => {
  test("renders PDF component on screen", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <App>
        <Pdf testId="pdfComponent" src="https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table1.pdf" />
      </App>
    `,
      {
        extensionId: "xmlui-pdf",
      }
    );
    
    // Wait for PDF component to be visible
    await expect(page.getByTestId("pdfComponent")).toBeVisible();
  });
});
