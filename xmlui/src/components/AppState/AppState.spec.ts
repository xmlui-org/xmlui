import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("initializes with default props", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" />
      <Text testId="stateValue">|{JSON.stringify(appState.value)}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("||");
});

test("initializes with initial state value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" initialValue="{{ mode: true }}"/>
      <Text testId="stateValue">|{appState.value.mode}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("|true|");
});

test("initializes with multiple initial state value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" initialValue="{{ mode: true }}"/>
      <AppState id="appState2" initialValue="{{ otherMode: 123 }}"/>
      <Text testId="stateValue">|{appState.value.mode}|{appState2.value.otherMode}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("|true|123|");
});

test("initializes with provided bucket name and no initial value", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" bucket="settings" />
      <Text testId="stateValue">|{JSON.stringify(appState.value)}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("||");
});

test("initializes with bucket name and initial state value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" bucket="settings" initialValue="{{ mode: true }}"/>
      <Text testId="stateValue">|{appState.value.mode}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("|true|");
});

test("initializes with bucket name and multiple initial state value", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" bucket="settings" initialValue="{{ mode: true }}"/>
      <AppState id="appState2" bucket="settings" initialValue="{{ otherMode: 123 }}"/>
      <Text testId="stateValue">|{appState.value.mode}|{appState.value.otherMode}|</Text>
    </Fragment>
  `);

  // AppState should initialize with default bucket and display the correct value
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("|true|123|");
});

test("updates state using the update API", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" initialValue="{{ counter: 0 }}" />
      <Button testId="updateBtn" onClick="appState.update({ counter: appState.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
    </Fragment>
  `);

  // Check initial state
  await expect(page.getByTestId("stateValue")).toHaveText('{"counter":0}');

  // Update state by clicking button
  await page.getByTestId("updateBtn").click();

  // Check updated state
  await expect(page.getByTestId("stateValue")).toHaveText('{"counter":1}');
});

test("updates state using the update API (using backet name)", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState" bucket="settings" initialValue="{{ counter: 0 }}" />
      <Button testId="updateBtn" onClick="appState.update({ counter: appState.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
    </Fragment>
  `);

  // Check initial state
  await expect(page.getByTestId("stateValue")).toHaveText('{"counter":0}');

  // Update state by clicking button
  await page.getByTestId("updateBtn").click();

  // Check updated state
  await expect(page.getByTestId("stateValue")).toHaveText('{"counter":1}');
});

// =============================================================================
// STATE SHARING TESTS
// =============================================================================

test("shares state between multiple instances with the default bucket", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState1" initialValue="{{ counter: 0 }}" />
      <AppState id="appState2" />
      <Button testId="updateBtn" onClick="appState1.update({ counter: appState1.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="stateValue1">{JSON.stringify(appState1.value)}</Text>
      <Text testId="stateValue2">{JSON.stringify(appState2.value)}</Text>
    </Fragment>
  `);

  // Check initial state in both instances
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":0}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":0}');

  // Update state through first instance
  await page.getByTestId("updateBtn").click();

  // Both instances should reflect the change
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":1}');
});

