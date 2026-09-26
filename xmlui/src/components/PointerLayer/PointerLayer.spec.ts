import { expect, test } from "../../testing/fixtures";

// Wiring specs: real Playwright mouse/keyboard input (held modifiers ride on
// the pointer events). How the ink looks is judged by a person, not here.

// Measure the ink SVG, which fills the layer exactly. (With xsVerbose the
// testId lands on a hover-capture wrapper that has no box of its own.)
const box = async (page: any, testId = "layer") => {
  const b = await page.getByTestId(testId).locator("svg").first().boundingBox();
  if (!b) throw new Error("layer has no box");
  return b;
};

// Drag from (x0,y0) to (x1,y1), in layer-relative pixels, in `steps` moves
async function drag(page: any, x0: number, y0: number, x1: number, y1: number, steps = 5) {
  const b = await box(page);
  await page.mouse.move(b.x + x0, b.y + y0);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(b.x + x0 + ((x1 - x0) * i) / steps, b.y + y0 + ((y1 - y0) * i) / steps);
  }
  await page.mouse.up();
}

// Every drawn item (freehand stroke or shape) is one <g data-ink-id>
const strokePaths = (page: any) => page.getByTestId("layer").locator("svg g[data-ink-id]");

// =============================================================================
// PASS-THROUGH AND ARMING
// =============================================================================

