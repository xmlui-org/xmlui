import { expect, test } from "../../testing/fixtures";
import { parseXmlui } from "../../compiler/parseXmlui";
import type { XmluiElement, MixedTextSegment } from "../../compiler/ir";

test("accepts and forwards title attribute", async ({ initTestBed, page }) => {
  await initTestBed(`
    <IFrame
      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
      allow="camera; microphone; geolocation"
      width="560px"
      height="315px"
      title="Rick Astley - Never Gonna Give You Up (Official Video)"
      testId="iframe"
    />
  `);

  const iframe = page.getByTestId("iframe");
  await expect(iframe).toHaveAttribute(
    "title",
    "Rick Astley - Never Gonna Give You Up (Official Video)",
  );
  await expect(iframe).toHaveAttribute("allow", "camera; microphone; geolocation");
  await expect(iframe).toHaveCSS("width", "560px");
  await expect(iframe).toHaveCSS("height", "315px");
});

test("button click can open a named iframe target through window.open", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <VStack gap="$space-2">
      <Button
        label="Open 'Kraftwerk: The Model' in IFrame"
        onClick="window.open('https://www.youtube-nocookie.com/embed/-s4zRw16tMA', 'myFrame')"
      />
      <IFrame
        src="https://example.com"
        name="myFrame"
        width="100%"
        height="300px"
        testId="iframe"
      />
    </VStack>
  `);

  await page.evaluate(() => {
    (window as typeof window & {
      __xmluiWindowOpenCall?: { url?: string | URL; target?: string; features?: string };
    }).__xmluiWindowOpenCall = undefined;
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      (window as typeof window & {
        __xmluiWindowOpenCall?: { url?: string | URL; target?: string; features?: string };
      }).__xmluiWindowOpenCall = { url, target, features };
      return null;
    }) as typeof window.open;
  });

  await expect(page.getByTestId("iframe")).toHaveAttribute("name", "myFrame");
  await page.getByRole("button", { name: "Open 'Kraftwerk: The Model' in IFrame" }).click();

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & {
            __xmluiWindowOpenCall?: { url?: string | URL; target?: string; features?: string };
          }).__xmluiWindowOpenCall,
      ),
    )
    .toEqual({
      url: "https://www.youtube-nocookie.com/embed/-s4zRw16tMA",
      target: "myFrame",
      features: undefined,
    });
});

test("srcdoc script can use escaped braces in postMessage example", () => {
  const document = parseXmlui(String.raw`
    <App>
      <VStack var.messageStatus="Ready to send" gap="$space-2">
        <Button
          label="Send Message to IFrame"
          onClick="
            myIframe.postMessage({type: 'greeting', text: 'Hello from parent!'}, '*');
            messageStatus = 'Message sent!';
          "
        />
        <Card title="Status: {messageStatus}" />
        <IFrame
          id="myIframe"
          srcdoc="
            <script>
              window.addEventListener('message', (event) => \{
                console.log('Received message:', event.data);
                document.body.innerHTML =
                  '<h1>Message: ' + JSON.stringify(event.data) + '</h1>';
              });
            </script>
            <h1>Waiting for message...</h1>
          "
          width="100%"
          height="200px"
          testId="iframe"
        />
      </VStack>
    </App>
  `);

  const iframe = findElement(document.root, "IFrame");
  const srcdoc = iframe?.parsed?.props?.srcdoc as MixedTextSegment[] | undefined;
  expect(srcdoc).toEqual([
    expect.objectContaining({
      kind: "literal",
      value: expect.stringContaining("window.addEventListener('message', (event) => {"),
    }),
  ]);
  expect(srcdoc?.[0]?.kind === "literal" ? srcdoc[0].value : "").not.toContain("\\{");
  expect(srcdoc?.[0]?.kind === "literal" ? srcdoc[0].value : "").not.toContain("&#123;");
});

function findElement(root: XmluiElement, type: string): XmluiElement | undefined {
  if (root.type === type) {
    return root;
  }
  for (const child of root.children) {
    if (child.kind !== "element") {
      continue;
    }
    const found = findElement(child, type);
    if (found) {
      return found;
    }
  }
  return undefined;
}
