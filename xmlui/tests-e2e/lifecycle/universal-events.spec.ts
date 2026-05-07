import { expect, test } from "../../src/testing/fixtures";

// =============================================================================
// E2E tests: Plan #04 Phase 1–2 — universal `onMount` / `onUnmount` /
// `onError` events on every component plus the `<Lifecycle>` declarative
// effect primitive.
// =============================================================================

test.describe("Universal onMount / onUnmount events", () => {
  test("onMount fires after first commit on any component", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.mounted="{false}">
        <Stack onMount="mounted = true" />
        <Text testId="status">{mounted ? 'mounted' : 'pending'}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("status")).toHaveText("mounted");
  });

  test("onUnmount fires when a conditional component is removed", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.show="{true}" var.cleaned="{false}">
        <Stack when="{show}" onUnmount="cleaned = true" />
        <Button testId="hide" onClick="show = false">hide</Button>
        <Text testId="status">{cleaned ? 'cleaned' : 'live'}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("status")).toHaveText("live");
    await page.getByTestId("hide").click();
    await expect(page.getByTestId("status")).toHaveText("cleaned");
  });

  test("onMount fires only once across re-renders", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.count="{0}" var.tick="{0}">
        <Stack onMount="count = count + 1">
          <Text>{tick}</Text>
        </Stack>
        <Button testId="bump" onClick="tick = tick + 1">bump</Button>
        <Text testId="count">{count}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("count")).toHaveText("1");
    await page.getByTestId("bump").click();
    await page.getByTestId("bump").click();
    await expect(page.getByTestId("count")).toHaveText("1");
  });
});

test.describe("Lifecycle component", () => {
  test("fires onMount once on first render", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.calls="{0}">
        <Lifecycle onMount="calls = calls + 1" />
        <Text testId="calls">{calls}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("calls")).toHaveText("1");
  });

  test("fires onUnmount when removed via when", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.show="{true}" var.flushed="{false}">
        <Lifecycle when="{show}" onUnmount="flushed = true" />
        <Button testId="hide" onClick="show = false">hide</Button>
        <Text testId="flushed">{flushed ? 'yes' : 'no'}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("flushed")).toHaveText("no");
    await page.getByTestId("hide").click();
    await expect(page.getByTestId("flushed")).toHaveText("yes");
  });

  test("keyValue change re-arms the cycle", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.k="{1}" var.mounts="{0}" var.unmounts="{0}">
        <Lifecycle
          keyValue="{k}"
          onMount="mounts = mounts + 1"
          onUnmount="unmounts = unmounts + 1"
        />
        <Button testId="bump" onClick="k = k + 1">bump</Button>
        <Text testId="mounts">{mounts}</Text>
        <Text testId="unmounts">{unmounts}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("mounts")).toHaveText("1");
    await expect(page.getByTestId("unmounts")).toHaveText("0");
    await page.getByTestId("bump").click();
    await expect(page.getByTestId("mounts")).toHaveText("2");
    await expect(page.getByTestId("unmounts")).toHaveText("1");
  });

  test("onError receives lifecycle failure with source and error", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.captured="{''}">
        <Lifecycle
          onMount="throw 'boom'"
          onError="p => captured = p.source + ':' + p.error.message"
        />
        <Text testId="captured">{captured}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("captured")).toHaveText("mount:boom");
  });
});
