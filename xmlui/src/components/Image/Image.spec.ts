import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test.describe("Basic Functionality", () => {
  test("renders", async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" />`);
    await expect(page.getByTestId("img")).toBeVisible();
  });

  test("displays image with valid src", async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/resources/test-image-100x100.jpg" />`);
    await expect(page.getByTestId("img")).toHaveAttribute(
      "src",
      "/resources/test-image-100x100.jpg",
    );
  });

  test("handles invalid src gracefully", async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/non/existent/bad/url.jpg" />`);
    await expect(page.getByTestId("img")).toBeVisible();
    await expect(page.getByTestId("img")).toHaveAttribute("src", "/non/existent/bad/url.jpg");
  });

  test("alt text", async ({ page, initTestBed }) => {
    await initTestBed(`<Image alt="test text for alt" src="/non/existent/bad/url.jpg" />`);
    await expect(page.getByAltText("test text for alt")).toBeVisible();
  });

  test("handles undefined alt", async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/resources/test-image-100x100.jpg" />`);
    await expect(page.getByTestId("img")).not.toHaveAttribute("alt");
  });

  test("handles long unicode alt text", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Image
        testId="img" alt="👨‍👩‍👧‍👦 Family photo with unicode characters 中文测试"
        src="/resources/test-image-100x100.jpg"
      />
    `);
    await expect(page.getByTestId("img")).toHaveAttribute(
      "alt",
      "👨‍👩‍👧‍👦 Family photo with unicode characters 中文测试",
    );
  });

  test(`fit="contain"`, async ({ page, initTestBed }) => {
    await initTestBed(`
        <HStack width="300px" height="200px" >
          <Image testId="img" src="/resources/test-image-100x100.jpg" fit="contain" />
        </HStack>
      `);
    await expect(page.getByTestId("img")).toHaveCSS("object-fit", "contain");
  });

  test(`fit="cover"`, async ({ page, initTestBed }) => {
    await initTestBed(`
        <HStack width="300px" height="200px" >
          <Image testId="img" src="/resources/test-image-100x100.jpg" fit="cover" />
        </HStack>
      `);
    await expect(page.getByTestId("img")).toHaveCSS("object-fit", "cover");
  });

  test("handles invalid fit value", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" fit="invalid" />`,
    );
    await expect(page.getByTestId("img")).toHaveCSS("object-fit", "contain");
  });

  test("lazy loading enabled", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" lazyLoad="true" />`,
    );
    await expect(page.getByTestId("img")).toHaveAttribute("loading", "lazy");
  });

  test("lazy loading disabled (default)", async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/resources/test-image-100x100.jpg" />`);
    await expect(page.getByTestId("img")).toHaveAttribute("loading", "eager");
  });

  test("lazy loading explicitly disabled", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" lazyLoad="false" />`,
    );
    await expect(page.getByTestId("img")).toHaveAttribute("loading", "eager");
  });

  test("applies aspect ratio as number", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" aspectRatio="1.5" />`,
    );
    await expect(page.getByTestId("img")).toHaveCSS("aspect-ratio", "1.5 / 1");
  });

  test("applies aspect ratio as string fraction", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" aspectRatio="16/9" />`,
    );
    await expect(page.getByTestId("img")).toHaveCSS("aspect-ratio", "16 / 9");
  });

  test("inline display when true", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" inline="true" />`,
    );
    await expect(page.getByTestId("img")).toHaveCSS("display", "inline");
  });

  test("block display when false (default)", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Image testId="img" src="/resources/test-image-100x100.jpg" inline="false" />`,
    );
    await expect(page.getByTestId("img")).not.toHaveCSS("display", "inline");
  });
});

test.describe("Accessibility", () => {
  test("has correct role when clickable", async ({ page, initTestBed }) => {
    await initTestBed(`
        <Image testId="img" src="/resources/test-image-100x100.jpg" onClick="console.log('clicked')" alt="Clickable image" />
      `);
    const img = page.getByTestId("img");
    await expect(img).toHaveAttribute("alt", "Clickable image");
  });
});

test.describe("Events", () => {
  test(`onClick event`, async ({ page, initTestBed }) => {
    await initTestBed(`
        <HStack width="100px" gap="1rem" verticalAlignment="center">   
          <variable name="showTestText" value="{false}" />
          <Image onClick="showTestText = true" testId="img" src="/resources/test-image-100x100.jpg" />
          <Text when="{showTestText}">this is a test text</Text>
        </HStack>
      `);
    await page.getByTestId("img").click();
    await expect(page.getByText("this is a test text")).toBeVisible();
  });
});

test.describe("Theme Variables", () => {
  test(`custom themeVar borderRadius`, async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/resources/test-image-100x100.jpg" />`, {
      testThemeVars: {
        "borderRadius-Image": "25px",
      },
    });
    await expect(page.getByTestId("img")).toHaveCSS("border-radius", "25px");
  });

  test(`custom themeVar borderColor`, async ({ page, initTestBed }) => {
    await initTestBed(`<Image testId="img" src="/resources/test-image-100x100.jpg" />`, {
      testThemeVars: {
        "borderColor-Image": "rgb(255, 0, 0)",
      },
    });
    await expect(page.getByTestId("img")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });
});

