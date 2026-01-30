import { describe, expect, it, vi } from "vitest";
import {
  observeInlinePattern,
  convertInlinePatternToMarkdown,
  observePlaygroundPattern,
  convertPlaygroundPatternToMarkdown,
} from "../../src/components/Markdown/utils";
import { decodeFromBase64 } from "../../src/components-core/utils/base64-utils";
import { xmlUiMarkupToComponent } from "../../src/components-core/xmlui-parser";

describe("observeInlinePattern", () => {
  it("detects basic xmlui-inline pattern", () => {
    const content = "```xmlui-inline\n<Text>Hello</Text>\n```";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![0]).toBe(0); // Start index
    expect(result![1]).toBe(content.length); // End index
    expect(result![2]).toBe(content); // Matched content
  });

  it("returns null when no pattern is found", () => {
    const content = "This is just regular markdown text.";
    const result = observeInlinePattern(content);

    expect(result).toBeNull();
  });

  it("returns null for incomplete pattern (no closing backticks)", () => {
    const content = "```xmlui-inline\n<Text>Hello</Text>";
    const result = observeInlinePattern(content);

    expect(result).toBeNull();
  });

  it("returns null for malformed pattern (no newline after start)", () => {
    const content = "```xmlui-inline```";
    const result = observeInlinePattern(content);

    expect(result).toBeNull();
  });

  it("finds first occurrence when multiple blocks exist", () => {
    const content =
      "```xmlui-inline\n<Text>First</Text>\n```\n\nSome text\n\n```xmlui-inline\n<Text>Second</Text>\n```";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![0]).toBe(0); // First block starts at 0
    expect(result![2]).toContain("First");
    expect(result![2]).not.toContain("Second");
  });

  it("handles escaped backticks correctly", () => {
    const content = "```xmlui-inline\n<Text>Code: \\```</Text>\n```";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![2]).toContain("\\```");
  });

  it("detects pattern with content before it", () => {
    const content = "# Heading\n\nSome text\n\n```xmlui-inline\n<Button>Click</Button>\n```";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![0]).toBe(content.indexOf("```xmlui-inline"));
    expect(result![2]).toContain("Button");
  });

  it("detects pattern with content after it", () => {
    const content = "```xmlui-inline\n<Button>Click</Button>\n```\n\nMore text after.";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![1]).toBe(content.indexOf("\n\nMore text after."));
  });

  it("handles empty content between markers", () => {
    const content = "```xmlui-inline\n\n```";
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![2]).toBe(content);
  });

  it("handles multi-line XMLUI markup", () => {
    const content = `\`\`\`xmlui-inline
<VStack>
  <Text>Line 1</Text>
  <Text>Line 2</Text>
  <Button>Click Me</Button>
</VStack>
\`\`\``;
    const result = observeInlinePattern(content);

    expect(result).not.toBeNull();
    expect(result![2]).toContain("VStack");
    expect(result![2]).toContain("Line 1");
    expect(result![2]).toContain("Button");
  });
});

