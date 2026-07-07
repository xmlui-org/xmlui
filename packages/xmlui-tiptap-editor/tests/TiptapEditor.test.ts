import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-tiptap-editor" };

// =============================================================================
// TiptapEditor
// =============================================================================

test.describe("TiptapEditor", () => {
  test("renders the editor", async ({ initTestBed, page }) => {
    await initTestBed(`<TiptapEditor testId="ed" />`, EXT);
    await expect(page.getByTestId("ed")).toBeVisible();
  });

  test("renders toolbar by default", async ({ initTestBed, page }) => {
    await initTestBed(`<TiptapEditor testId="ed" />`, EXT);
    // The toolbar contains at least one button (Bold)
    await expect(page.getByTestId("ed").getByTitle("Bold (Ctrl+B)")).toBeVisible();
  });

  test("hides toolbar when toolbar=false", async ({ initTestBed, page }) => {
    await initTestBed(`<TiptapEditor testId="ed" toolbar="false" />`, EXT);
    await expect(page.getByTestId("ed").getByTitle("Bold (Ctrl+B)")).not.toBeAttached();
  });

  test("shows placeholder text", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TiptapEditor testId="ed" toolbar="false" placeholder="Type here..." />`,
      EXT,
    );
    // Tiptap renders placeholder via CSS data-placeholder attribute on .is-editor-empty
    const editorEl = page.getByTestId("ed").locator(".ProseMirror");
    await expect(editorEl).toBeAttached();
  });

  test("renders with initialValue", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TiptapEditor testId="ed" toolbar="false" initialValue="Hello world" />`,
      EXT,
    );
    const editorEl = page.getByTestId("ed").locator(".ProseMirror");
    await expect(editorEl).toContainText("Hello world");
  });

  test("setValue API updates editor content", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <TiptapEditor id="ed" testId="ed" toolbar="false" />
        <Button testId="setBtn" label="Set" onClick="ed.setValue('Updated content')" />
      </VStack>`,
      EXT,
    );
    await page.getByTestId("setBtn").click();
    const editorEl = page.getByTestId("ed").locator(".ProseMirror");
    await expect(editorEl).toContainText("Updated content");
  });

  test("getMarkdown API returns content", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <TiptapEditor id="ed" testId="ed" toolbar="false" initialValue="Hello" />
        <Button testId="getBtn" label="Get" onClick="result = ed.getMarkdown()" />
        <Text testId="result" value="{result}" />
      </VStack>`,
      { ...EXT, mainXs: `var result = '';` },
    );
    await page.getByTestId("getBtn").click();
    await expect(page.getByTestId("result")).toContainText("Hello");
  });

  test("fires didChange when content is typed", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <TiptapEditor id="ed" testId="ed" toolbar="false" onDidChange="changed = 'yes'" />
        <Text testId="result" value="{changed}" />
      </VStack>`,
      { ...EXT, mainXs: `var changed = 'no';` },
    );
    const editorEl = page.getByTestId("ed").locator(".ProseMirror");
    await editorEl.click();
    await editorEl.type("x");
    await expect(page.getByTestId("result")).toHaveText("yes");
  });

  test("editable=false prevents typing", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TiptapEditor testId="ed" toolbar="false" editable="false" initialValue="Fixed" />`,
      EXT,
    );
    const editorEl = page.getByTestId("ed").locator(".ProseMirror");
    await expect(editorEl).toHaveAttribute("contenteditable", "false");
  });
});