test.describe("Pass-through and arming", () => {
  test("renders its children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PointerLayer testId="layer">
        <Text testId="child">Hello</Text>
      </PointerLayer>
    `);
    await expect(page.getByTestId("child")).toHaveText("Hello");
  });

  test("without the modifier, clicks reach the children", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer">
        <Button testId="btn" label="Press" onClick="testState = 'clicked'" />
      </PointerLayer>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe("clicked");
  });

  test("without the modifier, a drag draws nothing", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px"
        onStrokeEnd="testState = 'drew'">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await drag(page, 50, 50, 200, 150);
    await expect(strokePaths(page)).toHaveCount(0);
    expect(await testStateDriver.testState()).toBeNull();
  });

  test("holding the modifier draws a stroke", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" fadeMs="0"
        onStrokeEnd="(e) => testState = e">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await page.keyboard.down("Meta");
    await drag(page, 40, 30, 200, 150, 6);
    await page.keyboard.up("Meta");

    await expect.poll(testStateDriver.testState).not.toBeNull();
    const stroke = await testStateDriver.testState();
    expect(stroke.points.length).toBeGreaterThanOrEqual(6);
    expect(stroke.points[0].t).toBe(0);
    for (let i = 1; i < stroke.points.length; i++) {
      expect(stroke.points[i].t).toBeGreaterThanOrEqual(stroke.points[i - 1].t);
    }
    expect(stroke.points[0].x).toBeCloseTo(0.1, 2);
    expect(stroke.points[0].y).toBeCloseTo(0.1, 2);
    const last = stroke.points[stroke.points.length - 1];
    expect(last.x).toBeCloseTo(0.5, 2);
    expect(last.y).toBeCloseTo(0.5, 2);
    expect(stroke.color).toBe("#ff3b30");
    expect(stroke.width).toBe(4);
    expect(typeof stroke.time).toBe("number");
    await expect(strokePaths(page)).toHaveCount(1);
  });

  test("the configured modifier is the one that arms", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" drawModifier="alt"
        onStrokeEnd="testState = (testState || 0) + 1">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await page.keyboard.down("Meta");
    await drag(page, 50, 50, 150, 150);
    await page.keyboard.up("Meta");
    await page.keyboard.down("Alt");
    await drag(page, 50, 50, 150, 150);
    await page.keyboard.up("Alt");
    await expect.poll(testStateDriver.testState).toBe(1);
  });

  test("drawModifier='none' draws on every drag", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" drawModifier="none"
        onStrokeEnd="testState = 'drew'">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await drag(page, 50, 50, 200, 150);
    await expect.poll(testStateDriver.testState).toBe("drew");
  });

  test("releasing the key mid-stroke doesn't end the stroke", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px"
        onStrokeEnd="(e) => testState = e.points.length">
        <Stack height="300px" />
      </PointerLayer>
    `);
    const b = await box(page);
    await page.keyboard.down("Meta");
    await page.mouse.move(b.x + 40, b.y + 40);
    await page.mouse.down();
    await page.mouse.move(b.x + 80, b.y + 80);
    await page.keyboard.up("Meta");
    await page.mouse.move(b.x + 120, b.y + 120);
    await page.mouse.move(b.x + 160, b.y + 160);
    await page.mouse.up();
    await expect.poll(testStateDriver.testState).toBe(4);
  });

  test("enabled='false' draws nothing and reports nothing", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" enabled="false"
        drawModifier="none"
        onStrokeEnd="testState = 'drew'" onPointerMove="testState = 'moved'">
        <Button testId="btn" label="Press" onClick="testState = 'clicked'" />
      </PointerLayer>
    `);
    await drag(page, 250, 200, 350, 250);
    await expect(strokePaths(page)).toHaveCount(0);
    expect(await testStateDriver.testState()).toBeNull();
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe("clicked");
  });
});

// =============================================================================
// COORDINATES
// =============================================================================

test.describe("Coordinates", () => {
  const moveTo = async (page: any, x: number, y: number) => {
    const b = await box(page);
    await page.mouse.move(b.x + x, b.y + y);
  };

  test("pointerMove is normalized to the layer box", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="200px" sampleMs="0"
        onPointerMove="(e) => testState = e">
        <Stack height="200px" />
      </PointerLayer>
    `);
    await moveTo(page, 100, 150);
    await expect.poll(async () => (await testStateDriver.testState())?.x).toBeCloseTo(0.25, 2);
    const e = await testStateDriver.testState();
    expect(e.y).toBeCloseTo(0.75, 2);
    expect(e.buttons).toBe(0);
    expect(typeof e.time).toBe("number");
  });

  test("contentAspect measures against the letterboxed picture", async ({
    initTestBed,
    page,
  }) => {
    // 400x300 box, picture aspect 2: the picture is 400x200 at y = 50..250
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" contentAspect="2" sampleMs="0"
        onPointerMove="(e) => testState = e">
        <Stack height="300px" />
      </PointerLayer>
    `);
    const at = async (x: number, y: number) => {
      await moveTo(page, x, y);
      await page.waitForTimeout(50);
      return testStateDriver.testState();
    };
    let e = await at(1, 51);
    expect(e.x).toBeCloseTo(0.0025, 2);
    expect(e.y).toBeCloseTo(0.005, 2);
    e = await at(200, 150);
    expect(e.x).toBeCloseTo(0.5, 2);
    expect(e.y).toBeCloseTo(0.5, 2);
    // In the top letterbox bar: reported, not clamped
    e = await at(200, 25);
    expect(e.y).toBeCloseTo(-0.125, 2);
  });

  test("sampleMs throttles pointerMove", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" sampleMs="60000"
        onPointerMove="testState = (testState || 0) + 1">
        <Stack height="300px" />
      </PointerLayer>
    `);
    for (let i = 0; i < 10; i++) await moveTo(page, 20 + i * 20, 100);
    await page.waitForTimeout(200);
    expect(await testStateDriver.testState()).toBe(1);
  });
});

// =============================================================================
// INK LIFETIME AND POINTER DOT
// =============================================================================

test.describe("Ink", () => {
  test("strokes fade out after fadeMs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" drawModifier="none" fadeMs="200">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await drag(page, 50, 50, 200, 150);
    await expect(strokePaths(page)).toHaveCount(1);
    await expect(strokePaths(page)).toHaveCount(0, { timeout: 3000 });
  });

  test("fadeMs='0' keeps strokes until clear()", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <PointerLayer id="ink" testId="layer" width="400px" height="300px"
          drawModifier="none" fadeMs="0">
          <Stack height="300px" />
        </PointerLayer>
        <Button testId="clear" onClick="ink.clear()" />
      </Fragment>
    `);
    await drag(page, 50, 50, 200, 150);
    await drag(page, 60, 200, 300, 220);
    await page.waitForTimeout(400);
    await expect(strokePaths(page)).toHaveCount(2);
    await page.getByTestId("clear").click();
    await expect(strokePaths(page)).toHaveCount(0);
  });

  test("showPointer='always' shows a dot while hovering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" showPointer="always">
        <Stack height="300px" />
      </PointerLayer>
    `);
    const dot = page.getByTestId("layer").locator("[class*='_dot_']");
    await expect(dot).toHaveCount(0);
    const b = await box(page);
    await page.mouse.move(b.x + 100, b.y + 100);
    await expect(dot).toHaveCount(1);
    await page.mouse.move(b.x + 600, b.y + 600);
    await expect(dot).toHaveCount(0);
  });
});

