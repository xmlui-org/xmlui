import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-animations" };

// =============================================================================
// FadeInAnimation
// =============================================================================

test.describe("FadeInAnimation", () => {
  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(
      `<FadeInAnimation duration="100">
        <Text testId="child">Hello</Text>
      </FadeInAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeVisible();
    await expect(page.getByTestId("child")).toHaveText("Hello");
  });

  test("start API triggers animation", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <FadeInAnimation id="anim" duration="100">
          <Text testId="child">Content</Text>
        </FadeInAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
      </VStack>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeVisible();
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("child")).toBeVisible();
  });

  test("fires started event", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <FadeInAnimation
          id="anim"
          duration="100"
          onStarted="eventFired = 'yes'"
        >
          <Text>Content</Text>
        </FadeInAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
        <Text testId="result" value="{eventFired}" />
      </VStack>`,
      { ...EXT, mainXs: `var eventFired = 'no';` },
    );
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("result")).toHaveText("yes");
  });
});

// =============================================================================
// FadeOutAnimation
// =============================================================================

test.describe("FadeOutAnimation", () => {
  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(
      `<FadeOutAnimation duration="100">
        <Text testId="child">Goodbye</Text>
      </FadeOutAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("start API triggers animation", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <FadeOutAnimation id="anim" duration="100">
          <Text testId="child">Content</Text>
        </FadeOutAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
      </VStack>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
    await page.getByTestId("startBtn").click();
    // Child is still in the DOM even after fade-out
    await expect(page.getByTestId("child")).toBeAttached();
  });
});

// =============================================================================
// FadeAnimation
// =============================================================================

test.describe("FadeAnimation", () => {
  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(
      `<FadeAnimation from="0" to="1" duration="100">
        <Text testId="child">Fade</Text>
      </FadeAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeVisible();
  });

  test("start API triggers animation with custom values", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <FadeAnimation id="anim" from="0.2" to="0.8" duration="100">
          <Text testId="child">Content</Text>
        </FadeAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
      </VStack>`,
      EXT,
    );
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("child")).toBeVisible();
  });
});

// =============================================================================
// ScaleAnimation
// =============================================================================

test.describe("ScaleAnimation", () => {
  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(
      `<ScaleAnimation from="0" to="1" duration="100">
        <Text testId="child">Scale</Text>
      </ScaleAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("start API triggers animation", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <ScaleAnimation id="anim" from="0.5" to="1" duration="100">
          <Text testId="child">Content</Text>
        </ScaleAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
      </VStack>`,
      EXT,
    );
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("child")).toBeAttached();
  });
});

// =============================================================================
// SlideInAnimation
// =============================================================================

test.describe("SlideInAnimation", () => {
  test("renders children with default direction", async ({ initTestBed, page }) => {
    await initTestBed(
      `<SlideInAnimation duration="100">
        <Text testId="child">Slide</Text>
      </SlideInAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("renders with right direction", async ({ initTestBed, page }) => {
    await initTestBed(
      `<SlideInAnimation direction="right" duration="100">
        <Text testId="child">Slide Right</Text>
      </SlideInAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("renders with top direction", async ({ initTestBed, page }) => {
    await initTestBed(
      `<SlideInAnimation direction="top" duration="100">
        <Text testId="child">Slide Top</Text>
      </SlideInAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("renders with bottom direction", async ({ initTestBed, page }) => {
    await initTestBed(
      `<SlideInAnimation direction="bottom" duration="100">
        <Text testId="child">Slide Bottom</Text>
      </SlideInAnimation>`,
      EXT,
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("start API triggers animation", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <SlideInAnimation id="anim" direction="left" duration="100">
          <Text testId="child">Content</Text>
        </SlideInAnimation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
      </VStack>`,
      EXT,
    );
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("child")).toBeAttached();
  });
});

// =============================================================================
// Animation (generic)
// =============================================================================

test.describe("Animation", () => {
  test("renders children with inline animation object", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Animation duration="100" animation="{animObj}">
        <Text testId="child">Animated</Text>
      </Animation>`,
      {
        ...EXT,
        mainXs: `var animObj = { from: { opacity: 0 }, to: { opacity: 1 } };`,
      },
    );
    await expect(page.getByTestId("child")).toBeAttached();
  });

  test("start and stop APIs work", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Animation id="anim" duration="200" animation="{animObj}">
          <Text testId="child">Animated</Text>
        </Animation>
        <Button testId="startBtn" label="Start" onClick="anim.start()" />
        <Button testId="stopBtn" label="Stop" onClick="anim.stop()" />
      </VStack>`,
      {
        ...EXT,
        mainXs: `var animObj = { from: { opacity: 0 }, to: { opacity: 1 } };`,
      },
    );
    await page.getByTestId("startBtn").click();
    await expect(page.getByTestId("child")).toBeAttached();
    await page.getByTestId("stopBtn").click();
    await expect(page.getByTestId("child")).toBeAttached();
  });
});
