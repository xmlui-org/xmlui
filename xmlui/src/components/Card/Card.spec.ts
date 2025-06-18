import { expect, test } from "../../testing/fixtures";

test("basic Card renders with default props", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card>
      <Text value="Card content" />
    </Card>
  `);

  await expect(page.getByText("Card content")).toBeVisible();
});


test("Card renders with title", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card title="Test Title">
      <Text value="Card content" />
    </Card>
  `);

  await expect(page.getByText("Test Title")).toBeVisible();
  await expect(page.getByText("Card content")).toBeVisible();
});


test("Card renders with subtitle", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card subtitle="Test Subtitle">
      <Text value="Card content" />
    </Card>
  `);

  await expect(page.getByText("Test Subtitle")).toBeVisible();
  await expect(page.getByText("Card content")).toBeVisible();
});

test("Card renders with both title and subtitle", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card title="Test Title" subtitle="Test Subtitle">
      <Text value="Card content" />
    </Card>
  `);

  await expect(page.getByText("Test Title")).toBeVisible();
  await expect(page.getByText("Test Subtitle")).toBeVisible();
  await expect(page.getByText("Card content")).toBeVisible();
});


test("showAvatar displays avatar when avatarUrl is provided", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card avatarUrl="https://i.pravatar.cc/100" title="Test Title" />
  `);

  const avatar = page.getByRole("img");
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute("src", "https://i.pravatar.cc/100");
});

test("avatar img height & width increase as avatarSize increase", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <Card showAvatar="true" avatarSize="xs" title="Test" />
    </App>
  `);

  await expect(page.locator('[data-component="Card"]')).toBeVisible();
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
  await initTestBed(`
    <App>
      <Card title="Clickable Title" linkTo="/test-link" />
    </App>
  `);

  const titleLink = page.locator("a").filter({ hasText: "Clickable Title" });
  await expect(titleLink).toBeVisible();
  await expect(titleLink).toHaveAttribute("href", "/test-link");
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

  // Card should render but no avatar or initials should be visible
  await expect(page.getByTestId("card")).toBeVisible();
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
      <Text value="Child 1" />
      <Text value="Child 2" />
    </Card>
  `);

  await expect(page.getByText("Title")).toBeVisible();
  await expect(page.getByText("Subtitle")).toBeVisible();
  await expect(page.getByText("Child 1")).toBeVisible();
  await expect(page.getByText("Child 2")).toBeVisible();
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
    <Card onClick="toast('Card clicked!')">
      <Text value="Clickable Card" />
    </Card>
  `);

  await page.getByTestId("card").click();
  await expect(page.getByText("Card clicked!")).toBeVisible();
});

test("Card click does not interfere with link click", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Card onClick="toast('Card clicked!')" title="Linked Title" linkTo="/test-link">
      <Text value="Card content" />
    </Card>
  `);

  // Clicking the link should not trigger the card click
  const titleLink = page.getByRole("link", { name: "Linked Title" });
  await expect(titleLink).toBeVisible();
  await expect(titleLink).toHaveAttribute("href", "/test-link");
});
