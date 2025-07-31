import { expect, test } from "../../testing/fixtures";

test("alt text", async ({ page, initTestBed }) => {
  await initTestBed(`<Image alt="test text for alt" src="/non/existent/bad/url.jpg" />`);
  await expect(page.getByAltText("test text for alt")).toBeVisible();
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

test(`custom themeVar borderRadius`, async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <HStack width="100px" gap="1rem" verticalAlignment="center">   
      <Image onClick="showTestText = true" testId="img"
      src="/resources/test-image-100x100.jpg" borderRadius="$borderRadius-MyImage"/>
    </HStack>
    `,
    {
      testThemeVars: {
        "borderRadius-MyImage": "25px",
      },
    },
  );
  await expect(page.getByTestId("img")).toHaveCSS("border-radius", "25px");
});