describe("convertInlinePatternToMarkdown", () => {
  it("converts basic inline pattern to span with base64 content", () => {
    const input = "```xmlui-inline\n<Text>Hello</Text>\n```";
    const result = convertInlinePatternToMarkdown(input);

    expect(result).toContain("<span data-inline-content=");
    expect(result).toContain("</span>");
    expect(result).toMatch(/^<span data-inline-content="[^"]+"><\/span>$/);
  });

  it("encodes XMLUI content as base64", () => {
    const xmluiContent = "<Text>Hello World</Text>";
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    // Extract base64 content from result
    const match = result.match(/data-inline-content="([^"]+)"/);
    expect(match).not.toBeNull();

    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });

  it("handles empty content", () => {
    const input = "```xmlui-inline\n\n```";
    const result = convertInlinePatternToMarkdown(input);

    expect(result).toContain("<span data-inline-content=");

    const match = result.match(/data-inline-content="([^"]*)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    // Empty string may decode to null or empty string depending on implementation
    expect(decoded === "" || decoded === null).toBe(true);
  });

  it("preserves multi-line XMLUI markup", () => {
    const xmluiContent = `<VStack>
  <Text>Line 1</Text>
  <Text>Line 2</Text>
</VStack>`;
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    const match = result.match(/data-inline-content="([^"]+)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });

  it("returns unchanged content for non-inline patterns", () => {
    const input = "```javascript\nconsole.log('test');\n```";
    const result = convertInlinePatternToMarkdown(input);

    expect(result).toBe(input);
  });

  it("handles XMLUI with special characters", () => {
    const xmluiContent = '<Text>Special chars: <>&"\'</Text>';
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    const match = result.match(/data-inline-content="([^"]+)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });

  it("base64 encoding/decoding round-trip preserves content", () => {
    const xmluiContent = `<Button variant="primary" onClick="toast('Hello!')">
  Click Me
</Button>`;
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    const match = result.match(/data-inline-content="([^"]+)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });

  it("handles content with backticks inside", () => {
    const xmluiContent = "<Text>Code: `console.log()`</Text>";
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    const match = result.match(/data-inline-content="([^"]+)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });

  it("handles Unicode characters", () => {
    const xmluiContent = "<Text>Hello 世界 🌍</Text>";
    const input = `\`\`\`xmlui-inline\n${xmluiContent}\n\`\`\``;
    const result = convertInlinePatternToMarkdown(input);

    const match = result.match(/data-inline-content="([^"]+)"/);
    const base64Content = match![1];
    const decoded = decodeFromBase64(base64Content);

    expect(decoded).toBe(xmluiContent);
  });
});

describe("Markdown integration with inline patterns", () => {
  it("converts single xmlui-inline block to span tag", () => {
    const markdown = "# Heading\n\n```xmlui-inline\n<Text>Hello</Text>\n```\n\nMore text";
    
    let resolvedMd = markdown;
    const nextInline = observeInlinePattern(resolvedMd);
    
    expect(nextInline).not.toBeNull();
    
    resolvedMd =
      resolvedMd.slice(0, nextInline![0]) +
      convertInlinePatternToMarkdown(nextInline![2]) +
      resolvedMd.slice(nextInline![1]);
    
    expect(resolvedMd).toContain("<span data-inline-content=");
    expect(resolvedMd).toContain("# Heading");
    expect(resolvedMd).toContain("More text");
    expect(resolvedMd).not.toContain("```xmlui-inline");
  });

  it("converts multiple xmlui-inline blocks", () => {
    const markdown = `\`\`\`xmlui-inline
<Text>First</Text>
\`\`\`

Some text

\`\`\`xmlui-inline
<Button>Second</Button>
\`\`\``;

    let resolvedMd = markdown;
    let count = 0;
    
    while (true) {
      const nextInline = observeInlinePattern(resolvedMd);
      if (!nextInline) break;
      
      resolvedMd =
        resolvedMd.slice(0, nextInline[0]) +
        convertInlinePatternToMarkdown(nextInline[2]) +
        resolvedMd.slice(nextInline[1]);
      
      count++;
    }
    
    expect(count).toBe(2);
    expect(resolvedMd).toContain("Some text");
    expect(resolvedMd).not.toContain("```xmlui-inline");
    
    // Should have two span elements
    const spans = resolvedMd.match(/<span data-inline-content=/g);
    expect(spans?.length).toBe(2);
  });

  it("handles inline blocks with markdown before and after", () => {
    const markdown = `**Bold text**

\`\`\`xmlui-inline
<Text>Inline content</Text>
\`\`\`

*Italic text*`;

    let resolvedMd = markdown;
    const nextInline = observeInlinePattern(resolvedMd);
    
    resolvedMd =
      resolvedMd.slice(0, nextInline![0]) +
      convertInlinePatternToMarkdown(nextInline![2]) +
      resolvedMd.slice(nextInline![1]);
    
    expect(resolvedMd).toContain("**Bold text**");
    expect(resolvedMd).toContain("*Italic text*");
    expect(resolvedMd).toContain("<span data-inline-content=");
  });

  it("processes inline blocks alongside playground blocks", () => {
    const markdown = `\`\`\`xmlui-pg
<App><Text>Playground</Text></App>
\`\`\`

\`\`\`xmlui-inline
<Text>Inline</Text>
\`\`\``;

    let resolvedMd = markdown;
    
    // Process playground first (as in actual implementation)
    while (true) {
      const nextPlayground = observePlaygroundPattern(resolvedMd);
      if (!nextPlayground) break;
      
      resolvedMd =
        resolvedMd.slice(0, nextPlayground[0]) +
        convertPlaygroundPatternToMarkdown(nextPlayground[2]) +
        resolvedMd.slice(nextPlayground[1]);
    }
    
    // Then process inline
    while (true) {
      const nextInline = observeInlinePattern(resolvedMd);
      if (!nextInline) break;
      
      resolvedMd =
        resolvedMd.slice(0, nextInline[0]) +
        convertInlinePatternToMarkdown(nextInline[2]) +
        resolvedMd.slice(nextInline[1]);
    }
    
    expect(resolvedMd).toContain("<samp data-pg-content="); // From playground
    expect(resolvedMd).toContain("<span data-inline-content="); // From inline
    expect(resolvedMd).not.toContain("```xmlui-pg");
    expect(resolvedMd).not.toContain("```xmlui-inline");
  });

  it("handles empty markdown with only inline block", () => {
    const markdown = "```xmlui-inline\n<Text>Only content</Text>\n```";
    
    let resolvedMd = markdown;
    const nextInline = observeInlinePattern(resolvedMd);
    
    resolvedMd =
      resolvedMd.slice(0, nextInline![0]) +
      convertInlinePatternToMarkdown(nextInline![2]) +
      resolvedMd.slice(nextInline![1]);
    
    expect(resolvedMd).toBe(convertInlinePatternToMarkdown(markdown));
    expect(resolvedMd).toContain("<span data-inline-content=");
  });
});

