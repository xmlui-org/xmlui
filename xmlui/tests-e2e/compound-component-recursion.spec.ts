import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// E2E tests: compound (user-defined) component recursion safety
//
// Covers two complementary mechanisms:
//  1. A static structural cycle warning emitted at registration time when two
//     or more UDCs reference each other unconditionally.
//  2. A runtime recursion-depth budget that stops unbounded UDC recursion long
//     before the browser freezes, surfacing the failure in the inline error
//     overlay (`[data-error-boundary]`).
// =============================================================================

/**
 * Capture browser-side console messages of the given types. The returned array
 * is populated as the page emits messages; pass it to assertions after the
 * markup has rendered.
 */
function captureBrowserConsole(
  page: import("@playwright/test").Page,
  types: ReadonlyArray<"warning" | "error" | "log"> = ["warning"],
): string[] {
  const messages: string[] = [];
  page.on("console", (msg) => {
    if (types.includes(msg.type() as any)) {
      messages.push(msg.text());
    }
  });
  return messages;
}

test.describe("Compound component recursion — static cycle detection", () => {
  test("warns about a direct A↔B cycle between two UDCs", async ({ initTestBed, page }) => {
    const messages = captureBrowserConsole(page, ["warning"]);
    await initTestBed(`<Fragment />`, {
      components: [
        `<Component name="MyButton"><MyText/></Component>`,
        `<Component name="MyText"><MyButton/></Component>`,
      ],
      // Keep the runtime budget low so the inevitable render recursion is
      // halted quickly even though we don't render the cycling components in
      // this test.
      appGlobals: { maxCompoundDepth: 8 },
    });

    await expect(page.locator("body")).toBeVisible();

    expect(
      messages.some(
        (m) =>
          m.includes("structural cycle among compound components") &&
          m.includes("MyButton") &&
          m.includes("MyText"),
      ),
    ).toBe(true);
  });

  test("warns about a self-referencing UDC with no terminating condition", async ({
    initTestBed,
    page,
  }) => {
    const messages = captureBrowserConsole(page, ["warning"]);
    await initTestBed(`<Fragment />`, {
      components: [`<Component name="Forever"><Forever/></Component>`],
      appGlobals: { maxCompoundDepth: 8 },
    });

    await expect(page.locator("body")).toBeVisible();

    expect(
      messages.some(
        (m) =>
          m.includes("structural cycle among compound components") && m.includes("Forever"),
      ),
    ).toBe(true);
  });

  test("does NOT warn when the only cyclic reference is guarded by a `when`", async ({
    initTestBed,
    page,
  }) => {
    const messages = captureBrowserConsole(page, ["warning"]);
    await initTestBed(
      `<Text testId="marker">marker</Text>`,
      {
        components: [
          // Self-recursive UDC, but the recursive reference is guarded by a
          // `when`, so the static cycle detector must not flag it.
          `<Component name="GuardedSelf"><GuardedSelf when="{false}"/></Component>`,
        ],
        appGlobals: { maxCompoundDepth: 8 },
      },
    );

    await expect(page.getByTestId("marker")).toBeVisible();

    expect(
      messages.some((m) => m.includes("structural cycle among compound components")),
    ).toBe(false);
  });
});

test.describe("Compound component recursion — runtime depth limit", () => {
  test("renders the inline error overlay for self-recursive UDC, no browser freeze", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Forever/>`, {
      components: [`<Component name="Forever"><Forever/></Component>`],
      // A small budget keeps the test fast; the mechanism is identical at
      // any depth. Without this, 256 synchronous renders time out the fixture.
      appGlobals: { maxCompoundDepth: 16 },
    });

    const errorOverlay = page.locator("[data-error-boundary]");
    await expect(errorOverlay).toBeVisible();
    await expect(errorOverlay).toContainText("Compound component recursion detected");
    // The chain must be minimal: "Forever → Forever"
    await expect(errorOverlay).toContainText("Forever");
  });

  test("renders the inline error overlay for an A↔B cycle, including the chain", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<MyButton/>`, {
      components: [
        `<Component name="MyButton"><MyText/></Component>`,
        `<Component name="MyText"><MyButton/></Component>`,
      ],
      // A small budget keeps the test fast; the mechanism is identical at
      // any depth.
      appGlobals: { maxCompoundDepth: 16 },
    });

    const errorOverlay = page.locator("[data-error-boundary]");
    await expect(errorOverlay).toBeVisible();
    await expect(errorOverlay).toContainText("Compound component recursion detected");
    // The chain must be minimal: "MyButton → MyText → MyButton" — not a
    // 256-entry repetition.
    await expect(errorOverlay).toContainText("MyButton");
    await expect(errorOverlay).toContainText("MyText");
  });

  test("recursive UDC with a terminating `when` renders correctly to bounded depth", async ({
    initTestBed,
    page,
  }) => {
    const messages = captureBrowserConsole(page, ["warning"]);
    await initTestBed(`<Counter depth="{0}"/>`, {
      components: [
        `
        <Component name="Counter">
          <Fragment>
            <Text testId="level-{$props.depth}">Level {$props.depth}</Text>
            <Counter when="{$props.depth &lt; 2}" depth="{$props.depth + 1}"/>
          </Fragment>
        </Component>
        `,
      ],
      appGlobals: { maxCompoundDepth: 32 },
    });

    await expect(page.getByTestId("level-0")).toBeVisible();
    await expect(page.getByTestId("level-1")).toBeVisible();
    await expect(page.getByTestId("level-2")).toBeVisible();
    // No level 3 should be rendered because the `when` cuts the recursion.
    await expect(page.getByTestId("level-3")).toHaveCount(0);

    // The recursive reference is guarded by `when`, so no static-cycle
    // warning is expected.
    expect(
      messages.some((m) => m.includes("structural cycle among compound components")),
    ).toBe(false);

    // No inline error overlay either.
    await expect(page.locator("[data-error-boundary]")).toHaveCount(0);
  });
});
