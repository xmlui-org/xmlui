import { expect, test } from "../../testing/fixtures";

test.describe("I18n foundation", () => {
  test("renders variables, missing fallback, and locale switching", async ({ initTestBed, page }) => {
    await useBrowserLanguages(page, ["en-US"]);

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

  test("uses the browser locale when App locale is omitted", async ({ initTestBed, page }) => {
    await useBrowserLanguages(page, ["de-DE", "en-US"]);

    await initTestBed(`
      <App
        var.count="{1}"
        var.status="ready"
        localeBundles="{{
          en: {
            'cart.items': '{count, plural, one {# item} other {# items}} in cart',
            'order.status': '{status, select, ready {Ready to ship} delayed {Delayed by weather} other {Status unknown}}'
          },
          de: {
            'cart.items': '{count, plural, one {# Artikel} other {# Artikel}} im Warenkorb',
            'order.status': '{status, select, ready {Versandbereit} delayed {Durch Wetter verzogert} other {Status unbekannt}}'
          }
        }}">
        <Text testId="cart"><I18n key="cart.items" count="{count}" /></Text>
        <Text testId="status"><I18n key="order.status" status="{status}" /></Text>
        <Button testId="five" onClick="count = 5">Five items</Button>
        <Button testId="delayed" onClick="status = 'delayed'">Delayed</Button>
        <Button testId="english" onClick="App.setLocale('en')">English</Button>
      </App>
    `);

    await expect(page.getByTestId("cart")).toHaveText("1 Artikel im Warenkorb");
    await expect(page.getByTestId("status")).toHaveText("Versandbereit");

    await page.getByTestId("five").click();
    await page.getByTestId("delayed").click();
    await expect(page.getByTestId("cart")).toHaveText("5 Artikel im Warenkorb");
    await expect(page.getByTestId("status")).toHaveText("Durch Wetter verzogert");

    await page.getByTestId("english").click();
    await expect(page.getByTestId("cart")).toHaveText("5 items in cart");
    await expect(page.getByTestId("status")).toHaveText("Delayed by weather");
    expect(await page.evaluate(() => window.localStorage.getItem("xmlui.locale"))).toBe("en");
  });

  test("uses the persisted locale before the browser locale when App locale is omitted", async ({ initTestBed, page }) => {
    await useBrowserLanguages(page, ["en-US"]);
    await page.addInitScript(() => {
      window.localStorage.setItem("xmlui.locale", "de");
    });

    await initTestBed(`
      <App localeBundles="{{ en: { greeting: 'Hello' }, de: { greeting: 'Hallo' } }}">
        <Text testId="greeting"><I18n key="greeting" /></Text>
      </App>
    `);

    await expect(page.getByTestId("greeting")).toHaveText("Hallo");
  });

  test("renders inline translated slots", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App localeBundles="{{ en: { terms: 'Read <termsLink/> and <missingLink/> now.' } }}">
        <Text testId="terms">
          <I18n key="terms">
            <property name="termsLink">
              <Link to="/terms">terms</Link>
            </property>
          </I18n>
        </Text>
      </App>
    `);

    await expect(page.getByTestId("terms")).toHaveText("Read terms and <missingLink/> now.");
    await expect(page.getByTestId("terms").getByRole("link", { name: "terms" })).toHaveAttribute("href", "#/terms");
  });

  test("App.translate is available in handlers and expressions", async ({ initTestBed, page }) => {
    await useBrowserLanguages(page, ["en-US"]);

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

async function useBrowserLanguages(page: { addInitScript: (script: unknown, arg?: unknown) => Promise<void> }, languages: string[]) {
  await page.addInitScript((localeList: string[]) => {
    Object.defineProperty(navigator, "languages", {
      configurable: true,
      get: () => localeList,
    });
    Object.defineProperty(navigator, "language", {
      configurable: true,
      get: () => localeList[0],
    });
  }, languages);
}
