import { expect, test } from "xmlui/testing";

test("xmlui-ai-blocks renders AiConversation placeholder", async ({ initTestBed, page }) => {
  await initTestBed(
    `<AiConversation
      title="Assistant workspace"
      provider="OpenAI"
      model="gpt-test"
      status="Ready"
      placeholder="No messages yet"
    />`,
    { extensionIds: "xmlui-ai-blocks" },
  );

  await expect(page.getByText("Assistant workspace")).toBeVisible();
  await expect(page.getByText("OpenAI")).toBeVisible();
  await expect(page.getByText("gpt-test")).toBeVisible();
  await expect(page.getByText("Ready")).toBeVisible();
  await expect(page.getByText("No messages yet")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
});
