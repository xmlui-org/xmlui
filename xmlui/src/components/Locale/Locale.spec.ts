import { expect, test } from "../../testing/fixtures";

test.describe("Locale", () => {
  test("renders children unchanged", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Locale>
          <Text testId="child">Scoped child</Text>
        </Locale>
      </App>
    `);

    await expect(page.getByTestId("child")).toHaveText("Scoped child");
  });

  test("scopes translations and formatting to descendants", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        locale="en-US"
        localeBundles="{{
          'en-US': { 'hello': 'Hello' },
          'de-DE': { 'hello': 'Hallo' }
        }}">
        <Text testId="root-locale" value="{App.locale}" />
        <Text testId="root-number" value="{App.formatNumber(12345.5)}" />
        <I18n key="hello" />

        <Locale locale="de-DE">
          <Text testId="scoped-locale" value="{App.locale}" />
          <Text testId="scoped-number" value="{App.formatNumber(12345.5)}" />
          <I18n key="hello" />

          <Locale decimalSeparator="|" groupSeparator="_">
            <Text testId="trait-number" value="{App.formatNumber(12345.5)}" />
          </Locale>
        </Locale>

        <Text testId="after-number" value="{App.formatNumber(12345.5)}" />
      </App>
    `);

    await expect(page.getByTestId("root-locale")).toHaveText("en-US");
    await expect(page.getByTestId("scoped-locale")).toHaveText("en-US");
    await expect(page.getByText("Hello")).toBeVisible();
    await expect(page.getByText("Hallo")).toBeVisible();
    await expect(page.getByTestId("root-number")).toHaveText("12,345.5");
    await expect(page.getByTestId("scoped-number")).toHaveText("12.345,5");
    await expect(page.getByTestId("trait-number")).toHaveText("12_345|5");
    await expect(page.getByTestId("after-number")).toHaveText("12,345.5");
  });

  test("inherits parent locale when only traits are overridden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App locale="en-US">
        <Locale decimalSeparator="," thousandSeparator=" " currency="EUR">
          <Text testId="number" value="{App.formatNumber(12345.5)}" />
          <Text testId="currency" value="{App.formatCurrency(12345.5)}" />
        </Locale>
      </App>
    `);

    await expect(page.getByTestId("number")).toHaveText("12 345,5");
    await expect(page.getByTestId("currency")).toHaveText("€12 345,50");
  });

  test("scopes typed Table formatting while explicit column locale wins", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App locale="en-US">
        <Locale locale="fr-FR" currency="EUR">
          <Table
            data="{[
              { scoped: 1299.95, explicit: 1299.95 }
            ]}">
            <Column bindTo="scoped" type="currency" />
            <Column bindTo="explicit" type="currency(USD)" />
          </Table>
        </Locale>
      </App>
    `);

    await expect(page.locator('[data-column-cell-kind="number"]').nth(0)).toHaveText(
      "1 299,95 €",
    );
    await expect(page.locator('[data-column-cell-kind="number"]').nth(1)).toHaveText(
      "1 299,95 $US",
    );
  });
});
