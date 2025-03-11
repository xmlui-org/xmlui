import { expect, test } from "./fixtures";
import { initApp, initThemedApp } from "./component-test-helpers";

const SRC_IMG = "./tests/fixtures/test-image-100x100.jpg";

test("alt text", async ({ page }) => {
  const EXPECTED_ALT_TEXT = "test text for alt";

  await initApp(page, {
    entryPoint: `<Image alt="${EXPECTED_ALT_TEXT}" src="/non/existent/bad/url.jpg" />`,
  });

  await expect(page.getByAltText(EXPECTED_ALT_TEXT)).toBeVisible();
});

test(`fit="contain"`, async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <HStack width="300px" height="200px" >
      <Image testId="img" src="${SRC_IMG}" fit="contain" />
    </HStack>
  `,
  });

  await expect(page.getByTestId("img")).toHaveCSS("object-fit", "contain");
});

test(`fit="cover"`, async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <HStack width="300px" height="200px" >
      <Image testId="img" src="${SRC_IMG}" fit="cover" />
    </HStack>
  `,
  });

  await expect(page.getByTestId("img")).toHaveCSS("object-fit", "cover");
});

test(`onClick event`, async ({ page }) => {
  const EXPECTED_TEXT = "this is a test text";

  await initApp(page, {
    entryPoint: `
    <HStack width="100px" gap="1rem" verticalAlignment="center">   
      <variable name="showTestText" value="{false}" />
      <Image onClick="showTestText = true" testId="img" src="${SRC_IMG}" />
      <Text when="{showTestText}">${EXPECTED_TEXT}</Text>
    </HStack>
  `,
  });

  await page.getByTestId("img").click();
  await expect(page.getByText(EXPECTED_TEXT)).toBeVisible();
});

test(`custom themeVar borderRadius`, async ({ page }) => {
  const EXPECTED_RADIUS = "25px";
  const entryPoint = `
    <HStack width="100px" gap="1rem" verticalAlignment="center">   
      <Image onClick="showTestText = true" testId="img" src="${SRC_IMG}" borderRadius="$borderRadius-MyImage"/>
    </HStack>
    `;

  await initThemedApp(page, entryPoint, {
    themeVars: {
      "borderRadius-MyImage": EXPECTED_RADIUS,
    },
  });

  await expect(page.getByTestId("img")).toHaveCSS("border-radius", EXPECTED_RADIUS);
});
