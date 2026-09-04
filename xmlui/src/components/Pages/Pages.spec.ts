import { test, expect } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

test.describe("Theme Variables", () => {
  test("paddingHorizontal-layout controls the default horizontal Pages padding", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App>
        <Pages>
          <Page url="/">
            <Stack testId="content" height="32px" width="32px" backgroundColor="red" />
          </Page>
        </Pages>
      </App>
    `,
      {
        testThemeVars: { "paddingHorizontal-layout": "28px" },
      },
    );

    const pageRoot = page.locator(".xmlui-page-root");
    const { left: pageLeft } = await getBounds(pageRoot);
    const { left: contentLeft } = await getBounds(page.getByTestId("content"));

    expect(contentLeft - pageLeft).toBeCloseTo(28, 0);
  });

  test("Pages-specific padding overrides the layout alias", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Pages>
          <Page url="/">
            <Stack testId="content" height="32px" width="32px" backgroundColor="red" />
          </Page>
        </Pages>
      </App>
    `,
      {
        testThemeVars: {
          "paddingHorizontal-layout": "28px",
          "paddingHorizontal-Pages": "12px",
        },
      },
    );

    const pageRoot = page.locator(".xmlui-page-root");
    const { left: pageLeft } = await getBounds(pageRoot);
    const { left: contentLeft } = await getBounds(page.getByTestId("content"));

    expect(contentLeft - pageLeft).toBeCloseTo(12, 0);
  });
});


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

test.describe("Programmatic navigation", () => {
  const messageComposerComponent = (navigationCall: string) => `
    <Component name="MessageComposer">
      <script>
        function submit() {
          emitEvent('submitted');
        }
      </script>
      <Button
        testId="send"
        onClick="submit(); ${navigationCall}">
        Send
      </Button>
    </Component>
  `;

  const appWithMessageComposer = `
    <App>
      <Pages>
        <Page url="/">
          <MessageComposer onSubmitted="testState = 'submitted'" />
        </Page>
        <Page url="/sent">
          <Text testId="sent">Sent</Text>
        </Page>
      </Pages>
    </App>
  `;

  test("navigate() works inside a user-defined component handler", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(appWithMessageComposer, {
      components: [messageComposerComponent("navigate('/sent')")],
    });

    const sendButton = page.getByTestId("send");
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    await expect(page.getByTestId("sent")).toBeVisible();
    await expect.poll(testStateDriver.testState).toBe("submitted");
  });

  test("Actions.navigate() works inside a user-defined component handler", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(appWithMessageComposer, {
      components: [messageComposerComponent("Actions.navigate('/sent')")],
    });

    const sendButton = page.getByTestId("send");
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    await expect(page.getByTestId("sent")).toBeVisible();
    await expect.poll(testStateDriver.testState).toBe("submitted");
  });
});

// =============================================================================
// CANONICAL URL ENFORCEMENT — regression coverage for the hash-stripping bug.
//
// `Pages` compares the current location against a "canonical" form of itself
// (case, trailing slash, query param order) and — by default (strictRouting is
// on unless disabled) — rewrites the URL when they differ. The rewrite used to
// go through raw `window.history.replaceState(state, "", canonical)`, where
// `canonical` is a bare "pathname?search" string with no "#". Two bugs
// compounded:
//   1. `canonicalise()` rebuilt the query string via `URLSearchParams.toString()`,
//      which always re-encodes (e.g. "/" -> "%2F"), even under the default
//      "preserve" order policy — so a query VALUE containing a raw "/" was
//      flagged as "non-canonical" even though nothing was actually wrong.
//   2. Because the rewrite used the raw History API instead of the router,
//      that spurious "fix" replaced the visible pathname/search directly and
//      dropped the "#" that carries hash-based routing — corrupting the URL,
//      and — since HashRouter's history thereafter only ever touches
//      `location.hash` — leaving it corrupted for every subsequent navigation.
// =============================================================================
test.describe("Canonical URL enforcement", () => {
  test("a query value containing '/' does not strip hash routing (single param)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">
            Home
            <Link to="/about?returnTo=/dashboard">Go</Link>
          </Page>
          <Page url="/about">Target</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("link", { name: "Go" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Target");
    expect(page.url()).toContain("#/about?returnTo=/dashboard");
  });

  test("a query value containing '/' plus a second param does not strip hash routing (reported repro)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">
            Home
            <Link to="/projects/1/cases/5?returnTo=/dashboard&amp;returnLabel=Dashboard">Go</Link>
          </Page>
          <Page url="/projects/:pid/cases/:cid">
            CaseDetail {$routeParams.pid} {$routeParams.cid}
            <Link to="/contact">Onward</Link>
          </Page>
          <Page url="/contact">Contact</Page>
        </Pages>
      </App>
    `);

    await page.getByRole("link", { name: "Go" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("CaseDetail");
    expect(page.url()).toContain("#/projects/1/cases/5?returnTo=/dashboard&returnLabel=Dashboard");

    // The URL must not be "stuck" — a later plain navigation should still land
    // under the hash instead of only ever touching a corrupted location.hash.
    await page.getByRole("link", { name: "Onward" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Contact");
    expect(page.url()).toContain("#/contact");
    expect(page.url()).not.toMatch(/^[^#]*\/contact/); // pathname itself must stay "/"
  });

  test("still redirects a genuinely non-canonical URL (case policy)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Pages>
          <Page url="/">
            Home
            <Link to="/ABOUT">Go</Link>
          </Page>
          <Page url="/about">Target</Page>
        </Pages>
      </App>
    `,
      { xmluiConfig: { urlCase: "lower" } },
    );

    await page.getByRole("link", { name: "Go" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Target");
    await expect.poll(() => page.url()).toContain("#/about");
  });

  test("still reorders query params alphabetically when configured", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Pages>
          <Page url="/">
            Home
            <Link to="/about?zeta=1&amp;alpha=2">Go</Link>
          </Page>
          <Page url="/about">Target</Page>
        </Pages>
      </App>
    `,
      { xmluiConfig: { urlQueryParamOrder: "alphabetical" } },
    );

    await page.getByRole("link", { name: "Go" }).click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Target");
    await expect.poll(() => page.url()).toContain("#/about?alpha=2&zeta=1");
  });
});