// =============================================================================
// SHAPE TOOLS
// =============================================================================

test.describe("Shape tools", () => {
  // 400x300 layer; shapeEnd lands in testState
  const layer = (attrs: string) => `
    <PointerLayer testId="layer" width="400px" height="300px" fadeMs="0" ${attrs}
      onShapeEnd="(e) => testState = e" onStrokeEnd="testState = 'freehand'">
      <Stack height="300px" />
    </PointerLayer>
  `;

  async function withKeys(page: any, keys: string[], action: () => Promise<void>) {
    for (const k of keys) await page.keyboard.down(k);
    await action();
    for (const k of [...keys].reverse()) await page.keyboard.up(k);
  }

  test("line runs from press to release", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="line"`));
    await withKeys(page, ["Meta"], () => drag(page, 40, 30, 200, 150));
    await expect.poll(testStateDriver.testState).not.toBeNull();
    const e = await testStateDriver.testState();
    expect(e.tool).toBe("line");
    expect(e.x1).toBeCloseTo(0.1, 2);
    expect(e.y1).toBeCloseTo(0.1, 2);
    expect(e.x2).toBeCloseTo(0.5, 2);
    expect(e.y2).toBeCloseTo(0.5, 2);
    expect(e.duration).toBeGreaterThanOrEqual(0);
    expect(typeof e.time).toBe("number");
    await expect(page.getByTestId("layer").locator("svg line")).toHaveCount(1);
  });

  test("arrow draws a line with a head", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="arrow"`));
    await withKeys(page, ["Meta"], () => drag(page, 40, 30, 200, 150));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("arrow");
    const ink = page.getByTestId("layer").locator("svg g[data-ink-kind='arrow']");
    await expect(ink.locator("line")).toHaveCount(1);
    await expect(ink.locator("polygon")).toHaveCount(1);
  });

  test("rect reports its box top-left to bottom-right, whatever the drag direction", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="rect"`));
    await withKeys(page, ["Meta"], () => drag(page, 200, 150, 40, 30));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("rect");
    const e = await testStateDriver.testState();
    expect(e.x1).toBeCloseTo(0.1, 2);
    expect(e.y1).toBeCloseTo(0.1, 2);
    expect(e.x2).toBeCloseTo(0.5, 2);
    expect(e.y2).toBeCloseTo(0.5, 2);
    await expect(page.getByTestId("layer").locator("svg rect")).toHaveCount(1);
  });

  test("Shift makes a rect square (in pixels)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="rect"`));
    await withKeys(page, ["Meta", "Shift"], () => drag(page, 100, 100, 200, 140));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("rect");
    const e = await testStateDriver.testState();
    // 100px square in a 400x300 layer
    expect((e.x2 - e.x1) * 400).toBeCloseTo(100, 0);
    expect((e.y2 - e.y1) * 300).toBeCloseTo(100, 0);
  });

  test("Alt draws an ellipse from its center", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="ellipse"`));
    await withKeys(page, ["Meta", "Alt"], () => drag(page, 200, 150, 260, 180));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("ellipse");
    const e = await testStateDriver.testState();
    expect(e.x1 * 400).toBeCloseTo(140, 0);
    expect(e.y1 * 300).toBeCloseTo(120, 0);
    expect(e.x2 * 400).toBeCloseTo(260, 0);
    expect(e.y2 * 300).toBeCloseTo(180, 0);
    await expect(page.getByTestId("layer").locator("svg ellipse")).toHaveCount(1);
  });

  test("when Alt is the drawing key, it doesn't also center", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="ellipse" drawModifier="alt"`));
    await withKeys(page, ["Alt"], () => drag(page, 200, 150, 260, 180));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("ellipse");
    const e = await testStateDriver.testState();
    expect(e.x1 * 400).toBeCloseTo(200, 0);
    expect(e.y1 * 300).toBeCloseTo(150, 0);
  });

  test("Shift snaps a line to 45 degrees", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="line"`));
    await withKeys(page, ["Meta", "Shift"], () => drag(page, 100, 100, 200, 190));
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("line");
    const e = await testStateDriver.testState();
    const dx = (e.x2 - e.x1) * 400;
    const dy = (e.y2 - e.y1) * 300;
    expect(dx).toBeCloseTo(dy, 0);
  });

  test("pointer drops a ring at the pressed point", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(layer(`tool="pointer"`));
    const b = await box(page);
    await withKeys(page, ["Meta"], async () => {
      await page.mouse.move(b.x + 100, b.y + 75);
      await page.mouse.down();
      await page.mouse.up();
    });
    await expect.poll(async () => (await testStateDriver.testState())?.tool).toBe("pointer");
    const e = await testStateDriver.testState();
    expect(e.x1).toBeCloseTo(0.25, 2);
    expect(e.y1).toBeCloseTo(0.25, 2);
    expect(e.x2).toBe(e.x1);
    expect(e.y2).toBe(e.y1);
    await expect(page.getByTestId("layer").locator("svg circle")).toHaveCount(1);
  });

  test("shapes fade like freehand ink", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PointerLayer testId="layer" width="400px" height="300px" drawModifier="none"
        tool="rect" fadeMs="200">
        <Stack height="300px" />
      </PointerLayer>
    `);
    await drag(page, 50, 50, 200, 150);
    await expect(strokePaths(page)).toHaveCount(1);
    await expect(strokePaths(page)).toHaveCount(0, { timeout: 3000 });
  });
});

