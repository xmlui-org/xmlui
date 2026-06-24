import { expect, test } from "../../testing/fixtures";

test("TableOfContents foundation lists page headings", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <TableOfContents testId="toc" maxHeadingLevel="2" />
      <H1 id="intro">Intro</H1>
      <H2 id="details">Details</H2>
      <H3 id="hidden">Hidden</H3>
    </App>
  `);

  await expect(page.getByTestId("toc")).toContainText("Intro");
  await expect(page.getByTestId("toc")).toContainText("Details");
  await expect(page.getByTestId("toc")).not.toContainText("Hidden");
});
