// import { getFullRectangle } from "../../testing/component-test-helpers";
import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test("Card renders", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`<Card />`);
  const driver = await createCardDriver();
  await expect(driver.component).toBeVisible();
});

test("Card renders with title", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`<Card title="Test Title" />`);
  const title = (await createCardDriver()).component.getByRole("heading");
  await expect(title).toBeVisible();
  await expect(title).toHaveText("Test Title");
});

test("Card renders with subtitle", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`<Card subtitle="Test Subtitle" />`);
  const subtitle = (await createCardDriver()).component.locator("div").first();
  await expect(subtitle).toBeVisible();
  await expect(subtitle).toHaveText("Test Subtitle");
});

test("Card renders with both title and subtitle", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`
    <Card title="Test Title" subtitle="Test Subtitle">
      <Text value="Card content" />
    </Card>
  `);
  const driver = await createCardDriver();
  const title = driver.component.getByRole("heading");
  const subtitle = driver.component.getByText("Test Subtitle");
  
  await expect(title).toHaveText("Test Title");
  await expect(subtitle).toBeVisible();
});

test("displays avatar when avatarUrl is provided", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`<Card avatarUrl="/public/resources/flower-640x480.jpg" />`);
  const avatar = (await createCardDriver()).avatar;
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute("src", "/public/resources/flower-640x480.jpg");
});

test("clicking linkTo title navigates", async ({ page, initTestBed, createCardDriver }) => {
  await initTestBed(`<Card title="Clickable Title" linkTo="/test-link" />`);
  const titleLink = (await createCardDriver()).component.getByRole("link", {
    name: "Clickable Title",
  });
  await titleLink.click();
  await expect(page).toHaveURL(/\/test-link$/);
});

test("showAvatar=false hides avatar even when avatarUrl is provided", async ({
  initTestBed,
  createCardDriver,
}) => {
  await initTestBed(`
    <Card avatarUrl="https://i.pravatar.cc/100" showAvatar="false" title="Test Title" />
  `);
  const driver = await createCardDriver();
  await expect(driver.avatar).not.toBeVisible();
  await expect(driver.component.getByText("Test Title")).toBeVisible();
});

test("showAvatar displays initials with single word title", async ({
  initTestBed,
  createCardDriver,
}) => {
  await initTestBed(`<Card showAvatar="true" title="John" />`);
  await expect((await createCardDriver()).component.getByText("J", { exact: true })).toBeVisible();
});

test("showAvatar=true with empty title displays no initials", async ({
  initTestBed,
  createCardDriver,
}) => {
  await initTestBed(`<Card showAvatar="true" />`);
  const avatar = (await createCardDriver()).avatar;
  await expect(avatar).toHaveText(/^$/);
});

test("linkTo without title does not create link", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`
    <Card linkTo="/test-link">
      <Text value="Content" />
    </Card>
  `);
  const driver = await createCardDriver();
  await expect(driver.component.getByRole("link")).not.toBeVisible();
  await expect(driver.component.getByText("Content")).toBeVisible();
});

test("orientation horizontal displays children in row", async ({
  initTestBed,
  createTextDriver,
}) => {
  await initTestBed(`
    <Card orientation="horizontal">
      <Text testId="text-1" value="Child 1" />
      <Text testId="text-2" value="Child 2" />
    </Card>
  `);
  const text1Driver = await createTextDriver("text-1");
  const text2Driver = await createTextDriver("text-2");

  const { right: text1Right } = await getBounds(text1Driver);
  const { right: text2Left } = await getBounds(text2Driver);
  expect(text1Right).toBeLessThan(text2Left);
});

test("orientation vertical displays children in column", async ({
  initTestBed,
  createTextDriver,
}) => {
  await initTestBed(`
    <Card orientation="vertical">
      <Text testId="text-1" value="Child 1" />
      <Text testId="text-2" value="Child 2" />
    </Card>
  `);
  const text1Driver = await createTextDriver("text-1");
  const text2Driver = await createTextDriver("text-2");

  const { bottom: text1Bottom } = await getBounds(text1Driver);
  const { top: text2Top } = await getBounds(text2Driver);
  expect(text1Bottom).toBeLessThan(text2Top);
});

