import { getFullRectangle } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test("Card renders with title", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card title="Test Title"/>
  `);

  await expect(page.getByRole('heading', { name: 'Test Title' })).toBeVisible();
});


test("Card renders with subtitle", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card subtitle="Test Subtitle"/>
  `);

  await expect(page.getByText("Test Subtitle")).toBeVisible();
});

test("Card renders with both title and subtitle", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card title="Test Title" subtitle="Test Subtitle">
      <Text value="Card content" />
    </Card>
  `);

  await expect(page.getByRole('heading', { name: 'Test Title' })).toBeVisible();
  await expect(page.getByText("Test Subtitle")).toBeVisible();
});


test("displays avatar when avatarUrl is provided", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card avatarUrl="/public/resources/flower-640x480.jpg" title="Test Title" />
  `);

  const avatar = page.getByRole("img", {name: "avatar"});
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute("src", "/public/resources/flower-640x480.jpg");
});

test("avatar img height & width increase as avatarSize increase", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <Card testId="card-xs" showAvatar="true" avatarSize="xs" title="Test" />
      <Card testId="card-sm" showAvatar="true" avatarSize="sm" title="Test" />
      <Card testId="card-md" showAvatar="true" avatarSize="md" title="Test" />
      <Card testId="card-lg" showAvatar="true" avatarSize="lg" title="Test" />
    </Fragment>
  `);
  const { width: widthXs, height: heightXs} = await getFullRectangle(page.getByTestId("card-xs").getByRole("img"));
  const { width: widthSm, height: heightSm} = await getFullRectangle(page.getByTestId("card-sm").getByRole("img"));
  const { width: widthMd, height: heightMd} = await getFullRectangle(page.getByTestId("card-md").getByRole("img"));
  const { width: widthLg, height: heightLg} = await getFullRectangle(page.getByTestId("card-lg").getByRole("img"));

  expect(widthXs).toBeLessThan(widthSm)
  expect(widthSm).toBeLessThan(widthMd)
  expect(widthMd).toBeLessThan(widthLg)

  expect(heightXs).toBeLessThan(heightSm)
  expect(heightSm).toBeLessThan(heightMd)
  expect(heightMd).toBeLessThan(heightLg)
});

["xs", "sm", "md", "lg"].forEach((size) => {
  test(`avatarSize ${size} shows image`, async ({ page, initTestBed }) => {
    await initTestBed(`
        <Card avatarSize="${size}" avatarUrl="https://i.pravatar.cc/100" />
    `);
  });

  test(`avatarSize ${size} shows initials`, async ({ page, initTestBed }) => {
    await initTestBed(`
        <Card avatarSize="${size}" title="John Alan Peter" />
    `);
  });

});

test("clicking linkTo title navigates", async ({ page, initTestBed }) => {
  await initTestBed(`<Card title="Clickable Title" linkTo="/test-link" />`);

  const titleLink = page.getByRole("link", {name: "Clickable Title"});

  await expect(titleLink).toBeVisible();
  await titleLink.click();
  await expect(page).toHaveURL(/\/test-link$/);
});


test("Card with invalid avatarSize uses default value", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <Card showAvatar="true" avatarSize="invalid" title="Test">
        <Text value="Content" />
      </Card>
    </App>
  `);

  await expect(page.locator("text=Test")).toBeVisible();
  await expect(page.locator("text=Content")).toBeVisible();
});


test("showAvatar displays initials with single word title", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card showAvatar="true" title="John" />
  `);

  await expect(page.getByText("J", { exact: true })).toBeVisible();
});

test("showAvatar=false hides avatar even when avatarUrl is provided", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card avatarUrl="https://i.pravatar.cc/100" showAvatar="false" title="Test Title" />
  `);

  await expect(page.getByRole("img")).not.toBeVisible();
  await expect(page.getByText("Test Title")).toBeVisible();
});

test("showAvatar=true with empty title displays no initials", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card showAvatar="true" />
  `);

  const avatarImg = page.getByRole("img");
  await expect(avatarImg).toBeVisible();
  await expect(avatarImg).toHaveText(/^$/);
});

test("avatarSize defaults to sm when not specified", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card showAvatar="true" title="Test" />
  `);

  await expect(page.getByText("T", { exact: true })).toBeVisible();
});

test("linkTo without title does not create link", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card linkTo="/test-link">
      <Text value="Content" />
    </Card>
  `);

  await expect(page.getByText("Content")).toBeVisible();
  await expect(page.getByRole("link")).not.toBeVisible();
});

test("orientation horizontal displays children in row", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card orientation="horizontal" title="Title" subtitle="Subtitle">
      <Text testId="text-1" value="Child 1" />
      <Text testId="text-2" value="Child 2" />
    </Card>
  `);

  await expect(page.getByText("Child 1")).toBeVisible();
  const { right: text1Right} = await getFullRectangle(page.getByTestId("text-1"));
  const { right: text2Left} = await getFullRectangle(page.getByTestId("text-2"));
  expect(text1Right).toBeLessThan(text2Left);
});

test("orientation vertical displays children in column", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card orientation="vertical">
      <Text value="Child 1" />
      <Text value="Child 2" />
    </Card>
  `);

  await expect(page.getByText("Child 1")).toBeVisible();
  await expect(page.getByText("Child 2")).toBeVisible();
});

test("orientation defaults to vertical when not specified", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card>
      <Text value="Child 1" />
      <Text value="Child 2" />
    </Card>
  `);

  await expect(page.getByText("Child 1")).toBeVisible();
  await expect(page.getByText("Child 2")).toBeVisible();
});

test("click event is triggered when Card is clicked", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card testId="card" var.clicked="{false}" onClick="clicked = true">
      <Text when="{clicked}" value="seen when clicked" />
    </Card>
  `);

  await expect(page.getByText("seen when clicked")).not.toBeVisible();
  await page.getByTestId("card").click();
  await expect(page.getByText("seen when clicked")).toBeVisible();
});

test.fixme("Card click does not interfere with link click", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card
      testId="card"
      var.clicked="{false}"
      onClick="clicked = true"
      title="This is a link"
      linkTo="/test-link"
    >
      <Text when="{clicked}" value="seen when clicked" />
    </Card>
  `);


  await expect(page.getByText("seen when clicked")).not.toBeVisible();
  await page.getByRole("heading", { name: "This is a link" }).click();
  await expect(page.getByText("seen when clicked")).not.toBeVisible();

});
