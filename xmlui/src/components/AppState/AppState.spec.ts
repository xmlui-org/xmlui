import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("initializes with default props", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" />
      <Text testId="stateValue">{JSON.stringify(appState)}</Text>
    </Fragment>
  `);
  
  // AppState should initialize with default bucket
  await expect(page.getByTestId("stateValue")).toBeVisible();
});

test.skip("initializes with provided bucket name", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" bucket="customBucket" />
      <Text testId="stateValue">{JSON.stringify(appState)}</Text>
    </Fragment>
  `);
  
  // AppState should initialize with custom bucket
  await expect(page.getByTestId("stateValue")).toBeVisible();
});

test.skip("initializes with initial state value", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  const initialValue = { counter: 0, name: "test" };
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" initialValue={{ counter: 0, name: "test" }} />
      <Text testId="stateValue">{JSON.stringify(appState)}</Text>
    </Fragment>
  `);
  
  // Should display the initial state
  await expect(page.getByTestId("stateValue")).toContainText(JSON.stringify(initialValue));
});

test.skip("updates state using the update API", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" initialValue={{ counter: 0 }} />
      <Button testId="updateBtn" onClick="appState.update({ counter: appState.value.counter + 1 })">Increment</Button>
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
    </Fragment>
  `);
  
  // Check initial state
  await expect(page.getByTestId("stateValue")).toContainText('{"counter":0}');
  
  // Update state by clicking button
  await page.getByTestId("updateBtn").click();
  
  // Check updated state
  await expect(page.getByTestId("stateValue")).toContainText('{"counter":1}');
});

// =============================================================================
// STATE SHARING TESTS
// =============================================================================

test.skip("shares state between multiple instances with same bucket", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState1" bucket="sharedBucket" initialValue={{ counter: 0 }} />
      <AppState ref="appState2" bucket="sharedBucket" />
      <Button testId="updateBtn" onClick="appState1.update({ counter: appState1.value.counter + 1 })">Increment</Button>
      <Text testId="stateValue1">{JSON.stringify(appState1.value)}</Text>
      <Text testId="stateValue2">{JSON.stringify(appState2.value)}</Text>
    </Fragment>
  `);
  
  // Check initial state in both instances
  await expect(page.getByTestId("stateValue1")).toContainText('{"counter":0}');
  await expect(page.getByTestId("stateValue2")).toContainText('{"counter":0}');
  
  // Update state through first instance
  await page.getByTestId("updateBtn").click();
  
  // Both instances should reflect the change
  await expect(page.getByTestId("stateValue1")).toContainText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toContainText('{"counter":1}');
});

test.skip("maintains separate states for different buckets", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState1" bucket="bucket1" initialValue={{ counter: 0 }} />
      <AppState ref="appState2" bucket="bucket2" initialValue={{ counter: 10 }} />
      <Button testId="updateBtn1" onClick="appState1.update({ counter: appState1.value.counter + 1 })">Increment Bucket 1</Button>
      <Button testId="updateBtn2" onClick="appState2.update({ counter: appState2.value.counter + 1 })">Increment Bucket 2</Button>
      <Text testId="stateValue1">{JSON.stringify(appState1.value)}</Text>
      <Text testId="stateValue2">{JSON.stringify(appState2.value)}</Text>
    </Fragment>
  `);
  
  // Check initial states
  await expect(page.getByTestId("stateValue1")).toContainText('{"counter":0}');
  await expect(page.getByTestId("stateValue2")).toContainText('{"counter":10}');
  
  // Update bucket 1
  await page.getByTestId("updateBtn1").click();
  await expect(page.getByTestId("stateValue1")).toContainText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toContainText('{"counter":10}');
  
  // Update bucket 2
  await page.getByTestId("updateBtn2").click();
  await expect(page.getByTestId("stateValue1")).toContainText('{"counter":1}');
  await expect(page.getByTestId("stateValue2")).toContainText('{"counter":11}');
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("handles undefined initialValue gracefully", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState ref="appState" initialValue={undefined} />
      <Text testId="stateValue">{JSON.stringify(appState.value)}</Text>
    </Fragment>
  `);
  
  // Should not throw error with undefined initialValue
  await expect(page.getByTestId("stateValue")).toBeVisible();
});

test.skip("handles complex nested state updates correctly", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState 
        ref="appState" 
        initialValue={{ user: { name: "John", profile: { age: 30, roles: ["admin"] } } }} 
      />
      <Button testId="updateBtn" onClick="appState.update({ user: { ...appState.value.user, profile: { ...appState.value.user.profile, age: 31 } } })">Update Age</Button>
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

test.skip("handles multiple rapid state updates efficiently", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment var.clickCount="0">
      <AppState ref="appState" initialValue={{ counter: 0 }} />
      <Button testId="updateBtn" onClick="appState.update({ counter: appState.value.counter + 1 }); clickCount = clickCount + 1;">Increment</Button>
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

test.skip("integrates with other components that consume app state", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment>
      <AppState bucket="userPrefs" initialValue={{ theme: "light", fontSize: 14 }} />
      <Fragment var.currentTheme="initial">
        <Button testId="themeBtn" onClick="currentTheme = appState.userPrefs.theme">Get Theme</Button>
        <Text testId="themeValue">{currentTheme}</Text>
      </Fragment>
    </Fragment>
  `);
  
  // Get the theme value by clicking button
  await page.getByTestId("themeBtn").click();
  
  // Check that the value was correctly retrieved from AppState
  await expect(page.getByTestId("themeValue")).toHaveText("light");
});

test.skip("works correctly when wrapped in conditional rendering", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <Fragment var.showState="true">
      <If condition="{showState}">
        <AppState ref="appState" initialValue={{ visible: true }} />
      </If>
      <Button testId="toggleBtn" onClick="showState = !showState">Toggle AppState</Button>
      <Text testId="visibilityStatus">{showState ? 'Visible' : 'Hidden'}</Text>
    </Fragment>
  `);
  
  // Initially the AppState component should be rendered
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Visible");
  
  // Toggle the component's visibility
  await page.getByTestId("toggleBtn").click();
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Hidden");
  
  // Toggle it back
  await page.getByTestId("toggleBtn").click();
  await expect(page.getByTestId("visibilityStatus")).toHaveText("Visible");
});
