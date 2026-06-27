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

test("TableOfContents foundation respects omitH1", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <TableOfContents testId="toc" omitH1="{true}" />
      <H1 id="intro">Intro</H1>
      <H2 id="details">Details</H2>
    </App>
  `);

  await expect(page.getByTestId("toc")).not.toContainText("Intro");
  await expect(page.getByTestId("toc")).toContainText("Details");
});

test("TableOfContents foundation navigates to heading links", async ({ initTestBed, page }) => {
  await page.setViewportSize({ width: 800, height: 480 });
  await initTestBed(`
    <App>
      <TableOfContents testId="toc" smoothScrolling="{false}" />
      <VStack gap="800px">
        <H1 id="intro">Intro</H1>
        <H2 id="details">Details</H2>
      </VStack>
    </App>
  `);

  await page.getByRole("link", { name: "Details" }).click();
  await expect(page).toHaveURL(/#details$/);
});