test("shares state between multiple instances with a specific bucket", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState1" initialValue="{{ counter: 0 }}" bucket="bucket1" />
      <AppState id="appState2" bucket="bucket1" />
      <Button testId="updateBtn" onClick="appState1.update({ counter: appState1.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="stateValue1">{JSON.stringify(appState1.value)}</Text>
      <Text testId="stateValue2">{JSON.stringify(appState2.value)}</Text>
    </Fragment>
  `);

  // Check initial state in both instances
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":0}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":0}');

  // Update state through first instance
  await page.getByTestId("updateBtn").click();

  // Both instances should reflect the change
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":1}');
});

test("maintains separate states for different buckets", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState id="appState1" initialValue="{{ counter: 0 }}" bucket="bucket1" />
      <AppState id="appState2" initialValue="{{ counter: 0 }}" bucket="bucket2" />
      <Button testId="updateBtn" onClick="appState1.update({ counter: appState1.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="stateValue1">{JSON.stringify(appState1.value)}</Text>
      <Text testId="stateValue2">{JSON.stringify(appState2.value)}</Text>
    </Fragment>
  `);

  // Check initial state in both instances
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":0}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":0}');

  // Update state through first instance
  await page.getByTestId("updateBtn").click();

  // Only the first instance should reflect the change
  await expect(page.getByTestId("stateValue1")).toHaveText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toHaveText('{"counter":0}');
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("handles undefined initialValue gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" initialValue="{undefined}" />
      <Text testId="stateValue">|{JSON.stringify(appState.value)}|</Text>
    </Fragment>
  `);

  // Should not throw error with undefined initialValue
  await expect(page.getByTestId("stateValue")).toBeVisible();
  await expect(page.getByTestId("stateValue")).toHaveText("||");
});

test("handles complex nested state updates correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AppState
        id="appState"
        initialValue="{{ user: { name: 'John', profile: { age: 30, roles: ['admin'] } } }}"
      />
      <Button testId="updateBtn" 
        onClick="appState.update({ 
          user: { ...appState.value.user, 
          profile: { ...appState.value.user.profile, age: 31 } } 
        })">
        Update Age
      </Button>
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
    </Fragment>
  `);

  // Check initial state
  await expect(page.getByTestId("stateValue")).toContainText('"age":30');

  // Update nested property
  await page.getByTestId("updateBtn").click();

  // Check updated nested property
  await expect(page.getByTestId("stateValue")).toContainText('"age":31');
  // Check other properties remain unchanged
  await expect(page.getByTestId("stateValue")).toContainText('"name":"John"');
  await expect(page.getByTestId("stateValue")).toContainText('"roles":["admin"]');
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test("handles multiple rapid state updates efficiently", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment var.clickCount="{0}">
      <AppState id="appState" initialValue="{{ counter: 0 }}" />
      <Button 
        testId="updateBtn" 
        onClick="appState.update({ counter: appState.value.counter + 1 }); clickCount = clickCount + 1;">
        Increment
      </Button>
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
      <Text testId="clickCount">{clickCount}</Text>
    </Fragment>
  `);

  // Perform multiple rapid clicks
  for (let i = 0; i < 5; i++) {
    await page.getByTestId("updateBtn").click();
  }

  // Verify click count
  await expect(page.getByTestId("clickCount")).toHaveText("5");

  // Verify state was updated correctly
  await expect(page.getByTestId("stateValue")).toContainText('{"counter":5}');
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("integrates with other components that consume app state", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState id="appState" initialValue="{{ theme: 'light', fontSize: 14 }}" />
      <Fragment var.currentTheme="initial">
        <Button testId="themeBtn" onClick="currentTheme = appState.value.theme">
          Get Theme
        </Button>
        <Text testId="themeValue">{currentTheme}</Text>
      </Fragment>
    </Fragment>
  `);

  // Get the theme value by clicking button
  await page.getByTestId("themeBtn").click();

  // Check that the value was correctly retrieved from AppState
  await expect(page.getByTestId("themeValue")).toHaveText("light");
});

test("works correctly when wrapped in conditional rendering", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment var.showState="{false}">
      <Fragment when="{showState}">
        <Text>AppState is visible</Text>
        <AppState id="appState" initialValue="{{ visible: true }}" />
      </Fragment>
      <Button testId="toggleBtn" onClick="showState = !showState">Toggle AppState</Button>
      <Text testId="visibilityStatus">{appState.value.visible ? 'Visible' : 'Hidden'}</Text>
    </Fragment>
  `);

  // Initially the AppState component should be rendered
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Hidden");

  // Toggle the component's visibility
  await page.getByTestId("toggleBtn").click();
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Visible");

  // Toggle it back: The AppState component is hidden, but the state is still remain
  // there. It should work this way.
  await page.getByTestId("toggleBtn").click();
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Visible");
});
