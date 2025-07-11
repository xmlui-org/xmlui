import { expect, test } from "../../testing/fixtures";

// --- Smoke

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createCodeBlockDriver }) => {
    await initTestBed(`<CodeBlock />`);
    await expect((await createCodeBlockDriver()).component).toBeAttached();
  });

  test("component with Text codefence renders", async ({ initTestBed, createCodeBlockDriver }) => {
    await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">
        This is a test
      </Text>
    </CodeBlock>
    `);
    await expect((await createCodeBlockDriver()).component).toBeAttached();
  });
});
