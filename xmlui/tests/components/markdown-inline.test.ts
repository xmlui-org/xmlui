import { describe, expect, it } from "vitest";
import {
  observeInlinePattern,
  convertInlinePatternToMarkdown,
} from "../../src/components/Markdown/utils";
import { decodeFromBase64 } from "../../src/components-core/utils/base64-utils";

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
