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
  kind?: FoldingRangeKind
): void {
  const expectedRange: FoldingRange = { startLine, endLine };
  if (kind) {
    expectedRange.kind = kind;
  }
  expect(ranges).toContainEqual(expectedRange);
}

describe("Folding Ranges", () => {
  describe("Paired element tags", () => {
    it("folds simple paired tag spanning two lines", () => {
      const source = `<Button>
  text
</Button>`;
      const ranges = getFoldingRanges(source);
      // Lines: 0 (Button), 1 (text), 2 (</Button>)
      expectFoldRange(ranges, 0, 2);
    });

    it("folds paired tag with content spanning multiple lines", () => {
      const source = `<Stack>
  <Button>
    text
  </Button>
  <Text>content</Text>
</Stack>`;
      const ranges = getFoldingRanges(source);
      // <Stack> ... </Stack> should fold 0-5
      expectFoldRange(ranges, 0, 5);
      // <Button> ... </Button> should fold 1-3
      expectFoldRange(ranges, 1, 3);
    });

    it("does not fold single-line paired tag", () => {
      const source = `<Button>text</Button>`;
      const ranges = getFoldingRanges(source);
      expect(ranges.length).toBe(0);
    });

    it("folds multi-line paired tag with opening tag on one line", () => {
      const source = `<FlowLayout>
  <Button />
  <Button />
</FlowLayout>`;
      const ranges = getFoldingRanges(source);
      // <FlowLayout> ... </FlowLayout> should fold 0-3
      expectFoldRange(ranges, 0, 3);
    });

    it("folds multi-line paired tag with attributes on opening tag (no double fold)", () => {
      const source = `<FlowLayout
  direction="column"
  gap="8">
  content
</FlowLayout>`;
      const ranges = getFoldingRanges(source);
      // Fold from start of <FlowLayout to end of </FlowLayout>: 0-4
      // Per user request: do NOT emit separate fold for opening tag
      expectFoldRange(ranges, 0, 4);
      expect(ranges.length).toBe(1);
    });

    it("folds deeply nested elements", () => {
      const source = `<A>
  <B>
    <C>
      text
    </C>
  </B>
</A>`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 6); // <A>
      expectFoldRange(ranges, 1, 5); // <B>
      expectFoldRange(ranges, 2, 4); // <C>
    });
  });

  describe("Self-closing tags", () => {
    it("folds self-closing tag spanning two lines", () => {
      const source = `<Button
  text="Click me" />`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 1);
    });

    it("folds self-closing tag with many attributes", () => {
      const source = `<Icon
  name="star"
  size="large"
  color="blue" />`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 3);
    });

    it("does not fold single-line self-closing tag", () => {
      const source = `<Icon name="star" />`;
      const ranges = getFoldingRanges(source);
      expect(ranges.length).toBe(0);
    });

    it("folds self-closing within paired tag", () => {
      const source = `<Stack>
  <Button
    text="Click" />
</Stack>`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 3); // <Stack>
      expectFoldRange(ranges, 1, 2); // <Button
    });
  });

  describe("Comments", () => {
    it("folds multi-line comment with Comment kind", () => {
      const source = `<!-- This is a
  multi-line comment
  spanning 3 lines -->`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 2, FoldingRangeKind.Comment);
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
      expectFoldRange(ranges, 0, 5); // <Stack>
      expectFoldRange(ranges, 1, 3, FoldingRangeKind.Comment);
    });
  });

  describe("CDATA sections", () => {
    it("folds CDATA spanning multiple lines", () => {
      const source = `<Markdown>
  <![CDATA[
    # Title
    Some content
  ]]>
</Markdown>`;
      const ranges = getFoldingRanges(source);
      // <Markdown> ... </Markdown> spans 0-5
      expectFoldRange(ranges, 0, 5);
      // CDATA spans 1-4
      expectFoldRange(ranges, 1, 4);
    });

    it("does not fold single-line CDATA", () => {
      const source = `<Markdown><![CDATA[content]]></Markdown>`;
      const ranges = getFoldingRanges(source);
      expect(ranges.length).toBe(0);
    });

    it("folds CDATA within paired tag with multiple children", () => {
      const source = `<Container>
  <Paragraph>
    <![CDATA[
      paragraph text
      more text
    ]]>
  </Paragraph>
</Container>`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 7); // <Container>
      expectFoldRange(ranges, 1, 6); // <Paragraph>
      expectFoldRange(ranges, 2, 5); // CDATA
    });
  });

  describe("Markdown with CDATA (real-world case)", () => {
    it("folds Markdown element and its CDATA content", () => {
      const source = `<Markdown
  variant="body">
  <![CDATA[
    # Heading
    Normal paragraph with **bold** and *italic*.
    
    - List item 1
    - List item 2
  ]]>
</Markdown>`;
      const ranges = getFoldingRanges(source);
      // <Markdown> paired tag: 0-9
      expectFoldRange(ranges, 0, 9);
      // CDATA: 2-8
      expectFoldRange(ranges, 2, 8);
    });
  });

  describe("Mixed nested structures", () => {
    it("folds all applicable constructs in complex document", () => {
      const source = `<!-- Header comment
  spanning
  lines -->
<App>
  <Header>
    <Title
      size="large"
      color="dark" />
  </Header>
  <!-- Sidebar comment -->
  <Sidebar>
    <Link href="/" />
  </Sidebar>
  <Main>
    <Markdown>
      <![CDATA[
        # Main content
        Text here
      ]]>
    </Markdown>
  </Main>
</App>`;
      const ranges = getFoldingRanges(source);
      // Comment at 0-2
      expectFoldRange(ranges, 0, 2, FoldingRangeKind.Comment);
      // <App> at 3-21
      expectFoldRange(ranges, 3, 21);
      // <Header> at 4-8
      expectFoldRange(ranges, 4, 8);
      // <Title> at 5-7 (self-closing multi-line)
      expectFoldRange(ranges, 5, 7);
      // <Sidebar> at 10-12
      expectFoldRange(ranges, 10, 12);
      // <Main> at 13-21
      expectFoldRange(ranges, 13, 21);
      // <Markdown> at 14-20
      expectFoldRange(ranges, 14, 20);
      // CDATA at 15-19
      expectFoldRange(ranges, 15, 19);
    });
  });

  describe("Edge cases", () => {
    it("handles empty element", () => {
      const source = `<Empty>
</Empty>`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 1);
    });

    it("handles element with only whitespace", () => {
      const source = `<Container>
  
</Container>`;
      const ranges = getFoldingRanges(source);
      expectFoldRange(ranges, 0, 2);
    });

    it("returns empty array for single-line file", () => {
      const source = `<Button text="Click" />`;
      const ranges = getFoldingRanges(source);
      expect(ranges.length).toBe(0);
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
      expectFoldRange(ranges, 0, 2); // <Header>
      expectFoldRange(ranges, 3, 5); // <Main>
    });
  });
});