describe("InlineApp component parsing", () => {
  it("parses valid XMLUI markup without errors", () => {
    const markup = "<Text>Hello World</Text>";
    const { errors, component } = xmlUiMarkupToComponent(markup);

    expect(errors).toHaveLength(0);
    expect(component).toBeDefined();
  });

  it("returns errors for invalid XMLUI markup", () => {
    const markup = "<Text>Unclosed tag";
    const { errors } = xmlUiMarkupToComponent(markup);

    expect(errors.length).toBeGreaterThan(0);
  });

  it("handles empty markup", () => {
    const markup = "";
    const { errors } = xmlUiMarkupToComponent(markup);

    // Empty markup produces an error
    expect(errors.length).toBeGreaterThan(0);
  });

  it("parses complex nested XMLUI markup", () => {
    const markup = `<VStack>
      <Text>Title</Text>
      <Button variant="primary">Click Me</Button>
    </VStack>`;
    const { errors, component } = xmlUiMarkupToComponent(markup);

    expect(errors).toHaveLength(0);
    expect(component).toBeDefined();
  });

  it("handles XMLUI with binding expressions", () => {
    const markup = '<Text>{$message}</Text>';
    const { errors, component } = xmlUiMarkupToComponent(markup);

    expect(errors).toHaveLength(0);
    expect(component).toBeDefined();
  });

  it("handles XMLUI with event handlers", () => {
    const markup = '<Button onClick="toast(\'Clicked\')">Click</Button>';
    const { errors, component } = xmlUiMarkupToComponent(markup);

    expect(errors).toHaveLength(0);
    expect(component).toBeDefined();
  });

  it("parses component with props successfully", () => {
    const markup = '<Button variant="primary" size="lg">Test</Button>';
    const { errors, component } = xmlUiMarkupToComponent(markup);

    expect(errors).toHaveLength(0);
    expect(component).toBeDefined();
  });
});
