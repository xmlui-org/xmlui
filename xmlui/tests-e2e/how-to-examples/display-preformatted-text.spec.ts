import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/display-preformatted-text.md"),
);

test.describe("The default collapses whitespace", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "The default collapses whitespace",
  );

  // The claim the whole how-to opens with: without preserveLinebreaks, runs of
  // spaces and line breaks collapse (white-space: normal). With it, they don't
  // (white-space: pre-wrap). Testing computed style is the direct check —
  // textContent is identical in both cases, only the rendering differs.
  test("default is white-space: normal; preserveLinebreaks is pre-wrap", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const collapsed = page.getByTestId("collapsed");
    const preserved = page.getByTestId("preserved");
    await expect(collapsed).toBeVisible();
    await expect(preserved).toBeVisible();

    await expect(collapsed).toHaveCSS("white-space", "normal");
    await expect(preserved).toHaveCSS("white-space", "pre-wrap");

    // Visible proof, not just the computed property: the preserved block keeps
    // three lines of content and is taller than the single-line collapsed block.
    const collapsedBox = await collapsed.boundingBox();
    const preservedBox = await preserved.boundingBox();
    expect(collapsedBox).not.toBeNull();
    expect(preservedBox).not.toBeNull();
    expect(preservedBox!.height).toBeGreaterThan(collapsedBox!.height * 1.5);
  });
});

test.describe("Spacing vs monospace: two separate decisions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Spacing vs monospace: two separate decisions",
  );

  // The doc's central claim: preserving whitespace and choosing a monospace font
  // are independent, and only doing both aligns columns. Alignment is measured
  // directly — the x-position of the second column's text on each of the two
  // data rows — rather than inferred from font-family alone, since that is the
  // property a reader actually cares about.
  test("only preserveLinebreaks + monospace aligns the columns", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const proportional = page.getByTestId("proportional");
    const monoOnly = page.getByTestId("mono-only");
    const monoPreserved = page.getByTestId("mono-preserved");
    await expect(proportional).toBeVisible();
    await expect(monoOnly).toBeVisible();
    await expect(monoPreserved).toBeVisible();

    // preserveLinebreaks alone: whitespace preserved (pre-wrap), font not monospace.
    await expect(proportional).toHaveCSS("white-space", "pre-wrap");
    const proportionalFont = await proportional.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(proportionalFont.toLowerCase()).not.toContain("monospace");

    // monospace variant alone (variant="code" renders an inline <code>, which
    // carries no whitespace-preserving default): whitespace collapses back to
    // one line (normal), so the "table" reads as a single run-on line.
    await expect(monoOnly).toHaveCSS("white-space", "normal");

    // Both together: pre-wrap AND a monospace font family.
    await expect(monoPreserved).toHaveCSS("white-space", "pre-wrap");
    const monoPreservedFont = await monoPreserved.evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(monoPreservedFont.toLowerCase()).toContain("mono");

    // Direct alignment check on the "both" block: find the two data rows and
    // assert the "Qty" column starts at the same x-coordinate on each — the
    // property the whole section exists to demonstrate.
    const text = await monoPreserved.innerText();
    const lines = text.split("\n");
    expect(lines.length).toBe(3);
    // Locate the qty column (last run of digits on each data row) via a
    // range so we can read its bounding box directly from the DOM text node.
    const qtyRects = await monoPreserved.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const rects: number[] = [];
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const value = node.nodeValue ?? "";
        const rowLines = value.split("\n");
        let offset = 0;
        for (const line of rowLines) {
          const match = /(\d+)\s*$/.exec(line);
          if (match && /[a-z]/i.test(line)) {
            const start = offset + line.length - match[1].length;
            const range = document.createRange();
            range.setStart(node, start);
            range.setEnd(node, start + match[1].length);
            rects.push(range.getBoundingClientRect().left);
          }
          offset += line.length + 1;
        }
      }
      return rects;
    });
    expect(qtyRects.length).toBe(2);
    expect(Math.abs(qtyRects[0] - qtyRects[1])).toBeLessThan(1);
  });
});

test.describe("No wrap: bounded horizontal scroll", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "No wrap: bounded horizontal scroll",
  );

  // The overflow claim: whiteSpace="pre" refuses to wrap (unlike
  // preserveLinebreaks's pre-wrap), so a bounded container needs its own
  // horizontal scroll rather than letting the line force page-level overflow.
  test("whiteSpace=pre does not wrap; the bounded box scrolls instead", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const wrapBox = page.getByTestId("wrap-box");
    const scrollBox = page.getByTestId("scroll-box");
    const scrollText = page.getByTestId("scroll-text");
    await expect(wrapBox).toBeVisible();
    await expect(scrollBox).toBeVisible();

    await expect(scrollText).toHaveCSS("white-space", "pre");
    await expect(scrollBox).toHaveCSS("overflow-x", "auto");

    // The wrapping box grows taller than a single line because its content
    // wraps across several visual lines.
    const wrapBoxBox = await wrapBox.boundingBox();
    expect(wrapBoxBox).not.toBeNull();
    const singleLineHeight = await scrollText.evaluate(
      (el) => el.getBoundingClientRect().height,
    );
    expect(wrapBoxBox!.height).toBeGreaterThan(singleLineHeight * 1.5);

    // The scroll box's content overflows its own width (proving the long line
    // did not wrap to fit) without the page itself gaining horizontal scroll.
    const overflows = await scrollBox.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows).toBe(true);
    const pageOverflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(pageOverflows).toBe(false);
  });
});
