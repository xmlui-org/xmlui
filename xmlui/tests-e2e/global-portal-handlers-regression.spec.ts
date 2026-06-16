import { expect, test } from "../src/testing/fixtures";

test.describe("global writes from deferred and portal handlers", () => {
  test("Items inside a Drawer portal can emit a component event and continue the handler", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
        <App global.cfg="{{ dyeName: 'ATTO 488' }}">
          <DyeDrawer
            id="dyeDrawer"
            onDyeSelected="name => cfg = { dyeName: name }" />
          <Button testId="openDrawer" onClick="dyeDrawer.open()">Open Drawer</Button>
          <Text testId="selectedDye">{cfg.dyeName}</Text>
        </App>
      `,
      {
        noFragmentWrapper: true,
        components: [
          `
            <Component name="DyeDrawer">
              <event name="dyeSelected" />
              <method name="open">innerDrawer.open()</method>

              <Drawer id="innerDrawer" closeButtonVisible="false">
                <Items data="{['ATTO 550']}">
                  <Button
                    testId="selectDye"
                    onClick="() => { emitEvent('dyeSelected', $item); innerDrawer.close(); }">
                    {$item}
                  </Button>
                </Items>
              </Drawer>
            </Component>
          `,
        ],
      },
    );

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 488");

    await page.getByTestId("openDrawer").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("selectDye").click();

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 550");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("global variables update from Drawer portal clicks and close events", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
        <App global.cfg="{{ dyeName: 'ATTO 488', closeCount: 0 }}">
          <Button testId="openDrawer" onClick="drawer.open()">Open Drawer</Button>
          <Text testId="selectedDye">{cfg.dyeName}</Text>
          <Text testId="closeCount">{cfg.closeCount}</Text>

          <Drawer
            id="drawer"
            closeButtonVisible="false"
            onClose="cfg = { dyeName: cfg.dyeName, closeCount: cfg.closeCount + 1 }">
            <Items data="{['ATTO 550']}">
              <Button
                testId="selectDye"
                onClick="{ cfg = { dyeName: $item, closeCount: cfg.closeCount }; drawer.close(); }">
                {$item}
              </Button>
            </Items>
          </Drawer>
        </App>
      `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 488");
    await expect(page.getByTestId("closeCount")).toHaveText("0");

    await page.getByTestId("openDrawer").click();
    await page.getByTestId("selectDye").click();

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 550");
    await expect(page.getByTestId("closeCount")).toHaveText("1");
  });

  test("global variables update from ChangeListener handlers", async ({ page, initTestBed }) => {
    await initTestBed(
      `
        <App var.pendingDye="" global.cfg="{{ dyeName: 'ATTO 488' }}">
          <Button testId="selectDye" onClick="pendingDye = 'ATTO 550'">Select Dye</Button>
          <Text testId="selectedDye">{cfg.dyeName}</Text>
          <Text testId="pendingDye">{pendingDye}</Text>
          <ChangeListener
            listenTo="{pendingDye}"
            onDidChange="{
              if (pendingDye) {
                cfg = { dyeName: pendingDye };
                pendingDye = '';
              }
            }" />
        </App>
      `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 488");

    await page.getByTestId("selectDye").click();

    await expect(page.getByTestId("selectedDye")).toHaveText("ATTO 550");
    await expect(page.getByTestId("pendingDye")).toHaveText("");
  });
});
