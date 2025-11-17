import { SKIP_REASON } from "../src/testing/component-test-helpers";
import { expect, test } from "../src/testing/fixtures";

test("static coumpound component renders", async ({ page, initTestBed }) => {
  const EXPECTED_TEXT = "Test content text";
  await initTestBed(`<Custom />`, {
    components: [
      `
        <Component name="Custom">
          <Text>${EXPECTED_TEXT}</Text>
        </Component>
      `,
    ],
  });
  await expect(page.getByText(EXPECTED_TEXT)).toBeVisible();
});

test("props work with compound components", async ({ page, initTestBed }) => {
  const EXPECTED_TEXT = "Test content text";
  await initTestBed(`<Custom testProp="${EXPECTED_TEXT}"/>`, {
    components: [
      `
      <Component name="Custom">
        <Text>{$props.testProp}</Text>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_TEXT)).toBeVisible();
});

test("can't overwrite $props", async ({ page, initTestBed }) => {
  const EXPECTED_TEXT = "Test content text";
  await initTestBed(`<Custom testProp="${EXPECTED_TEXT}"/>`, {
    components: [
      `
      <Component name="Custom">
        <Text>{$props.testProp}</Text>
        <Button testId="buttonId" onClick="$props.testProp = 'SHOULD NOT WORK'"/>
      </Component>
    `,
    ],
  });
  await page.getByTestId("buttonId").click();
  await expect(page.getByText(EXPECTED_TEXT)).toBeVisible();
});

test("ChildSlot rendered in compound components", async ({ page, initTestBed }) => {
  const EXPECTED_TEXT_COMPONENT = "Test content defined in the component";
  const EXPECTED_TEXT_CHILDREN = "Test content inside children";
  await initTestBed(
    `
      <Custom>
        <Text>${EXPECTED_TEXT_CHILDREN}</Text>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <VStack>
          <Text>${EXPECTED_TEXT_COMPONENT}</Text>
          <Slot/>
        </VStack>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_TEXT_COMPONENT)).toBeVisible();
  await expect(page.getByText(EXPECTED_TEXT_CHILDREN)).toBeVisible();
});

test("Default slot rendered in compound components", async ({ page, initTestBed }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  await initTestBed(`<Custom></Custom>`, {
    components: [
      `
      <Component name="Custom">
        <Slot name="myTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_DEFAULT_SLOT)).toBeVisible();
});

test("Default slot not rendered in compound components with no 'Template' slot", async ({
  page,
  initTestBed,
}) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Slot name="my">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText("'Template'", { exact: false })).toBeVisible();
});

test("Default slot overwritten in compound components #1", async ({ page, initTestBed }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  const EXPECTED_OVERRIDE = "This is an override";
  await initTestBed(
    `
      <Custom>
        <property name="myTemplate">
          <Text>${EXPECTED_OVERRIDE}</Text>
        </property>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <Slot name="myTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_OVERRIDE)).toBeVisible();
});

test("Multiple default slots rendered in compound components", async ({ page, initTestBed }) => {
  const EXPECTED_DEFAULT_SLOT = "Default slot content";
  const EXPECTED_DEFAULT_OTHER_SLOT = "Default other slot content";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Slot name="defaultTemplate">
          <Text>${EXPECTED_DEFAULT_SLOT}</Text>
        </Slot>
        <Slot name="otherTemplate">
          <Text>${EXPECTED_DEFAULT_OTHER_SLOT}</Text>
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_DEFAULT_SLOT)).toBeVisible();
  await expect(page.getByText(EXPECTED_DEFAULT_OTHER_SLOT)).toBeVisible();
});

test("Slot context value works #1", async ({ page, initTestBed }) => {
  const EXPECTED_CONTEXT_VALUE = "123";
  await initTestBed(
    `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue}</Text>
        </property>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <Slot name="myTemplate" myValue="{123}">
          <Text>Dummy default text</Text>
        </Slot>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_CONTEXT_VALUE)).toBeVisible();
});

test("Slot context value works #2", async ({ page, initTestBed }) => {
  const EXPECTED_CONTEXT_VALUE = "123";
  await initTestBed(
    `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue}</Text>
        </property>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <Slot name="myTemplate" myValue="{123}" />
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_CONTEXT_VALUE)).toBeVisible();
});

