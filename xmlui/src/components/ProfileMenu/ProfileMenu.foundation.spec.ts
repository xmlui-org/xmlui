import { expect, test } from "../../testing/fixtures";

test.describe("ProfileMenu foundation", () => {
  test("renders default profile menu from App loggedInUser in AppHeader", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App loggedInUser="{{ name: 'Joe User', email: 'joe@example.com' }}">
        <AppHeader title="Profile demo" />
      </App>
    `);

    await page.getByLabel("Avatar of Joe User").click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menu")).toContainText("Joe User");
    await expect(page.getByRole("menu")).toContainText("joe@example.com");
    await expect(page.getByRole("menuitem", { name: "Log out" })).toBeVisible();
  });

  test("does not render when App has no loggedInUser", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <AppHeader title="No profile" />
      </App>
    `);

    await expect(page.getByLabel(/Profile menu/)).toHaveCount(0);
  });

  test("explicit profileMenuTemplate overrides the default internal profile menu", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App loggedInUser="{{ name: 'Joe User', email: 'joe@example.com' }}" var.message="{'idle'}">
        <AppHeader>
          <property name="profileMenuTemplate">
            <Button testId="customProfile" onClick="message = 'custom profile clicked'">Custom profile</Button>
          </property>
        </AppHeader>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await expect(page.getByLabel(/Profile menu/)).toHaveCount(0);
    await page.getByTestId("customProfile").click();
    await expect(page.getByTestId("message")).toContainText("custom profile clicked");
  });
});
