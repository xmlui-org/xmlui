import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("static coumpound component renders", async ({ page }) => {
  const EXPECTED_TEXT = "Test content text";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Text>${EXPECTED_TEXT}</Text>
      </Component>
    `,
    entryPoint: `<Custom />`,
  });

  await expect(page.getByText(EXPECTED_TEXT, { exact: true })).toBeVisible();
});

test("props work with compound components", async ({ page }) => {
  const EXPECTED_TEXT = "Test content text";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Text>{$props.testProp}</Text>
      </Component>
    `,
    entryPoint: `<Custom testProp="${EXPECTED_TEXT}"/>`,
  });

  await expect(page.getByText(EXPECTED_TEXT, { exact: true })).toBeVisible();
});

test("can't overwrite $props", async ({ page }) => {
  const EXPECTED_TEXT = "Test content text";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Text>{$props.testProp}</Text>
        <Button testId="buttonId" onClick="$props.testProp = 'SHOULD NOT WORK'"/>
      </Component>
    `,
    entryPoint: `<Custom testProp="${EXPECTED_TEXT}"/>`,
  });

  await page.getByTestId("buttonId").click();
  await expect(page.getByText(EXPECTED_TEXT, { exact: true })).toBeVisible();
});

test("ChildSlot rendered in compound components", async ({ page }) => {
  const EXPECTED_TEXT_COMPONENT = "Test content defined in the component";
  const EXPECTED_TEXT_CHILDREN = "Test content inside children";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Text>${EXPECTED_TEXT_COMPONENT}</Text>
          <Slot/>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <Text>${EXPECTED_TEXT_CHILDREN}</Text> 
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_TEXT_COMPONENT, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_TEXT_CHILDREN, { exact: true })).toBeVisible();
});

test("$this works in compound components", async ({ page }) => {
  await initApp(page, {
    components: `
        <Component name="TestButton" var.counter="{0}" api.incrementInside="()=>counter++">
            <Button onClick="emitEvent('click')">Increment counter: {counter}</Button>
        </Component>
    `,
    entryPoint: `
        <TestButton testId="buttonComponent" onClick="$this.incrementInside()"/>
    `,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("call api with id works in compound components", async ({ page }) => {
  await initApp(page, {
    components: `
        <Component name="TestButton" var.counter="{0}" api.incrementInside="()=>counter++">
            <Button onClick="emitEvent('click')">Increment counter: {counter}</Button>
        </Component>
    `,
    entryPoint: `
        <TestButton id="buttonComponent" onClick="buttonComponent.incrementInside()"/>
    `,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self works in compound components", async ({ page }) => {
  await initApp(page, {
    components: `
        <Component name="TestButton" var.counter="{0}" api.incrementInside="()=>counter++">
            <Button onClick="$self.incrementInside()">Increment counter: {counter}</Button>
        </Component>
    `,
    entryPoint: `
        <TestButton testId="buttonComponent"/>
    `,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self works in compound components - implicit container", async ({ page }) => {
  await initApp(page, {
    components: `
        <Component name="TestButton" api.incrementInside="()=>counter++">
            <Button var.counter="{0}" onClick="$self.incrementInside()">Increment counter: {counter}</Button>
        </Component>
    `,
    entryPoint: `
        <TestButton testId="buttonComponent"/>
    `,
  });

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self and $this works in nested compound components", async ({ page }) => {
  await initApp(page, {
    components: [
      `
        <Component name="TestButton1" var.counter="{0}" api.incrementInside="()=>counter++">
            <Button onClick="$self.incrementInside()" testId="buttonComponent1">Increment counter: {counter}</Button>
            <TestButton2 onClick="$this.incrementInside()" testId="buttonComponent2"/>
        </Component>
    `,
      `
        <Component name="TestButton2" var.counter="{0}" api.incrementInside="()=>counter++">
            <Button onClick="$self.incrementInside()">TB2:Increment counter: {counter}</Button>
        </Component>
    `,
    ],
    entryPoint: `
        <TestButton1/>
    `,
  });

  await page.getByTestId("buttonComponent1").click();
  await expect(page.getByTestId("buttonComponent1")).toHaveText("Increment counter: 1");

  await page.getByTestId("buttonComponent2").click();
  await expect(page.getByTestId("buttonComponent2")).toHaveText("TB2:Increment counter: 1");
});

test("$this works in Queue event handler", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <Stack padding="1rem" gap="0.5rem" var.processed="{0}">
      <Button
        label="Add a new file to the queue"
        testId="button" 
        onClick="{myQueue.enqueueItem({name: 'duplicate-me'})}" />
      <Queue 
        id="myQueue"
        onProcess="processing => 
          {
             if (processing.item.name === 'duplicate-me') {
               $this.enqueueItem({name: 'dont-duplicate-me'});
             }
             processed++;
          }
        ">
      </Queue>
      <Text testId="queueLength">{myQueue.getQueueLength()}</Text>
      <Text testId="processed">{processed}</Text>
    </Stack>
    `,
  });
  await page.getByTestId("button").click();
  await expect(page.getByTestId("processed")).toHaveText("2");
  await expect(page.getByTestId("queueLength")).toHaveText("0");
});