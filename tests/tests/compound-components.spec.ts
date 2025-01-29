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

test("Default slot rendered in compound components", async ({ page }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="myTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_DEFAULT_SLOT, { exact: true })).toBeVisible();
});

test("Default slot not rendered in compound components with no 'Template' slot", async ({ page }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="my">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom>
      </Custom>
    `,
  });

  await expect(page.getByText("'Template'", { exact: false })).toBeVisible();
});

test("Default slot overwritten in compound components #1", async ({ page }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  const EXPECTED_OVERRIDE = "This is an override";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="myTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="myTemplate">
          <Text>${EXPECTED_OVERRIDE}</Text>
        </property>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_OVERRIDE, { exact: true })).toBeVisible();
});

test("Multiple default slots rendered in compound components", async ({ page }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  const EXPECTED_DEFAULT_OTHER_SLOT = "Default other slot content";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="defaultTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
        <Slot name="otherTemplate">
          <Text>${EXPECTED_DEFAULT_OTHER_SLOT}</Text>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_DEFAULT_SLOT, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_DEFAULT_OTHER_SLOT, { exact: true })).toBeVisible();
});

test("Slot context value works #1", async ({ page }) => {
  const EXPECTED_CONTEXT_VALUE = "123";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="myTemplate" myValue="{123}">
          <Text>Dummy default text</Text>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue}</Text>
        </property>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_CONTEXT_VALUE, { exact: true })).toBeVisible();
});

test("Slot context value works #2", async ({ page }) => {
  const EXPECTED_CONTEXT_VALUE = "123";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="myTemplate" myValue="{123}" />
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue}</Text>
        </property>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_CONTEXT_VALUE, { exact: true })).toBeVisible();
});

test("Slot context value works #3", async ({ page }) => {
  const EXPECTED_VALUE = "123hello!";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot name="myTemplate" myValue1="{123}" myValue2="hello!" />
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue1}{$myValue2}</Text>
        </property>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE, { exact: true })).toBeVisible();
});

test("Slot context value works #4", async ({ page }) => {
  const EXPECTED_VALUE = "123hello!";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot myValue1="{123}" myValue2="hello!" />
      </Component>
    `,
    entryPoint: `
      <Custom>
        <Text>{$myValue1}{$myValue2}</Text>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE, { exact: true })).toBeVisible();
});

test("Default slot content rendered #1", async ({ page }) => {
  const EXPECTED_VALUE = "Hello";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot>
          Hello
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom />
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE, { exact: true })).toBeVisible();
});

test("Default slot content rendered #2", async ({ page }) => {
  const EXPECTED_VALUE = "Hello";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Slot>
          <![CDATA[
          Hello
          ]]>
        </Slot>
      </Component>
    `,
    entryPoint: `
      <Custom />
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE, { exact: true })).toBeVisible();
});

test("Default slot content rendered #3", async ({ page }) => {
  const EXPECTED_VALUE1 = "Hello";
  const EXPECTED_VALUE2 = "Hi";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Slot name="otherTemplate">
            Hello
          </Slot>
          <Slot />
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        Hi
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: false })).toBeVisible();
});

test("Markdown with a single slot", async ({ page }) => {
  const EXPECTED_VALUE1 = "Hello, world!";
  const EXPECTED_VALUE2 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <![CDATA[
## ${EXPECTED_VALUE1}

${EXPECTED_VALUE2}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
});

test("Markdown with multiple slots", async ({ page }) => {
  const EXPECTED_VALUE1 = "Hello, world!";
  const EXPECTED_VALUE2 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Markdown>
            <Slot />
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <![CDATA[
## ${EXPECTED_VALUE1}

${EXPECTED_VALUE2}
        ]]>
      </Custom>
    `,
  });

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toBe(`${EXPECTED_VALUE1}\n${EXPECTED_VALUE2}\n${EXPECTED_VALUE1}\n${EXPECTED_VALUE2}`);
});

test("Markdown with a single+default slot", async ({ page }) => {
  const EXPECTED_VALUE1 = "Howdy!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Slot name="titleTemplate">
            ${EXPECTED_VALUE1}
          </Slot>    
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3, { exact: true })).toBeVisible();
});

test("Markdown with a named+child #1", async ({ page }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Slot name="titleTemplate">
            Howdy!
          </Slot>    
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="titleTemplate">
          ${EXPECTED_VALUE1}
        </property>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3, { exact: true })).toBeVisible();
});

test("Markdown with a named+child #2", async ({ page }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Slot name="titleTemplate">
            Howdy!
          </Slot>    
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="titleTemplate">
          <![CDATA[
            ${EXPECTED_VALUE1}
          ]]>
        </property>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3, { exact: true })).toBeVisible();
});

test("Markdown with a named+child #3", async ({ page }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <VStack>
          <Slot name="titleTemplate">
            Howdy!
          </Slot>    
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="titleTemplate">
          <![CDATA[
            ${EXPECTED_VALUE1}
          ]]>
        </property>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3, { exact: true })).toBeVisible();
});

test("Markdown with a named+child #4", async ({ page }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";

  await initApp(page, {
    components: `
      <Component name="Custom">
        <Markdown>
          <Slot name="titleTemplate">
            Howdy!
          </Slot>    
          <Slot />
        </Markdown>
      </Component>
    `,
    entryPoint: `
      <Custom>
        <property name="titleTemplate">
          ${EXPECTED_VALUE1}
        </property>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
  });

  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2, { exact: true })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3, { exact: true })).toBeVisible();
});

test("$this works in compound components", async ({ page }) => {
  await initApp(page, {
    components: `
        <Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
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
        <Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
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
        <Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
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
        <Component name="TestButton" method.incrementInside="()=>counter++">
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
        <Component name="TestButton1" var.counter="{0}" method.incrementInside="()=>counter++">
            <Button onClick="$self.incrementInside()" testId="buttonComponent1">Increment counter: {counter}</Button>
            <TestButton2 onClick="$this.incrementInside()" testId="buttonComponent2"/>
        </Component>
    `,
      `
        <Component name="TestButton2" var.counter="{0}" method.incrementInside="()=>counter++">
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