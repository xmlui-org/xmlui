import { expect, test } from "../../testing/fixtures";

const avatarDataUrl =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

test.describe("Value", () => {
  test.describe("Basic Functionality", () => {
    test("renders text and nullish values", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Value testId="text" value="Ada Lovelace" />
          <Value testId="empty" value="{null}" />
          <Value testId="json-null" value="{null}" type="json" />
        </VStack>
      `);

      await expect(page.getByTestId("text")).toHaveText("Ada Lovelace");
      await expect(page.getByTestId("empty")).toHaveCount(0);
      await expect(page.getByTestId("json-null")).toHaveText("null");
    });

    test("formats numbers, currency, and locale overrides", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Value testId="number" value="{1234.5678}" type="number(8,3)" />
          <Value testId="currency" value="{1299.95}" type="currency(USD)" />
          <Value testId="locale" value="{1234.5}" type="decimal(1)" typeOptions="{{locale:'hu-HU'}}" />
        </VStack>
      `);

      await expect(page.getByTestId("number")).toHaveText("1,234.568");
      await expect(page.getByTestId("currency")).toHaveText("$1,299.95");
      await expect(page.getByTestId("locale")).toHaveText("1234,5");
    });

    test("renders link-like and mapped enum values", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Value testId="email" value="ada@example.com" type="email" />
          <Value testId="url" value="https://example.com/docs" type="url(label:domain)" />
          <Value
            testId="state"
            value="sent"
            type="enum"
            typeOptions="{{sent:{label:'Sent to customer'}}}"
          />
        </VStack>
      `);

      await expect(page.getByTestId("email")).toHaveAttribute("href", "mailto:ada@example.com");
      await expect(page.getByTestId("email")).toHaveText("ada@example.com");
      await expect(page.getByTestId("url")).toHaveAttribute("href", "https://example.com/docs");
      await expect(page.getByTestId("url")).toHaveText("example.com");
      await expect(page.getByTestId("state")).toHaveText("Sent to customer");
    });

    test("renders markdown, JSON, and media values", async ({ initTestBed, page }) => {
      await initTestBed(`
        <VStack>
          <Value testId="markdown" value="**bold** and *soft*" type="markdown" />
          <Value testId="json" value="{{a:1}}" type="json" />
          <Value testId="avatar" value="${avatarDataUrl}" type="avatar" typeOptions="{{label:'Ada avatar'}}" />
        </VStack>
      `);

      await expect(page.getByTestId("markdown").locator("strong")).toHaveText("bold");
      await expect(page.getByTestId("markdown").locator("em")).toHaveText("soft");
      await expect(page.getByTestId("json")).toHaveText('{"a":1}');
      await expect(page.getByTestId("avatar")).toHaveAttribute("src", avatarDataUrl);
      await expect(page.getByTestId("avatar")).toHaveAttribute("alt", "Ada avatar");
    });

    test("falls back to text for invalid types", async ({ initTestBed, page }) => {
      await initTestBed(`<Value testId="fallback" value="plain" type="not-a-type" />`);

      await expect(page.getByTestId("fallback")).toHaveText("plain");
      await expect(page.getByTestId("fallback")).toHaveAttribute("data-value-kind", "text");
    });
  });
});
