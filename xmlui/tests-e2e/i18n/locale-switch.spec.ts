import { expect, test } from "../../src/testing/fixtures";

// =============================================================================
// I18N — LOCALE SWITCH E2E TESTS
// =============================================================================
// Verifies plan #11 acceptance criteria: <App locale>/localeBundles props,
// App.setLocale() side effect, App.translate() lookup, and <I18n> reactivity.

test.describe("i18n — locale switching", () => {
  test("App.translate() returns translated string from inline bundle", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App
        locale="en"
        localeBundles="{{
          en: { 'greeting.hello': 'Hello, {name}!' },
          de: { 'greeting.hello': 'Hallo, {name}!' }
        }}">
        <Text testId="greeting">{App.translate('greeting.hello', { name: 'Ada' })}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("greeting")).toHaveText("Hello, Ada!");
  });

  test("App.setLocale() updates <I18n> translation reactively", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App
        localeBundles="{{
          en: { 'greeting.hello': 'Hello, {name}!' },
          de: { 'greeting.hello': 'Hallo, {name}!' }
        }}">
        <I18n key="greeting.hello" name="Ada" />
        <Button testId="toDe" onClick="App.setLocale('de')">DE</Button>
      </App>
    `,
      { noFragmentWrapper: true },
    );
    await expect(page.getByText("Hello, Ada!")).toBeVisible();
    await page.getByTestId("toDe").click();
    await expect(page.getByText("Hallo, Ada!")).toBeVisible();
  });

  test("missing key falls back to the key (non-strict)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App
        locale="en"
        localeBundles="{{ en: { 'present.key': 'Here' } }}">
        <Text testId="missing">{App.translate('absent.key')}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("missing")).toHaveText("absent.key");
  });

  test("<I18n> renders ICU plural and switches with locale", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App
        localeBundles="{{
          en: { 'cart.items': '{count, plural, one {# item} other {# items}}' },
          de: { 'cart.items': '{count, plural, one {# Artikel} other {# Artikel}}' }
        }}">
        <I18n key="cart.items" count="{3}" />
        <Button testId="toDe" onClick="App.setLocale('de')">DE</Button>
      </App>
    `,
      { noFragmentWrapper: true },
    );
    await expect(page.getByText("3 items")).toBeVisible();
    await page.getByTestId("toDe").click();
    await expect(page.getByText("3 Artikel")).toBeVisible();
  });

  test("App.direction is 'rtl' for Arabic locale", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App locale="ar" localeBundles="{{ ar: {} }}">
        <Text testId="dir">{App.direction}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("dir")).toHaveText("rtl");
  });
});