// =============================================================================
// TRACING
// =============================================================================

test.describe("Tracing", () => {
  // Read the way the Inspector's JSON export serializes entries (it drops
  // nativeEvent). _xsLogs can outlive a test, so filter on this layer's label.
  const pointerTraces = (page: any, label: string) =>
    page.evaluate(
      (componentLabel: string) =>
        ((window as any)._xsLogs ?? [])
          .map((entry: any) =>
            JSON.parse(
              JSON.stringify(entry, (key, value) => (key === "nativeEvent" ? undefined : value)),
            ),
          )
          .filter(
            (entry: any) =>
              String(entry.kind).startsWith("native:pointer.") &&
              entry.componentLabel === componentLabel,
          )
          .map((entry: any) => ({ kind: entry.kind, data: entry.data })),
      label,
    );

  test("strokes are traced with their payload; moves are not", async ({ initTestBed, page }) => {
    await initTestBed(
      `<PointerLayer id="inkTrace" testId="layer" width="400px" height="300px" drawModifier="none">
         <Stack height="300px" />
       </PointerLayer>`,
      { xmluiConfig: { xsVerbose: true } },
    );
    await drag(page, 50, 50, 200, 150, 4);
    await expect.poll(async () => (await pointerTraces(page, "inkTrace")).length).toBe(2);
    const [start, end] = await pointerTraces(page, "inkTrace");
    expect(start.kind).toBe("native:pointer.strokeStart");
    expect(start.data.x).toBeCloseTo(0.125, 2);
    expect(end.kind).toBe("native:pointer.strokeEnd");
    expect(end.data.pointCount).toBe(end.data.points.length);
    expect(end.data.points.length).toBeGreaterThanOrEqual(4);
  });

  test("shapes are traced with their geometry", async ({ initTestBed, page }) => {
    await initTestBed(
      `<PointerLayer id="shapeTrace" testId="layer" width="400px" height="300px"
         drawModifier="none" tool="arrow">
         <Stack height="300px" />
       </PointerLayer>`,
      { xmluiConfig: { xsVerbose: true } },
    );
    await drag(page, 40, 30, 200, 150);
    await expect.poll(async () => (await pointerTraces(page, "shapeTrace")).length).toBe(1);
    const [shape] = await pointerTraces(page, "shapeTrace");
    expect(shape.kind).toBe("native:pointer.shapeEnd");
    expect(shape.data.tool).toBe("arrow");
    expect(shape.data.x2).toBeCloseTo(0.5, 2);
  });
});
