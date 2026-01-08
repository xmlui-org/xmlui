import { test, expect } from "../../testing/fixtures";


test.describe("Scroll Restoration", () => {
  test("restores scroll position when navigating back from another page", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    // 1. Setup app with a long homepage and a details page
    // We add testId to App to easily target the scroll container
    await initTestBed(`
      <App testId="app-scroll-container">
        <Pages defaultScrollRestoration="true">
          <Page url="/">
            <VStack>
              <Text>Top of Home</Text>
              <VStack height="2000px" backgroundColor="#eee">
                <Text>Spacer</Text>
              </VStack>
              <Text testId="bottom-text">Bottom of Home</Text>
              <Button label="Go to Details" onClick="navigate('/details')" testId="btn-details" />
            </VStack>
          </Page>
          <Page url="/details">
            <VStack>
              <Text>Details Page</Text>
            </VStack>
          </Page>
        </Pages>
      </App>
    `);

    // 2. Verify we are on Home
    await expect(page.getByText("Top of Home")).toBeVisible();
    
    // 3. Scroll down to a specific position
    const scrollTarget = 1500;
    
    // Get the app container element
    const appContainer = page.getByTestId("app-scroll-container");
    
    // Perform scroll
    await appContainer.evaluate((el, y) => {
      el.scrollTo({ top: y, behavior: 'instant' });
    }, scrollTarget);

    // Wait for the debounce (100ms) to ensure position is saved to sessionStorage
    await page.waitForTimeout(300);

    // Verify we are actually scrolled (sanity check)
    // We capture the actual scroll position because it might be less than target if we hit bottom
    const initialScroll = await appContainer.evaluate((el) => el.scrollTop);
    expect(initialScroll).toBeGreaterThan(100); 

    // 4. Navigate to Details page using a button (Push navigation)
    const btn = await createButtonDriver("btn-details");
    await btn.click();
    
    // Verify we are on Details page
    await expect(page.getByText("Details Page")).toBeVisible();

    // 5. Navigate BACK using Browser Back button
    await page.evaluate(() => history.back());

    // 6. Verify we are back on Home and scroll position is restored
    await expect(page.getByText("Top of Home")).toBeVisible();
    
    // Wait for the restoration logic to kick in (requestAnimationFrame)
    await page.waitForTimeout(500);

    const restoredScroll = await appContainer.evaluate((el) => el.scrollTop);

    // Check if scroll position is restored to what it was before leaving
    expect(Math.abs(restoredScroll - initialScroll)).toBeLessThan(50);
  });

  test("does NOT restore scroll position when defaultScrollRestoration is not set", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    // 1. Setup app WITHOUT defaultScrollRestoration="true"
    await initTestBed(`
      <App testId="app-scroll-container">
        <Pages>
          <Page url="/">
            <VStack>
              <Text>Top of Home</Text>
              <VStack height="2000px" backgroundColor="#eee">
                <Text>Spacer</Text>
              </VStack>
              <Text testId="bottom-text">Bottom of Home</Text>
              <Button label="Go to Details" onClick="navigate('/details')" testId="btn-details" />
            </VStack>
          </Page>
          <Page url="/details">
            <VStack>
              <Text>Details Page</Text>
            </VStack>
          </Page>
        </Pages>
      </App>
    `);

    // 2. Verify we are on Home
    await expect(page.getByText("Top of Home")).toBeVisible();
    
    // 3. Scroll down to a specific position
    const scrollTarget = 1500;
    const appContainer = page.getByTestId("app-scroll-container");
    
    await appContainer.evaluate((el, y) => {
      el.scrollTo({ top: y, behavior: 'instant' });
    }, scrollTarget);

    // Wait a bit
    await page.waitForTimeout(300);

    // Sanity check that we scrolled
    const initialScroll = await appContainer.evaluate((el) => el.scrollTop);
    expect(initialScroll).toBeGreaterThan(100); 

    // 4. Navigate to Details page
    const btn = await createButtonDriver("btn-details");
    await btn.click();
    await expect(page.getByText("Details Page")).toBeVisible();

    // 5. Navigate BACK
    await page.evaluate(() => history.back());

    // 6. Verify we are back on Home
    await expect(page.getByText("Top of Home")).toBeVisible();
    
    // Wait for any potential restoration logic (which shouldn't happen)
    await page.waitForTimeout(500);

    const restoredScroll = await appContainer.evaluate((el) => el.scrollTop);

    // Check if scroll position is NOT restored (should be at top)
    expect(restoredScroll).toBe(0);
  });
});