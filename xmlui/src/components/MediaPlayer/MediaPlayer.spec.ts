import { expect, test } from "../../testing/fixtures";

// These specs cover wiring, not playback. No media is loaded (only the prop tests
// set src): media events are
// dispatched synthetically on the element, and the handlers read the element's
// real properties (currentTime can be set before any media loads).

const SRC = "https://example.com/media/clip.mp4";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders a video element by default", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" src="${SRC}" />`);
    const player = page.getByTestId("player");
    await expect(player).toBeVisible();
    expect(await player.evaluate((el) => el.tagName)).toBe("VIDEO");
  });

  test("kind='audio' renders an audio element", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" kind="audio" src="${SRC}" />`);
    expect(await page.getByTestId("player").evaluate((el) => el.tagName)).toBe("AUDIO");
  });

  test("passes src to the element unchanged", async ({ initTestBed, page }) => {
    const src = "https://example.com/stream/no-extension?sig=abc";
    await initTestBed(`<MediaPlayer testId="player" src="${src}" />`);
    await expect(page.getByTestId("player")).toHaveAttribute("src", src);
  });

  test("shows native controls by default", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" src="${SRC}" />`);
    await expect(page.getByTestId("player")).toHaveAttribute("controls", "");
  });

  test("controls='false' hides native controls", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" controls="false" src="${SRC}" />`);
    await expect(page.getByTestId("player")).not.toHaveAttribute("controls");
  });

  test("loop, autoPlay and preload reach the element", async ({ initTestBed, page }) => {
    await initTestBed(
      `<MediaPlayer testId="player" loop="true" autoPlay="true" preload="none" src="${SRC}" />`,
    );
    const player = page.getByTestId("player");
    await expect(player).toHaveAttribute("loop", "");
    await expect(player).toHaveAttribute("autoplay", "");
    await expect(player).toHaveAttribute("preload", "none");
  });

  test("crossOrigin reaches the element", async ({ initTestBed, page }) => {
    await initTestBed(
      `<MediaPlayer testId="player" crossOrigin="anonymous" kind="audio" src="${SRC}" />`,
    );
    await expect(page.getByTestId("player")).toHaveAttribute("crossorigin", "anonymous");
  });

  test("muted sets the element's muted property", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" muted="true" src="${SRC}" />`);
    expect(await page.getByTestId("player").evaluate((el: HTMLMediaElement) => el.muted)).toBe(
      true,
    );
  });

  test("playbackRate sets the element's playbackRate", async ({ initTestBed, page }) => {
    await initTestBed(`<MediaPlayer testId="player" playbackRate="1.5" src="${SRC}" />`);
    await expect
      .poll(() =>
        page.getByTestId("player").evaluate((el: HTMLMediaElement) => el.playbackRate),
      )
      .toBe(1.5);
  });

  test("poster applies to video", async ({ initTestBed, page }) => {
    await initTestBed(
      `<MediaPlayer testId="player" poster="https://example.com/poster.jpg" src="${SRC}" />`,
    );
    await expect(page.getByTestId("player")).toHaveAttribute(
      "poster",
      "https://example.com/poster.jpg",
    );
  });

  test("poster is ignored for audio", async ({ initTestBed, page }) => {
    await initTestBed(
      `<MediaPlayer testId="player" kind="audio" poster="https://example.com/poster.jpg" src="${SRC}" />`,
    );
    await expect(page.getByTestId("player")).not.toHaveAttribute("poster");
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================

async function setTimeAndDispatch(page: any, type: string, time = 0) {
  await page.getByTestId("player").evaluate(
    (node: HTMLElement, [t, eventType]: [number, string]) => {
      // In verbose mode the testId lands on a hover-capture wrapper around the element
      const el = (
        node.matches("video, audio") ? node : node.querySelector("video, audio")
      ) as HTMLMediaElement;
      el.currentTime = t;
      el.dispatchEvent(new Event(eventType));
    },
    [time, type],
  );
}

test.describe("Events", () => {
  for (const kind of ["video", "audio"]) {
    for (const [event, domEvent] of [
      ["Play", "play"],
      ["Pause", "pause"],
      ["Seeked", "seeked"],
      ["Ended", "ended"],
      ["TimeUpdate", "timeupdate"],
    ]) {
      test(`${kind}: on${event} receives currentTime`, async ({ initTestBed, page }) => {
        const { testStateDriver } = await initTestBed(`
          <MediaPlayer testId="player" kind="${kind}"
            on${event}="(e) => testState = e.currentTime" />
        `);
        await setTimeAndDispatch(page, domEvent, 3.5);
        await expect.poll(testStateDriver.testState).toBe(3.5);
      });
    }
  }

  test("video: onLoadedMetadata receives duration and dimensions", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <MediaPlayer testId="player"
        onLoadedMetadata="(e) => testState = Object.keys(e).sort().join(',')" />
    `);
    await setTimeAndDispatch(page, "loadedmetadata");
    await expect.poll(testStateDriver.testState).toBe("duration,videoHeight,videoWidth");
  });

  test("audio: onLoadedMetadata receives duration only", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <MediaPlayer testId="player" kind="audio"
        onLoadedMetadata="(e) => testState = Object.keys(e).sort().join(',')" />
    `);
    await setTimeAndDispatch(page, "loadedmetadata");
    await expect.poll(testStateDriver.testState).toBe("duration");
  });
});

// =============================================================================
// REACTIVE STATE TESTS
// =============================================================================