test("Slot context value works #3", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "123hello!";
  await initTestBed(
    `
      <Custom>
        <property name="myTemplate">
          <Text>{$myValue1}{$myValue2}</Text>
        </property>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <Slot name="myTemplate" myValue1="{123}" myValue2="hello!" />
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE)).toBeVisible();
});

test("Slot context value works #4", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "123hello!";
  await initTestBed(
    `
      <Custom>
        <Text>{$myValue1}{$myValue2}</Text>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <Slot myValue1="{123}" myValue2="hello!" />
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE)).toBeVisible();
});

test("Default slot content rendered #1", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "Hello";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Slot>
          Hello
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_VALUE)).toBeVisible();
});

test("Default slot content rendered #2", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "Hello";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Slot>
          <![CDATA[
          Hello
          ]]>
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_VALUE)).toBeVisible();
});

test("Default slot content rendered #3", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Hello";
  const EXPECTED_VALUE2 = "Hi";
  await initTestBed(`<Custom>Hi</Custom>`, {
    components: [
      `
      <Component name="Custom">
        <VStack>
          <Slot name="otherTemplate">
            Hello
          </Slot>
          <Slot />
        </VStack>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(`${EXPECTED_VALUE1} ${EXPECTED_VALUE2}`)).toBeVisible();
});

test("Markdown with a single slot", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Hello, world!";
  const EXPECTED_VALUE2 = "Here I am";
  await initTestBed(
    `
      <Custom>
        <![CDATA[
## ${EXPECTED_VALUE1}

${EXPECTED_VALUE2}
        ]]>
      </Custom>
    `,
    {
      components: [
        `
      <Component name="Custom">
        <VStack>
          <Markdown>
            <Slot />
          </Markdown>
        </VStack>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByRole("heading", { name: "Hello, world!" })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
});

test("Markdown with multiple slots", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "Hello, world!";

  await initTestBed(
    `<Custom>
      ${EXPECTED_VALUE}
    </Custom>`,
    {
      components: [
        `<Component name="Custom">
          <VStack>
            <Markdown testId="content">
              <Slot />
              <Slot />
            </Markdown>
          </VStack>
        </Component>`,
      ],
    },
  );

  await expect(page.getByTestId("content")).toHaveText(`${EXPECTED_VALUE} ${EXPECTED_VALUE}`);
});

test("Markdown with a single+default slot", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Howdy!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";
  await initTestBed(
    `
      <Custom>
        <![CDATA[
## ${EXPECTED_VALUE2}

${EXPECTED_VALUE3}
        ]]>
      </Custom>
    `,
    {
      components: [
        `
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
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3)).toBeVisible();
});

test("Markdown with a named+child #1", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";
  await initTestBed(
    `
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
    {
      components: [
        `
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
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3)).toBeVisible();
});

test("Markdown with a named+child #2", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";
  await initTestBed(
    `
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
    {
      components: [
        `
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
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3)).toBeVisible();
});

test("Markdown with a named+child #3", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";
  await initTestBed(
    `
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
    {
      components: [
        `
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
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3)).toBeVisible();
});

test("Markdown with a named+child #4", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE1 = "Greetings!";
  const EXPECTED_VALUE2 = "Hello, world!";
  const EXPECTED_VALUE3 = "Here I am";
  await initTestBed(
    `
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
    {
      components: [
        `
      <Component name="Custom">
        <Markdown>
          <Slot name="titleTemplate">
            Howdy!
          </Slot>
          <Slot />
        </Markdown>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByText(EXPECTED_VALUE1, { exact: false })).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE2)).toBeVisible();
  await expect(page.getByText(EXPECTED_VALUE3)).toBeVisible();
});

test("Slot with no 'Template' suffix", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "error";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Slot name="titleTemp">
          Howdy!
        </Slot>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_VALUE, { exact: false })).toBeVisible();
});

test("Markdown slot with no 'Template' suffix", async ({ page, initTestBed }) => {
  const EXPECTED_VALUE = "component problems";
  await initTestBed(`<Custom />`, {
    components: [
      `
      <Component name="Custom">
        <Markdown>
          <Slot name="titleTemp">
            Howdy!
          </Slot>
        </Markdown>
      </Component>
    `,
    ],
  });
  await expect(page.getByText(EXPECTED_VALUE, { exact: false })).toBeVisible();
});

test("$this works in compound components", async ({ page, initTestBed }) => {
  await initTestBed(`<TestButton testId="buttonComponent" onClick="$this.incrementInside()"/>`, {
    components: [
      `
      <Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
        <Button onClick="emitEvent('click')">Increment counter: {counter}</Button>
      </Component>
    `,
    ],
  });
  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("call api with id works in compound components", async ({ page, initTestBed }) => {
  await initTestBed(
    `<TestButton id="buttonComponent" onClick="buttonComponent.incrementInside()"/>`,
    {
      components: [
        `<Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
            <Button onClick="emitEvent('click')">Increment counter: {counter}</Button>
        </Component>`,
      ],
    },
  );

  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self works in compound components", async ({ page, initTestBed }) => {
  await initTestBed(`<TestButton testId="buttonComponent"/>`, {
    components: [
      `
      <Component name="TestButton" var.counter="{0}" method.incrementInside="()=>counter++">
        <Button onClick="$self.incrementInside()">Increment counter: {counter}</Button>
      </Component>
    `,
    ],
  });
  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self works in compound components - implicit container", async ({ page, initTestBed }) => {
  await initTestBed(`<TestButton testId="buttonComponent"/>`, {
    components: [
      `
      <Component name="TestButton" method.incrementInside="()=>counter++">
        <Button var.counter="{0}" onClick="$self.incrementInside()">Increment counter: {counter}</Button>
      </Component>
    `,
    ],
  });
  await page.getByTestId("buttonComponent").click();
  await expect(page.getByTestId("buttonComponent")).toHaveText("Increment counter: 1");
});

test("$self and $this works in nested compound components", async ({ page, initTestBed }) => {
  await initTestBed(`<TestButton1/>`, {
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
  });
  await page.getByTestId("buttonComponent1").click();
  await expect(page.getByTestId("buttonComponent1")).toHaveText("Increment counter: 1");

  await page.getByTestId("buttonComponent2").click();
  await expect(page.getByTestId("buttonComponent2")).toHaveText("TB2:Increment counter: 1");
});

test("$this works in Queue event handler", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Stack var.processed="{0}">
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
    `);
  await page.getByTestId("button").click();
  await expect(page.getByTestId("processed")).toHaveText("2");
  await expect(page.getByTestId("queueLength")).toHaveText("0");
});

test("method works with script", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment var.msg="">
      <MyComp id="myComp"/>
      <Button testId="trigger" onClick="() => msg = myComp.greet()">Greet</Button>
      <H2 testId="greeting">{msg}</H2>
    </Fragment>
  `,
    {
      components: [
        `
        <Component name="MyComp">
          <script>
            var hello="Hello from MyComp!"
          </script>
          <Text>{hello}</Text>
          <method name="greet">() => hello</method>
        </Component>
      `,
      ],
    },
  );

  const button = page.getByTestId("trigger");
  await button.click();
  await expect(page.getByTestId("greeting")).toHaveText("Hello from MyComp!");
});

test("updateState works", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <Fragment var.msg="">
      <MyComp id="myComp"/>
      <Text testId="helo">{myComp.value}</Text>
    </Fragment>
  `,
    {
      components: [
        `
        <Component name="MyComp">
          <TextArea onDidChange="value => {  console.log('ondidchange', value);  updateState({value: value}) }"/>
        </Component>
      `,
      ],
    },
  );

  await page.getByRole("textbox").fill("Hello from MyComp!");
  await expect(page.getByTestId("helo")).toHaveText("Hello from MyComp!");
});