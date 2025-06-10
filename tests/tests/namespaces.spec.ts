import { expect, test } from "@playwright/test";
import { initApp } from "./component-test-helpers";

test("core button renders without namespace", async ({ page }) => {
  await initApp(page, {
    components: `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
    entryPoint: `<App><Button testId="button">CORE</Button></App>`
  });

  await expect(page.getByTestId("button")).toHaveText("CORE");
});


test("core button renders with XMLUI namespace", async ({ page }) => {
  await initApp(page, {
    components: `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
    entryPoint: `<App xmlns:XMLUI="core-ns"><XMLUI:Button testId="button">CORE</XMLUI:Button></App>`
  });

  await expect(page.getByTestId("button")).toHaveText("CORE");
});


test("compound component button renders with app-ns namespace", async ({ page }) => {
  await initApp(page, {
    components: `
      <Component name="Button">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
    entryPoint: `<App xmlns:My="app-ns"><My:Button testId="button">CORE</My:Button></App>`
  });

  await expect(page.getByTestId("button")).toHaveText("COMPOUND COMPONENT");
});

test("compound component renders without namespace (no name-conflict with core component)", async ({ page }) => {
  await initApp(page, {
    components: `
      <Component name="MyButton">
        <Text>COMPOUND COMPONENT</Text>
      </Component>
    `,
    entryPoint: `<App><MyButton testId="button">CORE</MyButton></App>`
  });

  await expect(page.getByTestId("button")).toHaveText("COMPOUND COMPONENT");
});

test("extension renders with namespace (component-ns)", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<App xmlns:TEST_NS="component-ns"><TEST_NS:TestComponent testId="testComp">EXTENSION CONTENT</TEST_NS:TestComponent></App>`
  });

  await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
});

test("extension renders with namespace (component-ns:namespace)", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<App xmlns:ExtensionAlias="component-ns:TEST_NS"><ExtensionAlias:TestComponent testId="testComp">EXTENSION CONTENT</ExtensionAlias:TestComponent></App>`
  });

  await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
});

test("extension doesn't render without namespace", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<App><TestComponent testId="testComp">EXTENSION CONTENT</TestComponent></App>`
  });

  await expect(page.getByTestId("testComp")).not.toBeVisible();
});

test("XMLUIExtensions extension does render without namespace", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<App><TestComponentInXMLUIExtensionsNamespace testId="testComp">EXTENSION CONTENT</TestComponentInXMLUIExtensionsNamespace></App>`
  });

  await expect(page.getByTestId("testComp")).toHaveText("EXTENSION CONTENT");
});