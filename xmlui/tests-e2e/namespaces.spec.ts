import { SKIP_REASON } from "../src/testing/component-test-helpers";
import { expect, test } from "../src/testing/fixtures";

test("core button renders without namespace", async ({ page, initTestBed }) => {
  await initTestBed(`<App><Button testId="button">CORE</Button></App>`, {
    components: [
      `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
    ],
  });
  await expect(page.getByTestId("button")).toHaveText("CORE");
});

test("core button renders with XMLUI namespace", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <App xmlns:XMLUI="core-ns">
      <XMLUI:Button testId="button">CORE</XMLUI:Button>
    </App>`,
    {
      components: [
        `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByTestId("button")).toHaveText("CORE");
});

test("compound component button renders with app-ns namespace", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <App xmlns:My="app-ns">
      <My:Button testId="button">CORE</My:Button>
    </App>`,
    {
      components: [
        `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByTestId("button")).toHaveText("COMPOUND COMPONENT");
});

test("compound component renders without namespace (no name-conflict with core component)", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `
    <App>
      <MyButton testId="button">CORE</MyButton>
    </App>`,
    {
      components: [
        `
      <Component name="MyButton">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
      ],
    },
  );
  await expect(page.getByTestId("button")).toHaveText("COMPOUND COMPONENT");
});

test.fixme(
  "extension renders with namespace (component-ns)",
  SKIP_REASON.TEST_NOT_WORKING("Throws error on render"),
  async ({ page, initTestBed }) => {
    await initTestBed(`
    <App xmlns:TEST_NS="component-ns">
      <TEST_NS:TestComponent testId="testComp">EXTENSION CONTENT</TEST_NS:TestComponent>
    </App>`);
    await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
  },
);

test.fixme(
  "extension renders with namespace (component-ns:namespace)",
  SKIP_REASON.TEST_NOT_WORKING("Throws error on render"),
  async ({ page, initTestBed }) => {
    await initTestBed(`
    <App xmlns:ExtensionAlias="component-ns:TEST_NS">
      <ExtensionAlias:TestComponent testId="testComp">
        EXTENSION CONTENT
      </ExtensionAlias:TestComponent>
    </App>`);
    await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
  },
);

test("extension doesn't render without namespace", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <TestComponent testId="testComp">EXTENSION CONTENT</TestComponent>
    </App>`);
  await expect(page.getByTestId("testComp")).not.toBeVisible();
});

test.fixme(
  "XMLUIExtensions extension does render without namespace",
  SKIP_REASON.TEST_NOT_WORKING("Throws error on render"),
  async ({ page, initTestBed }) => {
    await initTestBed(`
    <App>
      <TestComponentInXMLUIExtensionsNamespace testId="testComp">
        EXTENSION CONTENT
      </TestComponentInXMLUIExtensionsNamespace>
    </App>`);
    await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
  },
);
