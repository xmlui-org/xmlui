import { expect, test } from "../../src/testing/fixtures";

test("extension components do not forward layout props to their native DOM", async ({
  initTestBed,
  page,
}) => {
  const reactPropWarnings: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (text.includes("React does not recognize") || text.includes("marginBottom")) {
      reactPropWarnings.push(text);
    }
  });

  await initTestBed(
    `<ScrollToTop visible="true" threshold="0" marginBottom="$space-4" />`,
    { extensionIds: "xmlui-website-blocks" },
  );

  const button = page.getByRole("button", { name: "Scroll to top" });
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS("margin-bottom", "16px");
  await expect(button).not.toHaveAttribute("marginBottom", /.+/);
  await expect(button).not.toHaveAttribute("marginbottom", /.+/);
  expect(reactPropWarnings).toEqual([]);
});
