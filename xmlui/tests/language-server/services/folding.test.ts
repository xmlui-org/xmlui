import { describe, expect, it } from "vitest";
import { handleFoldingRanges } from "../../../src/language-server/services/folding";
import { Project } from "../../../src/language-server/base/project";
import { mockMetadataProvider } from "../mockData";
import type { FoldingRange } from "vscode-languageserver";
import { FoldingRangeKind } from "vscode-languageserver";

/**
 * Extract folding ranges from source code.
 * Converts byte offset to line-based folding ranges.
 */
function getFoldingRanges(source: string): FoldingRange[] {
  const uri = "file://test.xmlui";
  const project = Project.fromFileContets({ [uri]: source }, mockMetadataProvider);
  return handleFoldingRanges(project, uri);
}

/**
 * Helper to verify expected fold ranges.
 * startLine and endLine are 0-indexed (LSP format).
 */
function expectFoldRange(
  ranges: FoldingRange[],
  startLine: number,
  endLine: number,
  kind?: FoldingRangeKind,
): void {
  const expectedRange: FoldingRange = { startLine, endLine };
  if (kind) {
    expectedRange.kind = kind;
  }
  expect(ranges).toContainEqual(expectedRange);
}

describe("Folding Ranges", () => {
  describe("Paired element tags", () => {
    it("folds script tag", () => {
      const source = `<script>
  text
</script>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1 });
    });

    it("doesn't fold paired tag spanning 2 lines", () => {
      const source = `<Button>
</Button>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toBeNull();
    });

    it("folds simple paired tag", () => {
      const source = `<Button>
  text
</Button>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1 });
    });

    it("folds multiple paired tag", () => {
      const source = `<Stack>
  <Button>
    text
  </Button>
  <Text>content</Text>
</Stack>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(2);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 4 });
      expect(ranges).toContainEqual({ startLine: 1, endLine: 2 });
    });

    it("does not fold single-line paired tag", () => {
      const source = `<Button>text</Button>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toBeNull();
    });

    it("folds paired tag with attributes on opening tag (no double fold)", () => {
      const source = `<FlowLayout
  direction="column"
  gap="8">
  content
</FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 3 });
    });

    it("folds paired tag with attributes after name", () => {
      const source = `<
  FlowLayout
  direction="column"
  gap="8">
  content
</FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 1, endLine: 4 });
    });

    it("folds paired tag with attributes after name and attr", () => {
      const source = `<FlowLayout direction="column"
  gap="8">
  content
</FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 2 });
    });

    it("folds paired tag closing tagname on newline", () => {
      const source = `<FlowLayout direction="column"
  gap="8">
  content
</
FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 2 });
    });

    it("folds paired tag no open tagname", () => {
      const source = `<>
  content
</ FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1 });
    });

    it("folds paired tag no open tagname multiline open tag", () => {
      const source = `<
        >
  content
</ FlowLayout>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 2 });
    });

    it("folds tag no end for open tag", () => {
      const source = `<Stack>
        <Stack content
        <Stack content/>
        </Stack>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(1);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 2 });
    });

    it("handles element with only whitespace", () => {
      const source = `<Container>

</Container>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1 });
    });

    it("handles multiple top-level elements", () => {
      const source = `<Header>
      content
    </Header>
    <Main>
        console.log("Generated ranges:", JSON.stringify(ranges, null, 2));
      content
    </Main>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1 }); // <Header>
      expect(ranges).toContainEqual({ startLine: 3, endLine: 5 }); // <Main>
    });
  });

  describe("Self-closing tags", () => {
    it("folds self-closing tag no end for open tag", () => {
      const source = `<Stack>
        <Stack
        content
        content
        content
        <Stack content/>
      </Stack>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(2);
      expect(ranges).toContainEqual({ startLine: 1, endLine: 3 });
    });
  });

  it("doesn't fold self-closing tag spanning two lines", () => {
    const source = `<Button
  text="Click me" />`;
    const ranges = getFoldingRanges(source);
    expect(ranges).toBeNull();
  });

  it("folds self-closing tag with many attributes", () => {
    const source = `<Icon
  name="star"
  size="large"
  color="blue" />`;
    const ranges = getFoldingRanges(source);
    expect(ranges).toContainEqual({ startLine: 0, endLine: 2 });
  });

  it("does not fold single-line self-closing tag", () => {
    const source = `<Icon name="star" />`;
    const ranges = getFoldingRanges(source);
    expect(ranges).toBeNull();
  });

  it("folds self-closing within paired tag", () => {
    const source = `<Stack>
  <Button
    content
    text="Click" />
</Stack>`;
    const ranges = getFoldingRanges(source);
    expect(ranges).toContainEqual({ startLine: 0, endLine: 3 }); // <Stack>
    expect(ranges).toContainEqual({ startLine: 1, endLine: 2 }); // <Button
  });

  describe("Comments", () => {
    it("folds multi-line comment with Comment kind", () => {
      const source = `<!-- This is a
    multi-line comment
    spanning 3 lines -->`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toContainEqual({ startLine: 0, endLine: 1, kind: FoldingRangeKind.Comment });
    });

    it("does not fold single-line comment", () => {
      const source = `<!-- single line comment -->`;
      const ranges = getFoldingRanges(source);
      expect(ranges.length).toBe(0);
    });

    it("folds comment within element", () => {
      const source = `<Stack>
    <!-- Comment
      spanning
      lines -->
    <Button />
  </Stack>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(2);
      expect(ranges).toContainEqual({ startLine: 1, endLine: 2, kind: FoldingRangeKind.Comment });
    });

    it("wip", () => {
      const source = `<Stack>
            hi there <!-- Comment
          lines --> <Button >
          content
        </Button >
      </Stack>`;
      const ranges = getFoldingRanges(source);
      expect(ranges).toHaveLength(2);
      expect(ranges).toContainEqual({ startLine: 2, endLine: 3 });
    });
  });
});
