import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("Card renders", async ({ initTestBed, createCardDriver }) => {
    await initTestBed(`<Card />`);
    const driver = await createCardDriver();
    await expect(driver.component).toBeVisible();
  });

  test("contextMenu event fires on right click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Card testId="card" title="Test" onContextMenu="testState = 'context-menu-fired'" />`
    );

    const card = page.getByTestId("card");
    await card.click({ button: "right" });

    await expect.poll(testStateDriver.testState).toEqual("context-menu-fired");
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
    await initTestBed(`<Card avatarUrl="/resources/flower-640x480.jpg" />`);
    const avatar = (await createCardDriver()).avatar;
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute("src", "/resources/flower-640x480.jpg");
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
    await expect(
      (await createCardDriver()).component.getByText("J", { exact: true }),
    ).toBeVisible();
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

    const { right: text1Right } = await getBounds(text1Driver.component);
    const { right: text2Left } = await getBounds(text2Driver.component);
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

    const { bottom: text1Bottom } = await getBounds(text1Driver.component);
    const { top: text2Top } = await getBounds(text2Driver.component);
    expect(text1Bottom).toBeLessThan(text2Top);
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("click event is triggered when Card is clicked", async ({
    initTestBed,
    createCardDriver,
  }) => {
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

  test("Link click does not interfere with Card click", async ({
    page,
    initTestBed,
    createCardDriver,
    createTextDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Card title="Title" linkTo="/test-link" onClick="testState = true">
        <Text testId="text-1" when="{testState}" value="visible" />
      </Card>
    `);

    const textDriver = await createTextDriver("text-1");
    const title = (await createCardDriver()).component.getByRole("heading");

    await expect(textDriver.component).not.toBeVisible();
    await title.click();
    await page.waitForTimeout(200);
    await expect(page).toHaveURL(/\/test-link$/);
    await expect(textDriver.component).toBeVisible();
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("scrollToTop scrolls to the top of a scrollable Card", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToTop()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Scroll to bottom first
    await card.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Verify we're scrolled down
    const scrollTopBefore = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTopBefore).toBeGreaterThan(0);

    // Click button to scroll to top
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the top
    const scrollTopAfter = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("scrollToBottom scrolls to the bottom of a scrollable Card", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToBottom()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Verify we start at the top
    const scrollTopBefore = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTopBefore).toBe(0);

    // Click button to scroll to bottom
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the bottom
    const scrollTopAfter = await card.evaluate((elem) => elem.scrollTop);
    const scrollHeight = await card.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await card.evaluate((elem) => elem.clientHeight);
    
    expect(scrollTopAfter).toBeCloseTo(scrollHeight - clientHeight, 0);
  });

  test("scrollToStart scrolls to the start of a horizontally scrollable Card", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" width="200px" height="100px" overflowX="scroll" testId="card" orientation="horizontal">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToStart()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Scroll to end first
    await card.evaluate((elem) => {
      elem.scrollLeft = elem.scrollWidth;
    });

    // Verify we're scrolled right
    const scrollLeftBefore = await card.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftBefore).toBeGreaterThan(0);

    // Click button to scroll to start
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the start
    const scrollLeftAfter = await card.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftAfter).toBe(0);
  });

  test("scrollToEnd scrolls to the end of a horizontally scrollable Card", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" width="200px" height="100px" overflowX="scroll" testId="card" orientation="horizontal">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToEnd()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Verify we start at the start
    const scrollLeftBefore = await card.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftBefore).toBe(0);

    // Click button to scroll to end
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the end
    const scrollLeftAfter = await card.evaluate((elem) => elem.scrollLeft);
    const scrollWidth = await card.evaluate((elem) => elem.scrollWidth);
    const clientWidth = await card.evaluate((elem) => elem.clientWidth);
    
    expect(scrollLeftAfter).toBeCloseTo(scrollWidth - clientWidth, 0);
  });

  test("scrollToTop with 'smooth' behavior parameter", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToTop('smooth')" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Scroll to bottom first
    await card.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Click button to scroll to top with smooth behavior
    await page.getByTestId("scrollBtn").click();
    
    // Wait for smooth scroll to complete
    await page.waitForTimeout(500);

    // Verify we're at the top
    const scrollTopAfter = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("scrollToBottom with default behavior uses instant", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBtn" onClick="myCard.scrollToBottom()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");

    // Click button to scroll to bottom (default behavior)
    await page.getByTestId("scrollBtn").click();
    
    // With instant behavior, should be immediate
    await page.waitForTimeout(50);

    // Verify we're at the bottom
    const scrollTopAfter = await card.evaluate((elem) => elem.scrollTop);
    const scrollHeight = await card.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await card.evaluate((elem) => elem.clientHeight);
    
    expect(scrollTopAfter).toBeCloseTo(scrollHeight - clientHeight, 0);
  });

  test("scrollToBottom followed by scrollToTop", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBottomBtn" onClick="myCard.scrollToBottom()" />
        <Button testId="scrollTopBtn" onClick="myCard.scrollToTop()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Scroll to bottom
    await page.getByTestId("scrollBottomBtn").click();
    await page.waitForTimeout(100);

    const scrollHeight = await card.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await card.evaluate((elem) => elem.clientHeight);
    let scrollTop = await card.evaluate((elem) => elem.scrollTop);
    
    expect(scrollTop).toBeCloseTo(scrollHeight - clientHeight, 0);

    // Now scroll back to top
    await page.getByTestId("scrollTopBtn").click();
    await page.waitForTimeout(100);

    scrollTop = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTop).toBe(0);
  });

  test("Card with title and subtitle scrolls correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Card id="myCard" title="Card Title" subtitle="Card Subtitle" height="200px" overflowY="scroll" testId="card">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </Card>
        <Button testId="scrollBottomBtn" onClick="myCard.scrollToBottom()" />
        <Button testId="scrollTopBtn" onClick="myCard.scrollToTop()" />
      </Fragment>
    `);

    const card = page.getByTestId("card");
    
    // Verify title and subtitle are visible
    await expect(card.getByRole("heading")).toHaveText("Card Title");
    await expect(card.getByText("Card Subtitle")).toBeVisible();
    
    // Scroll to bottom
    await page.getByTestId("scrollBottomBtn").click();
    await page.waitForTimeout(100);

    let scrollTop = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTop).toBeGreaterThan(0);

    // Scroll back to top
    await page.getByTestId("scrollTopBtn").click();
    await page.waitForTimeout(100);

    scrollTop = await card.evaluate((elem) => elem.scrollTop);
    expect(scrollTop).toBe(0);
  });
});
