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
});
