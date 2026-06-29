import { expect, test } from "../../testing/fixtures";

test.describe("Card foundation", () => {
  test("renders title, subtitle, avatar, orientation, and click mutation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.horizontal="{false}" var.clicked="{0}">
        <Card
          testId="card"
          title="Account"
          subtitle="Clicks: {clicked}"
          showAvatar="true"
          orientation="{horizontal ? 'horizontal' : 'vertical'}"
          onClick="clicked++">
          <Text>Card content</Text>
        </Card>
        <Button testId="toggle" onClick="horizontal = !horizontal">Toggle</Button>
      </App>
    `);

    const card = page.getByTestId("card");
    await expect(card).toHaveCSS("display", "flex");
    await expect(card).toHaveCSS("flex-direction", "column");
    await expect(card.getByRole("heading", { name: "Account" })).toBeVisible();
    await expect(card.getByText("Clicks: 0")).toBeVisible();
    await expect(card.locator('[data-xmlui-part="avatar"]')).toBeVisible();

    await card.click();
    await expect(card.getByText("Clicks: 1")).toBeVisible();

    await page.getByTestId("toggle").click();
    await expect(card).toHaveCSS("flex-direction", "row");
  });

  test("direct children keep explicit sizes so scroll APIs have real overflow", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Card id="cardApi" testId="card" height="100px" overflowY="scroll">
        <Stack height="160px" backgroundColor="lightblue" />
        <Stack height="160px" backgroundColor="lightgreen" />
      </Card>
      <Button testId="scroll" onClick="cardApi.scrollToBottom()" />
    `);

    const card = page.getByTestId("card");
    await expect.poll(async () =>
      card.evaluate((element) => element.scrollHeight > element.clientHeight),
    ).toBe(true);

    await page.getByTestId("scroll").click();
    await expect.poll(async () => card.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });

  test("subtitle uses secondary Text variant styling", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Card testId="card" title="Example Title" subtitle="Predefined subtitle">
        <HStack verticalAlignment="center">
          <Icon name="info" />
          This is a card
        </HStack>
      </Card>
    `);

    const subtitle = page.getByTestId("card").getByText("Predefined subtitle");
    const title = page.getByTestId("card").getByRole("heading", { name: "Example Title" });

    await expect(subtitle).toHaveCSS("font-size", "14px");
    await expect(subtitle).not.toHaveCSS("color", await title.evaluate((element) =>
      window.getComputedStyle(element).color,
    ));
  });
});