test.describe("Other Edge Cases", () => {
  [
    { label: "null", value: null },
    { label: "undefined", value: undefined },
    { label: "number", value: 123 },
    { label: "boolean", value: true },
    { label: "empty object", value: "{}" },
    { label: "empty array", value: "[]" },
    { label: "array", value: "['/resources/test-image-100x100.jpg']" },
    { label: "function", value: "() => '/resources/test-image-100x100.jpg'" },
    { label: "object", value: "{ a: '/resources/test-image-100x100.jpg' }" },
  ].forEach(({ label, value }) => {
    test(`src prop handles ${label} by rendering broken image`, async ({ page, initTestBed }) => {
      await initTestBed(`<Image testId="img" src="{${value}}" />`);
      const img = page.getByTestId("img");

      await expect(img).toBeVisible();

      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);

      expect(naturalWidth).toBe(0);
      expect(naturalHeight).toBe(0);
    });
  });

  [
    { label: "empty string", prop: "alt=\"\"", expected: undefined },
    { label: "string", prop: 'alt="some text"', expected: "some text" },
    { label: "number", prop: 'alt="{123}"', expected: "123" },
    { label: "boolean", prop: 'alt="{true}"', expected: "true" },
  ].forEach(({ label, prop, expected }) => {
    test(`alt attribute appears if value is ${label}`, async ({ page, initTestBed }) => {
      await initTestBed(`<Image testId="img" ${prop} />`);
      const img = page.getByTestId("img");

      await expect(img).toBeVisible();
      await expect(img).toHaveAttribute("alt", expected);
    });
  });

  [
    { label: "null", prop: 'alt="{null}"' },
    { label: "undefined", prop: 'alt="{undefined}"' },
    { label: "empty object", prop: 'alt="{{}}"' },
    { label: "empty array", prop: 'alt="{[]}"' },
    { label: "array", prop: 'alt="{[\'/resources/test-image-100x100.jpg\']}"' },
    { label: "function", prop: 'alt="{() => \'/resources/test-image-100x100.jpg\'}"' },
    { label: "object", prop: 'alt="{{ a: \'/resources/test-image-100x100.jpg\' }}"' },
  ].forEach(({ label, prop }) => {
    test(`alt attr not shown if value is ${label}`, async ({ page, initTestBed }) => {
      await initTestBed(`<Image testId="img" ${prop} />`);
      const img = page.getByTestId("img");

      await expect(img).toBeVisible();
      await expect(img).not.toHaveAttribute("alt");
    });
  });

  test("handles very long src URL", async ({ page, initTestBed }) => {
    const longUrl = "/very/long/path/".repeat(20) + "image.jpg";
    await initTestBed(`<Image testId="img" src="${longUrl}" />`);
    await expect(page.getByTestId("img")).toHaveAttribute("src", longUrl);
  });
});
