import { test, expect } from "../src/testing/fixtures";

// Backs the how-to "Confine a hot input's reactivity to its own component".
// The composer keeps its own input state; the parent prefills via an exposed
// setValue method and receives finished messages via the send event.
// Note: autoSize renders a hidden shadow <textarea> too, so target the visible
// one by its testId ("box", from the TextArea id) rather than the tag.
const COMPOSER = `
  <Component name="MessageComposer" var.draft="{''}">
    <TextArea id="box" autoSize="true" placeholder="Type a message, then Send"
      onDidChange="(v) => draft = v" />
    <Text variant="caption">{draft.length} characters</Text>
    <Button label="Send"
      onClick="() => { emitEvent('send', box.value); box.setValue(''); }" />
    <method name="setValue">(v) => box.setValue(v)</method>
  </Component>
`;
const APP = `
  <App var.log="{[]}">
    <MessageComposer id="composer" onSend="(text) => { log = [...log, text]; }" />
    <Button testId="prefill" label="Prefill greeting" onClick="composer.setValue('Hello there')" />
    <Text testId="last">LAST:{log.length ? log[log.length-1] : ''}</Text>
    <Text testId="count">SENT:{log.length}</Text>
  </App>
`;

test("prefill visibly fills the input", async ({ page, initTestBed }) => {
  await initTestBed(APP, { components: [COMPOSER] });
  await expect(page.getByTestId("count")).toHaveText("SENT:0");
  await page.getByTestId("prefill").click();
  await expect(page.getByRole("textbox")).toHaveValue("Hello there");
});

test("typing then Send emits the text to the parent and clears", async ({ page, initTestBed }) => {
  await initTestBed(APP, { components: [COMPOSER] });
  await expect(page.getByTestId("count")).toHaveText("SENT:0");
  await page.getByRole("textbox").click();
  await page.getByRole("textbox").pressSequentially("hi there");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("last")).toHaveText("LAST:hi there");
  await expect(page.getByTestId("count")).toHaveText("SENT:1");
  await expect(page.getByRole("textbox")).toHaveValue("");
});

test("prefill then Send emits the prefilled text", async ({ page, initTestBed }) => {
  await initTestBed(APP, { components: [COMPOSER] });
  await expect(page.getByTestId("count")).toHaveText("SENT:0");
  await page.getByTestId("prefill").click();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("last")).toHaveText("LAST:Hello there");
});
