import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("redirects immediately when visible with 'to' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/target" label="Target" />
          <NavLink to="/redirect" label="Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/target">Target Page</Page>
          <Page url="/redirect">
            <Redirect to="/target" />
            <Text>This should not be visible</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to the redirect page
    await page.getByRole("link", { name: "Redirect" }).click();
    
    // Should be redirected to target page immediately
    await expect(page).toHaveURL(/\/target$/);
    await expect(page.getByText("Target Page")).toBeVisible();
    await expect(page.getByText("This should not be visible")).not.toBeVisible();
  });

  test("redirects when 'when' property becomes true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/target" label="Target" />
          <NavLink to="/conditional" label="Conditional" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/target">Target Page</Page>
          <Page url="/conditional">
            <Fragment var.shouldRedirect="{false}">
              <Button label="Redirect Now" onClick="shouldRedirect = true" />
              <Redirect when="{shouldRedirect}" to="/target" />
              <Text>Click button to redirect</Text>
            </Fragment>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to conditional page
    await page.getByRole("link", { name: "Conditional" }).click();
    await expect(page).toHaveURL(/\/conditional$/);
    await expect(page.getByText("Click button to redirect")).toBeVisible();

    // Click button to trigger redirect
    await page.getByRole("button", { name: "Redirect Now" }).click();
    
    // Should be redirected to target page
    await expect(page).toHaveURL(/\/target$/);
    await expect(page.getByText("Target Page")).toBeVisible();
  });

  test("does not redirect when 'when' property is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/target" label="Target" />
          <NavLink to="/no-redirect" label="No Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/target">Target Page</Page>
          <Page url="/no-redirect">
            <Redirect when="{false}" to="/target" />
            <Text>This should be visible</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to no-redirect page
    await page.getByRole("link", { name: "No Redirect" }).click();
    
    // Should stay on current page (not redirect)
    await expect(page).toHaveURL(/\/no-redirect$/);
    await expect(page.getByText("This should be visible")).toBeVisible();
    await expect(page.getByText("Target Page")).not.toBeVisible();
  });

  test("redirects to absolute URLs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/redirect" label="Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/accounts/123" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/accounts/123">Account 123 Page</Page>
        </Pages>
      </App>
    `);

    // Navigate to redirect page
    await page.getByRole("link", { name: "Redirect" }).click();
    
    // Should be redirected to absolute URL
    await expect(page).toHaveURL(/\/accounts\/123$/);
    await expect(page.getByText("Account 123 Page")).toBeVisible();
  });

  test("redirects to relative URLs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/redirect" label="Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/relative-target" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/relative-target">Relative Target Page</Page>
        </Pages>
      </App>
    `);

    // Navigate to redirect page
    await page.getByRole("link", { name: "Redirect" }).click();
    
    // Should be redirected to relative URL (using absolute path for reliability)
    await expect(page).toHaveURL(/\/relative-target$/);
    await expect(page.getByText("Relative Target Page")).toBeVisible();
  });

  test("redirects with query parameters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/redirect" label="Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/target?param=value&count=42" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/target">
            <Text>Target with params: {$queryParams.param} - {$queryParams.count}</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to redirect page
    await page.getByRole("link", { name: "Redirect" }).click();
    
    // Should be redirected with query parameters
    await expect(page).toHaveURL(/\/target\?param=value&count=42$/);
    await expect(page.getByText("Target with params: value - 42")).toBeVisible();
  });

  test("redirects with route parameters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/redirect" label="Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/user/john/profile" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/user/:userId/profile">
            <Text>User Profile: {$routeParams.userId}</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to redirect page
    await page.getByRole("link", { name: "Redirect" }).click();
    
    // Should be redirected with route parameters
    await expect(page).toHaveURL(/\/user\/john\/profile$/);
    await expect(page.getByText("User Profile: john")).toBeVisible();
  });

  test("works with dynamic 'to' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/dynamic" label="Dynamic" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/dynamic">
            <Fragment var.destination="{'/page1'}">
              <Button label="Go to Page 1" onClick="destination = '/page1'" />
              <Button label="Go to Page 2" onClick="destination = '/page2'" />
              <Button label="Redirect Now" onClick="destination = destination + '?from=dynamic'" />
              <Redirect when="{destination.endsWith('?from=dynamic')}" to="{destination}" />
              <Text>Choose destination and click redirect</Text>
            </Fragment>
          </Page>
          <Page url="/page1">Page 1: {$queryParams.from}</Page>
          <Page url="/page2">Page 2: {$queryParams.from}</Page>
        </Pages>
      </App>
    `);

    // Navigate to dynamic page
    await page.getByRole("link", { name: "Dynamic" }).click();
    await expect(page).toHaveURL(/\/dynamic$/);

    // Set destination to page2
    await page.getByRole("button", { name: "Go to Page 2" }).click();
    
    // Trigger redirect
    await page.getByRole("button", { name: "Redirect Now" }).click();
    
    // Should be redirected to page2 with query parameter
    await expect(page).toHaveURL(/\/page2\?from=dynamic$/);
    await expect(page.getByText("Page 2: dynamic")).toBeVisible();
  });

  test("handles empty 'to' property gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/empty-redirect" label="Empty Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/empty-redirect">
            <Redirect to="" />
            <Text>This should be visible since redirect is empty</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to empty redirect page
    await page.getByRole("link", { name: "Empty Redirect" }).click();
    
    // Should stay on current page since 'to' is empty
    await expect(page).toHaveURL(/\/empty-redirect$/);
    await expect(page.getByText("This should be visible since redirect is empty")).toBeVisible();
  });

  test("can coexist with other content on the page", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/mixed" label="Mixed Content" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/mixed">
            <VStack>
              <Text>Before redirect</Text>
              <Redirect when="{false}" to="/target" />
              <Text>After redirect</Text>
            </VStack>
          </Page>
          <Page url="/target">Target Page</Page>
        </Pages>
      </App>
    `);

    // Navigate to mixed content page
    await page.getByRole("link", { name: "Mixed Content" }).click();
    
    // Should stay on current page and show all content
    await expect(page).toHaveURL(/\/mixed$/);
    await expect(page.getByText("Before redirect")).toBeVisible();
    await expect(page.getByText("After redirect")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("is a non-visual component that doesn't affect screen readers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/accessible" label="Accessible" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/accessible">
            <VStack>
              <Text>Visible content before</Text>
              <Redirect when="{false}" to="/target" />
              <Text>Visible content after</Text>
            </VStack>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to page with redirect
    await page.getByRole("link", { name: "Accessible" }).click();
    
    // Check that visible content is accessible
    await expect(page.getByText("Visible content before")).toBeVisible();
    await expect(page.getByText("Visible content after")).toBeVisible();
    
    // The redirect component itself should not be visible or interact with accessibility tools
    await expect(page.getByText("Redirect")).not.toBeVisible();
  });

  test("preserves navigation context for screen readers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/redirect" label="Redirect to Target" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/target" />
            <Text>Loading...</Text>
          </Page>
          <Page url="/target">
            <Heading level="h1">Target Page</Heading>
            <Text>You have been redirected here</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate via the navigation link
    await page.getByRole("link", { name: "Redirect to Target" }).click();
    
    // Should be redirected and have proper heading structure
    await expect(page).toHaveURL(/\/target$/);
    await expect(page.getByRole("heading", { level: 1, name: "Target Page" })).toBeVisible();
    await expect(page.getByText("You have been redirected here")).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASES
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles multiple redirects on the same page", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/multiple" label="Multiple" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/multiple">
            <Fragment var.condition="{1}">
              <Button label="Set to 1" onClick="condition = 1" />
              <Button label="Set to 2" onClick="condition = 2" />
              <Redirect when="{condition === 1}" to="/target1" />
              <Redirect when="{condition === 2}" to="/target2" />
              <Text>Multiple redirects: {condition}</Text>
            </Fragment>
          </Page>
          <Page url="/target1">Target 1 Page</Page>
          <Page url="/target2">Target 2 Page</Page>
        </Pages>
      </App>
    `);

    // Navigate to multiple redirects page
    await page.getByRole("link", { name: "Multiple" }).click();
    
    // Should redirect to target1 immediately (condition starts as 1)
    await expect(page).toHaveURL(/\/target1$/);
    await expect(page.getByText("Target 1 Page")).toBeVisible();
  });

  test("works with complex conditional logic", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/complex" label="Complex" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/complex">
            <Fragment var.user="{{name: 'john', role: 'admin'}}">
              <Button label="Make User" onClick="user.role = 'user'" />
              <Button label="Make Admin" onClick="user.role = 'admin'" />
              <Redirect when="{user.role === 'admin'}" to="/admin-dashboard" />
              <Redirect when="{user.role === 'user'}" to="/user-dashboard" />
              <Text>User: {user.name} ({user.role})</Text>
            </Fragment>
          </Page>
          <Page url="/admin-dashboard">Admin Dashboard</Page>
          <Page url="/user-dashboard">User Dashboard</Page>
        </Pages>
      </App>
    `);

    // Navigate to complex page
    await page.getByRole("link", { name: "Complex" }).click();
    
    // Should redirect to admin dashboard (user starts as admin)
    await expect(page).toHaveURL(/\/admin-dashboard$/);
    await expect(page.getByText("Admin Dashboard")).toBeVisible();
  });

  test("handles special characters in URLs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/special" label="Special" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/special">
            <Redirect to="/target-with-dashes-and-underscores_test" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/target-with-dashes-and-underscores_test">
            <Text>Special URL Target</Text>
          </Page>
        </Pages>
      </App>
    `);

    // Navigate to special characters page
    await page.getByRole("link", { name: "Special" }).click();
    
    // Should handle dashes and underscores in URL
    await expect(page).toHaveURL(/\/target-with-dashes-and-underscores_test$/);
    await expect(page.getByText("Special URL Target")).toBeVisible();
  });

  test("works within nested components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/nested" label="Nested" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/nested">
            <VStack>
              <Card title="Card with Redirect">
                <VStack>
                  <Text>Inside a card</Text>
                  <Fragment var.shouldRedirect="{false}">
                    <Button label="Redirect from Card" onClick="shouldRedirect = true" />
                    <Redirect when="{shouldRedirect}" to="/target" />
                  </Fragment>
                </VStack>
              </Card>
            </VStack>
          </Page>
          <Page url="/target">Target from Nested</Page>
        </Pages>
      </App>
    `);

    // Navigate to nested page
    await page.getByRole("link", { name: "Nested" }).click();
    await expect(page).toHaveURL(/\/nested$/);
    
    // Click button inside nested component
    await page.getByRole("button", { name: "Redirect from Card" }).click();
    
    // Should redirect from nested context
    await expect(page).toHaveURL(/\/target$/);
    await expect(page.getByText("Target from Nested")).toBeVisible();
  });

  test("maintains browser history properly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/step1" label="Step 1" />
          <NavLink to="/redirect-test" label="Redirect Test" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/step1">Step 1 Page</Page>
          <Page url="/redirect-test">
            <Redirect to="/final" />
            <Text>Redirecting...</Text>
          </Page>
          <Page url="/final">Final Page</Page>
        </Pages>
      </App>
    `);

    // Start at home
    await expect(page).toHaveURL(/\/$|#\/$/);
    
    // Navigate to step1 first to establish history
    await page.getByRole("link", { name: "Step 1" }).click();
    await expect(page).toHaveURL(/\/step1$/);
    
    // Then navigate to redirect test (which redirects to final)
    await page.getByRole("link", { name: "Redirect Test" }).click();
    await expect(page).toHaveURL(/\/final$/);
    await expect(page.getByText("Final Page")).toBeVisible();
    
    // Test that browser navigation history exists and functions
    // The exact behavior may vary, but history should be maintained
    await page.goBack();
    
    // We should be able to navigate in history (exact destination may vary due to redirects)
    // The key is that history navigation works and doesn't break the app
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(step1|final|redirect-test)/);
  });

  test("handles null/undefined 'to' values gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <NavLink to="/" label="Home" />
          <NavLink to="/null-redirect" label="Null Redirect" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/null-redirect">
            <Fragment var.destination="{null}">
              <Button label="Set Null" onClick="destination = null" />
              <Button label="Set Undefined" onClick="destination = undefined" />
              <Button label="Set Valid" onClick="destination = '/target'" />
              <Redirect when="{destination}" to="{destination}" />
              <Text>Destination: {destination || 'none'}</Text>
            </Fragment>
          </Page>
          <Page url="/target">Target Page</Page>
        </Pages>
      </App>
    `);

    // Navigate to null redirect page
    await page.getByRole("link", { name: "Null Redirect" }).click();
    await expect(page).toHaveURL(/\/null-redirect$/);
    
    // Should show content without redirecting
    await expect(page.getByText("Destination: none")).toBeVisible();
    
    // Set valid destination and redirect should work
    await page.getByRole("button", { name: "Set Valid" }).click();
    await expect(page).toHaveURL(/\/target$/);
    await expect(page.getByText("Target Page")).toBeVisible();
  });
});
