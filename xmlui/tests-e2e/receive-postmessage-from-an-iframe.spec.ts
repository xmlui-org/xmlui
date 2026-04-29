import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/receive-postmessage-from-an-iframe.md"),
);

test.describe("Receive messages from an IFrame", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Receive messages from an IFrame",
  );

  test("initial state shows host app with waiting message and count zero", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Host app")).toBeVisible();
    await expect(page.getByText("Last message: (waiting for message)")).toBeVisible();
    await expect(page.getByText("Messages received: 0")).toBeVisible();
    await expect(page.getByText("Embedded frame")).toBeVisible();
  });
});
