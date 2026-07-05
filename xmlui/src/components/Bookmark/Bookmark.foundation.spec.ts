import { expect, test } from "../../testing/fixtures";

test.describe("Bookmark foundation", () => {
  test("route hash links scroll bookmarks inside App content when scrollWholePage is false", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App layout="vertical-full-header" scrollWholePage="false">
        <NavPanel>
          <Link to="/#red">Jump to red</Link>
          <Link to="/#green">Jump to green</Link>
          <Link to="/#blue">Jump to blue</Link>
        </NavPanel>
        <Pages>
          <Page url="/">
            <Bookmark id="red">
              <VStack height="800px" backgroundColor="red">Red</VStack>
            </Bookmark>
            <Bookmark id="green">
              <VStack height="800px" backgroundColor="green">Green</VStack>
            </Bookmark>
            <Bookmark id="blue">
              <VStack height="800px" backgroundColor="blue">Blue</VStack>
            </Bookmark>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.locator("#red")).toBeInViewport();
    await expect(page.locator("#green")).not.toBeInViewport();

    await page.getByRole("link", { name: "Jump to green" }).click();
    await expect(page.locator("#green")).toBeInViewport();
    await expect(page.locator("#red")).not.toBeInViewport();

    await page.getByRole("link", { name: "Jump to blue" }).click();
    await expect(page.locator("#blue")).toBeInViewport();
    await expect(page.locator("#green")).not.toBeInViewport();

    await page.getByRole("link", { name: "Jump to red" }).click();
    await expect(page.locator("#red")).toBeInViewport();
  });
});
