import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// LOCAL STORAGE PERSISTENCE — E2E SMOKE TESTS
// =============================================================================
// These tests verify that:
//   1. The four global functions (readLocalStorage, writeLocalStorage,
//      deleteLocalStorage, clearLocalStorage) work correctly in a running app.

test.describe("Local storage global functions", () => {
  test("readLocalStorage returns stored value", async ({ page, initTestBed }) => {
    await page.addInitScript(() => {
      localStorage.setItem("greeting", JSON.stringify("hello"));
    });

    await initTestBed(
      `
      <App>
        <Text testId="out">{readLocalStorage("greeting", "default")}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("out")).toHaveText("hello");
  });

  test("readLocalStorage returns fallback when key is absent", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="out">{readLocalStorage("absent", "fallback")}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("out")).toHaveText("fallback");
  });

  test("writeLocalStorage persists a value readable by readLocalStorage", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App var.val="{readLocalStorage('kw', 'initial')}">
        <Text testId="before">{val}</Text>
        <Button testId="save" label="Save" onClick="writeLocalStorage('kw', 99)" />
        <Button testId="read" label="Read" onClick="val = readLocalStorage('kw', 0)" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("before")).toHaveText("initial");
    await page.getByTestId("save").click();
    await page.getByTestId("read").click();
    await expect(page.getByTestId("before")).toHaveText("99");
  });

  test("deleteLocalStorage removes the entry", async ({ page, initTestBed }) => {
    await page.addInitScript(() => {
      localStorage.setItem("toDelete", JSON.stringify("bye"));
    });

    await initTestBed(
      `
      <App var.val="{readLocalStorage('toDelete', 'gone')}">
        <Text testId="out">{val}</Text>
        <Button testId="del" label="Del" onClick="deleteLocalStorage('toDelete')" />
        <Button testId="read" label="Read" onClick="val = readLocalStorage('toDelete', 'gone')" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("out")).toHaveText("bye");
    await page.getByTestId("del").click();
    await page.getByTestId("read").click();
    await expect(page.getByTestId("out")).toHaveText("gone");
  });

  test("clearLocalStorage wipes all entries", async ({ page, initTestBed }) => {
    await page.addInitScript(() => {
      localStorage.setItem("a", JSON.stringify(1));
      localStorage.setItem("b", JSON.stringify(2));
    });

    await initTestBed(
      `
      <App var.val="{readLocalStorage('a', 0)}">
        <Text testId="out">{val}</Text>
        <Button testId="clearAll" label="Clear" onClick="clearLocalStorage()" />
        <Button testId="read" label="Read" onClick="val = readLocalStorage('a', 0)" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("out")).toHaveText("1");
    await page.getByTestId("clearAll").click();
    await page.getByTestId("read").click();
    await expect(page.getByTestId("out")).toHaveText("0");
  });

  test("clearLocalStorage with prefix removes only matching entries", async ({
    page,
    initTestBed,
  }) => {
    // Use root-level keys that match readLocalStorage's dot-path semantics:
    //   "app"   → root key "app", sub-path "tone"/"lang"
    //   "other" → root key "other", sub-path "data"
    await page.addInitScript(() => {
      localStorage.setItem("app", JSON.stringify({ tone: "dark", lang: "en" }));
      localStorage.setItem("other", JSON.stringify({ data: "keep" }));
    });

    await initTestBed(
      `
      <App var.tone="{readLocalStorage('app.tone', 'gone')}" var.other="{readLocalStorage('other.data', 'gone')}">
        <Button testId="clearApp" label="Clear app" onClick="clearLocalStorage('app')" />
        <Button testId="readTone" label="Read tone" onClick="tone = readLocalStorage('app.tone', 'gone')" />
        <Button testId="readOther" label="Read other" onClick="other = readLocalStorage('other.data', 'gone')" />
        <Text testId="tone">{tone}</Text>
        <Text testId="other">{other}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    // Verify initial values read correctly from seeded storage
    await expect(page.getByTestId("tone")).toHaveText("dark");
    await expect(page.getByTestId("other")).toHaveText("keep");

    await page.getByTestId("clearApp").click();
    await page.getByTestId("readTone").click();
    await page.getByTestId("readOther").click();
    // "app" was cleared; "other" was not touched
    await expect(page.getByTestId("tone")).toHaveText("gone");
    await expect(page.getByTestId("other")).toHaveText("keep");
  });
});

test.describe("storageTimestamp — reactive notification on mutations", () => {
  test("storageTimestamp starts at 0 before any mutation", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="ts">{storageTimestamp}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("ts")).toHaveText("0");
  });

  test("storageTimestamp updates after writeLocalStorage", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="ts">{storageTimestamp}</Text>
        <Button testId="write" label="Write" onClick="writeLocalStorage('x', 42)" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("ts")).toHaveText("0");
    await page.getByTestId("write").click();
    // storageTimestamp should now be a non-zero number (Date.now())
    const ts = await page.getByTestId("ts").textContent();
    expect(Number(ts)).toBeGreaterThan(0);
  });

  test("storageTimestamp updates after deleteLocalStorage", async ({ page, initTestBed }) => {
    await page.addInitScript(() => {
      localStorage.setItem("myKey", JSON.stringify("hello"));
    });

    await initTestBed(
      `
      <App>
        <Text testId="ts">{storageTimestamp}</Text>
        <Button testId="del" label="Delete" onClick="deleteLocalStorage('myKey')" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("ts")).toHaveText("0");
    await page.getByTestId("del").click();
    const ts = await page.getByTestId("ts").textContent();
    expect(Number(ts)).toBeGreaterThan(0);
  });

  test("storageTimestamp updates after clearLocalStorage", async ({ page, initTestBed }) => {
    await page.addInitScript(() => {
      localStorage.setItem("a", JSON.stringify(1));
    });

    await initTestBed(
      `
      <App>
        <Text testId="ts">{storageTimestamp}</Text>
        <Button testId="clear" label="Clear" onClick="clearLocalStorage()" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("ts")).toHaveText("0");
    await page.getByTestId("clear").click();
    const ts = await page.getByTestId("ts").textContent();
    expect(Number(ts)).toBeGreaterThan(0);
  });

  test("ChangeListener with storageTimestamp triggers on storage mutation", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App var.storageContent="none">
        <ChangeListener
          listenTo="{storageTimestamp}"
          onDidChange="storageContent = JSON.stringify(getAllLocalStorage(), null, 2);"
        />
        <Button testId="write" label="Write" onClick="writeLocalStorage('greeting', 'hello')" />
        <Text testId="content">{storageContent}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("content")).toHaveText("none");
    await page.getByTestId("write").click();

    // After the write, ChangeListener fires and storageContent is updated to JSON
    await expect(page.getByTestId("content")).not.toHaveText("none");
    const content = await page.getByTestId("content").textContent();
    const parsed = JSON.parse(content!);
    expect(parsed.greeting).toBe("hello");
  });
});