test.describe("Reactive state", () => {
  test("paused is true initially and follows play and pause", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" />
        <Text testId="paused" value="{player.paused}" />
      </Fragment>
    `);
    await expect(page.getByTestId("paused")).toHaveText("true");
    await setTimeAndDispatch(page, "play");
    await expect(page.getByTestId("paused")).toHaveText("false");
    await setTimeAndDispatch(page, "pause");
    await expect(page.getByTestId("paused")).toHaveText("true");
  });

  test("ended becomes true on ended and false on play", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" kind="audio" />
        <Text testId="ended" value="{player.ended}" />
      </Fragment>
    `);
    await expect(page.getByTestId("ended")).toHaveText("false");
    await setTimeAndDispatch(page, "ended");
    await expect(page.getByTestId("ended")).toHaveText("true");
    await setTimeAndDispatch(page, "play");
    await expect(page.getByTestId("ended")).toHaveText("false");
  });

  test("duration is undefined before metadata loads", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" />
        <Text testId="duration" value="{player.duration === undefined ? 'none' : player.duration}" />
      </Fragment>
    `);
    await setTimeAndDispatch(page, "loadedmetadata");
    await expect(page.getByTestId("duration")).toHaveText("none");
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("APIs", () => {
  test("play() and pause() call through to the element", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" />
        <Button testId="play" onClick="player.play()" />
        <Button testId="pause" onClick="player.pause()" />
      </Fragment>
    `);
    await page.getByTestId("player").evaluate((el: HTMLMediaElement) => {
      (window as any).__calls = [];
      el.play = () => {
        (window as any).__calls.push("play");
        return Promise.resolve();
      };
      el.pause = () => {
        (window as any).__calls.push("pause");
      };
    });
    await page.getByTestId("play").click();
    await page.getByTestId("pause").click();
    await expect.poll(() => page.evaluate(() => (window as any).__calls)).toEqual([
      "play",
      "pause",
    ]);
  });

  test("seek() moves the playhead and getCurrentTime() reads it", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" kind="audio" />
        <Button testId="seek" onClick="player.seek(7); testState = player.getCurrentTime()" />
      </Fragment>
    `);
    await page.getByTestId("seek").click();
    await expect.poll(testStateDriver.testState).toBe(7);
    expect(
      await page.getByTestId("player").evaluate((el: HTMLMediaElement) => el.currentTime),
    ).toBe(7);
  });

  test("seek() ignores non-numeric input", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <MediaPlayer id="player" testId="player" />
        <Button testId="seek" onClick="player.seek('abc'); testState = player.getCurrentTime()" />
      </Fragment>
    `);
    await page.getByTestId("seek").click();
    await expect.poll(testStateDriver.testState).toBe(0);
  });
});

// =============================================================================
// TRACING AND LAYOUT TESTS
// =============================================================================

// Entries are read the way the Inspector's JSON export serializes them (xs-diff.html
// drops `nativeEvent`), so a value that only lives in memory fails here.
// _xsLogs can outlive a test within a worker, so filter on the player's own label.
const mediaTraces = (page: any, label: string) =>
  page.evaluate((componentLabel: string) =>
    ((window as any)._xsLogs ?? [])
      .map((entry: any) =>
        JSON.parse(JSON.stringify(entry, (key, value) => (key === "nativeEvent" ? undefined : value))),
      )
      .filter(
        (entry: any) =>
          String(entry.kind).startsWith("native:media.") && entry.componentLabel === componentLabel,
      )
      .map((entry: any) => ({
        kind: entry.kind,
        label: entry.displayLabel,
        componentLabel: entry.componentLabel,
        currentTime: entry.data?.currentTime,
      })),
    label,
  );

test.describe("Tracing", () => {
  test("verbose mode records media events with the file name", async ({ initTestBed, page }) => {
    await initTestBed(
      `<MediaPlayer id="narration" testId="player" kind="audio" src="/media/take%201.mp4?v=2" preload="none" />`,
      { xmluiConfig: { xsVerbose: true } },
    );
    await setTimeAndDispatch(page, "play", 1.25);
    await setTimeAndDispatch(page, "pause", 2.5);
    await expect.poll(() => mediaTraces(page, "narration")).toEqual([
      { kind: "native:media.play", label: "take 1.mp4", componentLabel: "narration", currentTime: 1.25 },
      { kind: "native:media.pause", label: "take 1.mp4", componentLabel: "narration", currentTime: 2.5 },
    ]);
  });

  test("tracing does not fire the app handler a second time", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<MediaPlayer id="onceOnly" testId="player" onPlay="testState = (testState || 0) + 1" />`,
      { xmluiConfig: { xsVerbose: true } },
    );
    await setTimeAndDispatch(page, "play");
    await expect.poll(testStateDriver.testState).toBe(1);
    await expect.poll(async () => (await mediaTraces(page, "onceOnly")).length).toBe(1);
    expect(await testStateDriver.testState()).toBe(1);
  });

  test("no media trace entries without verbose mode", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<MediaPlayer id="quiet" testId="player" onPlay="testState = 'played'" />`,
    );
    await setTimeAndDispatch(page, "play");
    await expect.poll(testStateDriver.testState).toBe("played");
    expect(await mediaTraces(page, "quiet")).toEqual([]);
  });
});

test.describe("Layout", () => {
  test("audio fills its container like video", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack width="500px">
        <MediaPlayer testId="audio" kind="audio" />
        <MediaPlayer testId="video" />
      </VStack>
    `);
    const audioBox = await page.getByTestId("audio").boundingBox();
    const videoBox = await page.getByTestId("video").boundingBox();
    expect(audioBox?.width).toBe(500);
    expect(videoBox?.width).toBe(500);
  });
});
