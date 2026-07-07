import { expect, test } from "../../testing/fixtures";

test("vertical ContentSeparator keeps explicit thickness in text-heavy HStack", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(`
    <App>
      <HStack height="120px">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        <ContentSeparator testId="separator" orientation="vertical" thickness="10px" />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam,
        eaque ipsa quae ab illo inventore veritatis et quasi architecto
        beatae vitae dicta sunt explicabo.
      </HStack>
    </App>
  `);

  const separator = page.getByTestId("separator");
  await expect(separator).toHaveCSS("width", "10px");
  await expect(separator).toHaveCSS("flex-shrink", "0");
});