test("click event is triggered when Card is clicked", async ({ initTestBed, createCardDriver }) => {
  const { testStateDriver } = await initTestBed(`<Card onClick="testState = true" />`);
  await (await createCardDriver()).click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("Card click does not interfere with link click", async ({
  page,
  initTestBed,
  createCardDriver,
  createTextDriver,
}) => {
  await initTestBed(`
    <Card title="Title" linkTo="/test-link" onClick="testState = true">
      <Text testId="text-1" when="{testState}" value="visible" />
    </Card>
  `);
  const cardDriver = await createCardDriver();
  const textDriver = await createTextDriver("text-1");

  await cardDriver.click();
  await expect(textDriver.component).toHaveText("visible");
  await expect(page).not.toHaveURL(/\/test-link$/);
});

test.skip(
  "Link click does not interfere with Card click",
  SKIP_REASON.XMLUI_BUG("Clicking linkTo does trigger click event"),
  async ({ page, initTestBed, createCardDriver, createTextDriver }) => {
    await initTestBed(`
    <Card title="Title" linkTo="/test-link" onClick="testState = true">
      <Text testId="text-1" when="{testState}" value="visible" />
    </Card>
  `);
    const title = (await createCardDriver()).component.getByRole("heading");
    const textDriver = await createTextDriver("text-1");

    await title.click();
    await expect(textDriver.component).not.toBeVisible();
    await expect(page).toHaveURL(/\/test-link$/);
  },
);

// NOTE: avatar size is tested in Avatar.spec
/* test("avatar size increases with avatarSize", async ({ initTestBed, createCardDriver }) => {
  await initTestBed(`
    <Fragment>
      <Card testId="card-xs" showAvatar="true" avatarSize="xs" />
      <Card testId="card-sm" showAvatar="true" avatarSize="sm" />
      <Card testId="card-md" showAvatar="true" avatarSize="md" />
      <Card testId="card-lg" showAvatar="true" avatarSize="lg" />
    </Fragment>
  `);

  const { width: widthXs, height: heightXs } = await getBounds(
    (await createCardDriver("card-xs")).avatar,
  );
  const { width: widthSm, height: heightSm } = await getBounds(
    (await createCardDriver("card-sm")).avatar,
  );
  const { width: widthMd, height: heightMd } = await getBounds(
    (await createCardDriver("card-md")).avatar,
  );
  const { width: widthLg, height: heightLg } = await getBounds(
    (await createCardDriver("card-lg")).avatar,
  );

  expect(widthXs).toBeLessThan(widthSm);
  expect(widthSm).toBeLessThan(widthMd);
  expect(widthMd).toBeLessThan(widthLg);

  expect(heightXs).toBeLessThan(heightSm);
  expect(heightSm).toBeLessThan(heightMd);
  expect(heightMd).toBeLessThan(heightLg);
}); */

/* ["xs", "sm", "md", "lg"].forEach((size) => {
  test(`avatarSize ${size} shows image`, async ({ initTestBed, createCardDriver }) => {
    await initTestBed(`
      <Card avatarSize="${size}" avatarUrl="/public/resources/flower-640x480.jpg" />
    `);
    await initTestBed(`<Card avatarUrl="/public/resources/flower-640x480.jpg" />`);
    const avatar = (await createCardDriver()).avatar;
    await expect(avatar).toHaveAttribute("src", "/public/resources/flower-640x480.jpg");
  });

  test(`avatarSize ${size} shows initials`, async ({ initTestBed, createCardDriver }) => {
    const name = "John Alan Peter";
    const initials = name.split(" ").map((word) => word.charAt(0)).join("");
    await initTestBed(`
      <Card showAvatar="true" avatarSize="${size}" title="${name}" />
    `);
    const avatar = (await createCardDriver()).avatar;
    await expect(avatar).toContainText(initials);
  });
}); */
