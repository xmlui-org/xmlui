import { expect, test } from "../../testing/fixtures";

test.describe("I18n foundation", () => {
  test("renders variables, missing fallback, and locale switching", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        var.count="{1}"
        localeBundles="{{
          en: { greeting: 'Hello, {name}!', cart: '{count, plural, one {# item} other {# items}}' },
          de: { greeting: 'Hallo, {name}!', cart: '{count, plural, one {# Artikel} other {# Artikel}}' }
        }}">
        <Text testId="greeting"><I18n key="greeting" name="Ada" /></Text>
        <Text testId="cart"><I18n key="cart" count="{count}" /></Text>
        <Text testId="missing"><I18n key="missing.key" /></Text>
        <Button testId="many" onClick="count = 3">Many</Button>
        <Button testId="de" onClick="App.setLocale('de')">Deutsch</Button>
      </App>
    `);

    await expect(page.getByTestId("greeting")).toHaveText("Hello, Ada!");
    await expect(page.getByTestId("cart")).toHaveText("1 item");
    await expect(page.getByTestId("missing")).toHaveText("missing.key");

    await page.getByTestId("many").click();
    await expect(page.getByTestId("cart")).toHaveText("3 items");

    await page.getByTestId("de").click();
    await expect(page.getByTestId("greeting")).toHaveText("Hallo, Ada!");
    await expect(page.getByTestId("cart")).toHaveText("3 Artikel");
  });

  test("renders inline translated slots", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App localeBundles="{{ en: { terms: 'Read <termsLink/> now.' } }}">
        <Text testId="terms">
          <I18n key="terms">
            <property name="termsLink">
              <Link to="/terms">terms</Link>
            </property>
          </I18n>
        </Text>
      </App>
    `);

    await expect(page.getByTestId("terms")).toHaveText("Read terms now.");
    await expect(page.getByTestId("terms").getByRole("link", { name: "terms" })).toHaveAttribute("href", "/terms");
  });

  test("App.translate is available in handlers and expressions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        var.message=""
        localeBundles="{{ en: { api: 'API {name}' }, de: { api: 'API DE {name}' } }}">
        <Text testId="expression" value="{App.translate('api', { name: 'Ada' })}" />
        <Text testId="message" value="{message}" />
        <Button testId="translate" onClick="message = App.translate('api', { name: 'Lin' })">Translate</Button>
        <Button testId="de" onClick="App.setLocale('de')">Deutsch</Button>
      </App>
    `);

    await expect(page.getByTestId("expression")).toHaveText("API Ada");
    await page.getByTestId("translate").click();
    await expect(page.getByTestId("message")).toHaveText("API Lin");
    await page.getByTestId("de").click();
    await page.getByTestId("translate").click();
    await expect(page.getByTestId("message")).toHaveText("API DE Lin");
  });
});
