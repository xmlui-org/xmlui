import { expect, test } from "../../testing/fixtures";

test.describe("AppState foundation", () => {
  test("initializes with default props and bucket-specific initial values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <AppState id="empty" />
      <AppState id="settings" bucket="settings" initialValue="{{ mode: true }}" />
      <AppState id="settingsMore" bucket="settings" initialValue="{{ otherMode: 123 }}" />
      <Text testId="empty">|{JSON.stringify(empty.value)}|</Text>
      <Text testId="settings">|{settings.value.mode}|{settingsMore.value.otherMode}|</Text>
    `);

    await expect(page.getByTestId("empty")).toHaveText("||");
    await expect(page.getByTestId("settings")).toHaveText("|true|123|");
  });

  test("initializes and updates shared default bucket state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="stateOne" initialValue="{{ counter: 0 }}" />
      <AppState id="stateTwo" />
      <Button testId="inc" onClick="stateOne.update({ counter: stateOne.value.counter + 1 })">Increment</Button>
      <Text testId="one">{stateOne.value.counter}</Text>
      <Text testId="two">{stateTwo.value.counter}</Text>
    `);

    await expect(page.getByTestId("one")).toHaveText("0");
    await expect(page.getByTestId("two")).toHaveText("0");
    await page.getByTestId("inc").click();
    await expect(page.getByTestId("one")).toHaveText("1");
    await expect(page.getByTestId("two")).toHaveText("1");
  });

  test("keeps separate bucket values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="left" bucket="left" initialValue="{{ counter: 0 }}" />
      <AppState id="right" bucket="right" initialValue="{{ counter: 10 }}" />
      <Button testId="inc" onClick="left.update({ counter: left.value.counter + 1 })">Increment</Button>
      <Text testId="left">{left.value.counter}</Text>
      <Text testId="right">{right.value.counter}</Text>
    `);

    await page.getByTestId("inc").click();
    await expect(page.getByTestId("left")).toHaveText("1");
    await expect(page.getByTestId("right")).toHaveText("10");
  });

  test("list helpers update and query list properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="selection" initialValue="{{ ids: [1] }}" />
      <Button testId="append" onClick="selection.appendToList('ids', 2)">Append</Button>
      <Button testId="remove" onClick="selection.removeFromList('ids', 1)">Remove</Button>
      <Text testId="value">{selection.value.ids.join('|')}</Text>
    `);

    await expect(page.getByTestId("value")).toHaveText("1");
    await page.getByTestId("append").click();
    await expect(page.getByTestId("value")).toHaveText("1|2");
    await page.getByTestId("remove").click();
    await expect(page.getByTestId("value")).toHaveText("2");
  });

  test("didUpdate receives new and previous values", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <AppState
        id="state"
        initialValue="{{ counter: 0 }}"
        onDidUpdate="info => testState = info.bucket + ':' + (info.previousValue ? info.previousValue.counter : 'none') + '>' + info.value.counter" />
      <Button testId="inc" onClick="state.update({ counter: state.value.counter + 1 })">Increment</Button>
    `);

    await page.getByTestId("inc").click();
    await expect.poll(testStateDriver.testState).toEqual("default:0>1");
  });

  test("handles undefined initialValue and complex nested updates", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <AppState id="empty" bucket="empty-bucket" initialValue="{undefined}" />
      <AppState
        id="profile"
        initialValue="{{ user: { name: 'John', profile: { age: 30, roles: ['admin'] } } }}" />
      <Button
        testId="age"
        onClick="profile.update({ user: { ...profile.value.user, profile: { ...profile.value.user.profile, age: 31 } } })">
        Update
      </Button>
      <Text testId="empty">|{JSON.stringify(empty.value)}|</Text>
      <Text testId="profile">{JSON.stringify(profile.value)}</Text>
    `);

    await expect(page.getByTestId("empty")).toHaveText("||");
    await expect(page.getByTestId("profile")).toContainText('"age":30');
    await page.getByTestId("age").click();
    await expect(page.getByTestId("profile")).toContainText('"age":31');
    await expect(page.getByTestId("profile")).toContainText('"name":"John"');
    await expect(page.getByTestId("profile")).toContainText('"roles":["admin"]');
  });

  test("supports old ref alias without rendering a wrapper", async ({ initTestBed, page }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px" />
        <AppState testId="appState" ref="appState" initialValue="{undefined}" />
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px" />
      </FlowLayout>
      <Text testId="stateValue">|{JSON.stringify(appState.value)}|</Text>
    `);

    await expect(page.getByTestId("stateValue")).toHaveText("||");
    await expect(page.getByTestId("appState")).not.toBeAttached();
  });

  test("updates shared state from arrow event handlers across nested components", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App>
          <AppState id="appState" initialValue="{{ enhancedMode: false }}" />
          <VStack gap="$space-4" padding="$space-4">
            <Checkbox
              testId="enhanced"
              label="Enhanced mode"
              initialValue="{appState.value.enhancedMode}"
              onDidChange="v => appState.update({ enhancedMode: v })" />
            <Component1 />
            <Component2 />
          </VStack>
        </App>
      `,
      {
        components: [
          `
            <Component name="Component1">
              <AppState id="state" />
              <H3 testId="enhancedText" when="{state.value.enhancedMode}">I am in enhanced mode!</H3>
              <Text testId="normalText" when="{!state.value.enhancedMode}">Enhanced mode turned off.</Text>
            </Component>
          `,
          `
            <Component name="Component2">
              <AppState id="state" />
              <Button testId="options" enabled="{state.value.enhancedMode}">Set enhanced options</Button>
            </Component>
          `,
        ],
      },
    );

    await expect(page.getByTestId("normalText")).toBeVisible();
    await expect(page.getByTestId("enhancedText")).not.toBeAttached();
    await expect(page.getByTestId("options")).toBeDisabled();

    await page.getByLabel("Enhanced mode").click();

    await expect(page.getByTestId("enhancedText")).toBeVisible();
    await expect(page.getByTestId("normalText")).not.toBeAttached();
    await expect(page.getByTestId("options")).toBeEnabled();
  });

  test("preserves bucket state across conditional AppState unmount", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.showState="{false}">
        <Fragment when="{showState}">
          <AppState id="state" initialValue="{{ visible: true }}" />
        </Fragment>
        <Button testId="toggle" onClick="showState = !showState">Toggle</Button>
        <Text testId="status">{state.value.visible ? 'Visible' : 'Hidden'}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("status")).toHaveText("Hidden");
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("status")).toHaveText("Visible");
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("status")).toHaveText("Visible");
  });
});
