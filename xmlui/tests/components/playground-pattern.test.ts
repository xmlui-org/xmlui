import { describe, expect, it } from "vitest";
import {
  convertPlaygroundPatternToMarkdown,
  observePlaygroundPattern,
  parsePlaygroundPattern,
  parseSegmentProps,
} from "../../src/components/Markdown/utils";

describe("Playground pattern parsing", () => {
  it("No playground #1", () => {
    // --- Act
    const source = "```xmlui-pg\n";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).toBeNull();
  });

  it("No playground #2", () => {
    // --- Act
    const source = "```xmlui\n";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).toBeNull();
  });

  it("No playground #3", () => {
    // --- Act
    const source = "```xmlui\n```";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).toBeNull();
  });

  it("Empty playground #1", () => {
    // --- Act
    const source = "```xmlui-pg\n```";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).not.toBeNull();
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(15);
    expect(result[2]).toBe("```xmlui-pg\n```");
  });

  it("Empty playground #2", () => {
    // --- Act
    const source = "some text before```xmlui-pg\n```some text after";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).not.toBeNull();
    expect(result[0]).toBe(16);
    expect(result[1]).toBe(31);
    expect(result[2]).toBe("```xmlui-pg\n```");
  });

  it("Playground with \\``` literal #1", () => {
    // --- Act
    const source = "```xmlui-pg\nsome text \\``` more text\n```";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).not.toBeNull();
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(40);
    expect(result[2]).toBe("```xmlui-pg\nsome text \\``` more text\n```");
  });

  it("Playground with \\``` literal #2", () => {
    // --- Act
    const source = "```xmlui-pg\nsome text \\``` more \\``` text\n```";

    const result = observePlaygroundPattern(source);

    // --- Assert
    expect(result).not.toBeNull();
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(45);
    expect(result[2]).toBe("```xmlui-pg\nsome text \\``` more \\``` text\n```");
  });

  it("Parses display and copy flags", () => {
    // --- Act
    const input = "display copy";

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result.display).toBe(true);
    expect(result.copy).toBe(true);
    expect(result.highlights).toBeUndefined();
    expect(result.filename).toBeUndefined();
    expect(result.name).toBeUndefined();
  });

  it("Parses highlights", () => {
    // --- Act
    const input = "{1,2,4-6}";

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.display).toBeUndefined();
    expect(result.copy).toBeUndefined();
    expect(result.filename).toBeUndefined();
    expect(result.name).toBeUndefined();
  });

  it("Parses filename and name", () => {
    // --- Act
    const input = 'filename="Main.xmlui" name="MyApp example"';

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result.filename).toBe("Main.xmlui");
    expect(result.name).toBe("MyApp example");
    expect(result.display).toBeUndefined();
    expect(result.copy).toBeUndefined();
    expect(result.highlights).toBeUndefined();
  });

  it("Parses all properties together", () => {
    // --- Act
    const input = 'display copy {1,2,4-10} filename="Main.xmlui" name="MyApp example"';

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result.display).toBe(true);
    expect(result.copy).toBe(true);
    expect(result.highlights).toEqual([1, 2, [4, 10]]);
    expect(result.filename).toBe("Main.xmlui");
    expect(result.name).toBe("MyApp example");
  });

  it("Handles empty input", () => {
    // --- Act
    const input = "";

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result).toEqual({});
  });

  it("Handles input with no matching properties", () => {
    // --- Act
    const input = "some random text";

    const result = parseSegmentProps(input);

    // --- Assert
    expect(result).toEqual({});
  });

  it("Extracts the 'default' PlaygroundPattern property", () => {
    // --- Act
    const content =
      '```xmlui-pg display copy {1,2,4-6} height="300px" filename="Main.xmlui" name="MyApp example"\n```';

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBe(true);
    expect(result.default?.copy).toBe(true);
    expect(result.default?.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.default.height).toEqual("300px");
    expect(result.default?.filename).toBe("Main.xmlui");
    expect(result.default?.name).toBe("MyApp example");
  });

  it("Extracts PlaygroundPattern with only display and copy flags", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg display copy
     \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBe(true);
    expect(result.default?.copy).toBe(true);
    expect(result.default?.highlights).toBeUndefined();
    expect(result.default?.filename).toBeUndefined();
    expect(result.default?.name).toBeUndefined();
  });

  it("Extracts PlaygroundPattern with noPopup flags", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg noPopup
     \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBeUndefined();
    expect(result.default?.copy).toBeUndefined();
    expect(result.default?.highlights).toBeUndefined();
    expect(result.default?.filename).toBeUndefined();
    expect(result.default?.name).toBeUndefined();
    expect(result.default?.noPopup).toBe(true);
  });

  it("Extracts PlaygroundPattern with filename only", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg filename="Example.xmlui"
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBeUndefined();
    expect(result.default?.copy).toBeUndefined();
    expect(result.default?.highlights).toBeUndefined();
    expect(result.default?.filename).toBe("Example.xmlui");
    expect(result.default?.name).toBeUndefined();
  });

  it("Extracts PlaygroundPattern with name only", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg name="Sample App"
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBeUndefined();
    expect(result.default?.copy).toBeUndefined();
    expect(result.default?.highlights).toBeUndefined();
    expect(result.default?.filename).toBeUndefined();
    expect(result.default?.name).toBe("Sample App");
  });

  it("Extracts PlaygroundPattern with highlights only", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg {3,5,7-9}
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default?.display).toBeUndefined();
    expect(result.default?.copy).toBeUndefined();
    expect(result.default?.highlights).toEqual([3, 5, [7, 9]]);
    expect(result.default?.filename).toBeUndefined();
    expect(result.default?.name).toBeUndefined();
  });

  it("Extracts PlaygroundPattern with all properties missing", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.default).toBeDefined();
    expect(result.default).toEqual({});
  });

  it("Extracts default app #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts default app #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg copy
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBe(true);
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts default app #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg display
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBe(true);
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts default app #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg {1,2,4-6}
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts default app #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg filename="Main.xmlui"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBe("Main.xmlui");
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts default app #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg name="MyApp example"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBe("MyApp example");
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app copy
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBe(true);
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBe(true);
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app {1,2,4-6}
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app filename="Main.xmlui"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBe("Main.xmlui");
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts explicit app #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app name="MyApp example"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBe("MyApp example");
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts app with empty lines", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app

<Button>Click me</Button>
<Text>Hello</Text>

<Text>World</Text>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe(
      "\n<Button>Click me</Button>\n<Text>Hello</Text>\n\n<Text>World</Text>\n",
    );
  });

  it("Explicit app overrides app #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
<Something />
---app
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Next explicit app overrides the previous #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
<Something />
---app
<Text>Hello</Text>
---app
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.app).toBeDefined();
    expect(result.app.copy).toBeUndefined();
    expect(result.app.display).toBeUndefined();
    expect(result.app.highlights).toBeUndefined();
    expect(result.app.filename).toBeUndefined();
    expect(result.app.name).toBeUndefined();
    expect(result.app.content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp
<Button>Click me</Button>
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp copy
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBe(true);
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp display
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBe(true);
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp {1,2,4-6}
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toEqual([1, 2, [4, 6]]);
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp filename="Main.xmlui"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBe("Main.xmlui");
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts components #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp name="MyApp example"
<Button>Click me</Button>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(1);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBe("MyApp example");
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
  });

  it("Extracts multiple components #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp
<Button>Click me</Button>
---comp
<Text>Hello</Text>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(2);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
    expect(result.components?.[1].copy).toBeUndefined();
    expect(result.components?.[1].display).toBeUndefined();
    expect(result.components?.[1].highlights).toBeUndefined();
    expect(result.components?.[1].filename).toBeUndefined();
    expect(result.components?.[1].name).toBeUndefined();
    expect(result.components?.[1].content).toBe("<Text>Hello</Text>\n");
  });

  it("Extracts multiple components #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---comp
<Button>Click me</Button>
---comp
<Text>Hello</Text>
---comp
<Text>World</Text>
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.components).toBeDefined();
    expect(result.components?.length).toBe(3);
    expect(result.components?.[0].copy).toBeUndefined();
    expect(result.components?.[0].display).toBeUndefined();
    expect(result.components?.[0].highlights).toBeUndefined();
    expect(result.components?.[0].filename).toBeUndefined();
    expect(result.components?.[0].name).toBeUndefined();
    expect(result.components?.[0].content).toBe("<Button>Click me</Button>\n");
    expect(result.components?.[1].copy).toBeUndefined();
    expect(result.components?.[1].display).toBeUndefined();
    expect(result.components?.[1].highlights).toBeUndefined();
    expect(result.components?.[1].filename).toBeUndefined();
    expect(result.components?.[1].name).toBeUndefined();
    expect(result.components?.[1].content).toBe("<Text>Hello</Text>\n");
    expect(result.components?.[2].copy).toBeUndefined();
    expect(result.components?.[2].display).toBeUndefined();
    expect(result.components?.[2].highlights).toBeUndefined();
    expect(result.components?.[2].filename).toBeUndefined();
    expect(result.components?.[2].name).toBeUndefined();
    expect(result.components?.[2].content).toBe("<Text>World</Text>\n");
  });

  it("Extracts config #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBeUndefined();
    expect(result.config.display).toBeUndefined();
    expect(result.config.highlights).toBeUndefined();
    expect(result.config.filename).toBeUndefined();
    expect(result.config.name).toBeUndefined();
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts config #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config copy
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBe(true);
    expect(result.config.display).toBeUndefined();
    expect(result.config.highlights).toBeUndefined();
    expect(result.config.filename).toBeUndefined();
    expect(result.config.name).toBeUndefined();
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts config #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config display
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBeUndefined();
    expect(result.config.display).toBe(true);
    expect(result.config.highlights).toBeUndefined();
    expect(result.config.filename).toBeUndefined();
    expect(result.config.name).toBeUndefined();
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts config #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config {1,2,4-6}
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBeUndefined();
    expect(result.config.display).toBeUndefined();
    expect(result.config.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.config.filename).toBeUndefined();
    expect(result.config.name).toBeUndefined();
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts config #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config filename="Main.xmlui"
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBeUndefined();
    expect(result.config.display).toBeUndefined();
    expect(result.config.highlights).toBeUndefined();
    expect(result.config.filename).toBe("Main.xmlui");
    expect(result.config.name).toBeUndefined();
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts config #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---config name="MyApp example"
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.config).toBeDefined();
    expect(result.config.copy).toBeUndefined();
    expect(result.config.display).toBeUndefined();
    expect(result.config.highlights).toBeUndefined();
    expect(result.config.filename).toBeUndefined();
    expect(result.config.name).toBe("MyApp example");
    expect(result.config.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBeUndefined();
    expect(result.api.display).toBeUndefined();
    expect(result.api.highlights).toBeUndefined();
    expect(result.api.filename).toBeUndefined();
    expect(result.api.name).toBeUndefined();
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api copy
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBe(true);
    expect(result.api.display).toBeUndefined();
    expect(result.api.highlights).toBeUndefined();
    expect(result.api.filename).toBeUndefined();
    expect(result.api.name).toBeUndefined();
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api display
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBeUndefined();
    expect(result.api.display).toBe(true);
    expect(result.api.highlights).toBeUndefined();
    expect(result.api.filename).toBeUndefined();
    expect(result.api.name).toBeUndefined();
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api {1,2,4-6}
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBeUndefined();
    expect(result.api.display).toBeUndefined();
    expect(result.api.highlights).toEqual([1, 2, [4, 6]]);
    expect(result.api.filename).toBeUndefined();
    expect(result.api.name).toBeUndefined();
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api filename="Main.xmlui"
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBeUndefined();
    expect(result.api.display).toBeUndefined();
    expect(result.api.highlights).toBeUndefined();
    expect(result.api.filename).toBe("Main.xmlui");
    expect(result.api.name).toBeUndefined();
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts api #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---api name="MyApp example"
{ apiUrl: "/api"}
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.api).toBeDefined();
    expect(result.api.copy).toBeUndefined();
    expect(result.api.display).toBeUndefined();
    expect(result.api.highlights).toBeUndefined();
    expect(result.api.filename).toBeUndefined();
    expect(result.api.name).toBe("MyApp example");
    expect(result.api.content).toBe('{ apiUrl: "/api"}\n');
  });

  it("Extracts descriptions #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc
**This is a description**.
  \`\`\``;

    const result = parsePlaygroundPattern(content);

    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBeUndefined();
    expect(result.descriptions?.[0].display).toBeUndefined();
    expect(result.descriptions?.[0].highlights).toBeUndefined();
    expect(result.descriptions?.[0].filename).toBeUndefined();
    expect(result.descriptions?.[0].name).toBeUndefined();
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Extracts descriptions #2", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc copy
**This is a description**.
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBe(true);
    expect(result.descriptions?.[0].display).toBeUndefined();
    expect(result.descriptions?.[0].highlights).toBeUndefined();
    expect(result.descriptions?.[0].filename).toBeUndefined();
    expect(result.descriptions?.[0].name).toBeUndefined();
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Extracts descriptions #3", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc display
**This is a description**.
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBeUndefined();
    expect(result.descriptions?.[0].display).toBe(true);
    expect(result.descriptions?.[0].highlights).toBeUndefined();
    expect(result.descriptions?.[0].filename).toBeUndefined();
    expect(result.descriptions?.[0].name).toBeUndefined();
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Extracts descriptions #4", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc {1,2,4-6}
**This is a description**.
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBeUndefined();
    expect(result.descriptions?.[0].display).toBeUndefined();
    expect(result.descriptions?.[0].highlights).toEqual([1, 2, [4, 6]]);
    expect(result.descriptions?.[0].filename).toBeUndefined();
    expect(result.descriptions?.[0].name).toBeUndefined();
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Extracts descriptions #5", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc filename="Main.xmlui"
**This is a description**.
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBeUndefined();
    expect(result.descriptions?.[0].display).toBeUndefined();
    expect(result.descriptions?.[0].highlights).toBeUndefined();
    expect(result.descriptions?.[0].filename).toBe("Main.xmlui");
    expect(result.descriptions?.[0].name).toBeUndefined();
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Extracts descriptions #6", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---desc name="MyApp example"
**This is a description**.
  \`\`\``;
    const result = parsePlaygroundPattern(content);
    // --- Assert
    expect(result.descriptions).toBeDefined();
    expect(result.descriptions?.length).toBe(1);
    expect(result.descriptions?.[0].copy).toBeUndefined();
    expect(result.descriptions?.[0].display).toBeUndefined();
    expect(result.descriptions?.[0].highlights).toBeUndefined();
    expect(result.descriptions?.[0].filename).toBeUndefined();
    expect(result.descriptions?.[0].name).toBe("MyApp example");
    expect(result.descriptions?.[0].content).toBe("**This is a description**.\n");
  });

  it("Convert default app #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
<Button>Click me</Button>
  \`\`\``;

    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown=""></samp>\n\n`,
    );
  });

  it("Convert default app #2", () => {
    // --- Act
    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const content = `\`\`\`xmlui-pg display
<Button>Click me</Button>
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
    });
  });

  it("Convert default app #3", () => {
    // --- Act
    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const content = `\`\`\`xmlui-pg display copy
<Button>Click me</Button>
  \`\`\``;
    const result = convertPlaygroundPatternToMarkdown(content);
    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgY29weQo8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+CmBgYAoK"></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
    });
  });

  it("Convert explicit app #1", () => {
    // --- Act
    const content = `\`\`\`xmlui-pg
---app
<Button>Click me</Button>
  \`\`\``;

    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown=""></samp>\n\n`,
    );
  });

  it("Convert explicit app #2", () => {
    // --- Act
    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
    });
  });

  it("Convert explicit app #3", () => {
    // --- Act
    const base64 = "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==";
    const content = `\`\`\`xmlui-pg
---app display copy
<Button>Click me</Button>
  \`\`\``;
    const result = convertPlaygroundPatternToMarkdown(content);
    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgY29weQo8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+CmBgYAoK"></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
    });
  });

  it("Convert explicit app+comp #1", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp
<Component name="MyComponent" />
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
    });
  });

  it("Convert explicit app+comp #2", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
    });
  });

  it("Convert explicit app+comp #3", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiIsIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
---comp display
<Component name="MyComponent" />
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiIsIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n', '<Component name="MyComponent" />\n'],
    });
  });

  it("Convert explicit app+comp+config #1", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIn0=";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
---config
{ apiUrl: "/api" }
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIn0=" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
      config: '{ apiUrl: "/api" }\n',
    });
  });

  it("Convert explicit app+comp+config #2", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIn0=";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
---config display
{ apiUrl: "/api" }
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIn0=" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgpgYGBqc29uIAp7IGFwaVVybDogIi9hcGkiIH0KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
      config: '{ apiUrl: "/api" }\n',
    });
  });

  it("Convert explicit app+comp+config+api #1", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIiwiYXBpIjoieyBvcGVyYXRpb246IFwiL3NvbWVcIiB9XG4ifQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
---config
{ apiUrl: "/api" }
---api
{ operation: "/some" }
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIiwiYXBpIjoieyBvcGVyYXRpb246IFwiL3NvbWVcIiB9XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
      config: '{ apiUrl: "/api" }\n',
      api: '{ operation: "/some" }\n',
    });
  });

  it("Convert explicit app+comp+config+api #2", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIiwiYXBpIjoieyBvcGVyYXRpb246IFwiL3NvbWVcIiB9XG4ifQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---comp display
<Component name="MyComponent" />
---config
{ apiUrl: "/api" }
---api display
{ operation: "/some" }
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdLCJjb25maWciOiJ7IGFwaVVybDogXCIvYXBpXCIgfVxuIiwiYXBpIjoieyBvcGVyYXRpb246IFwiL3NvbWVcIiB9XG4ifQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgpgYGB4bWx1aSAKPENvbXBvbmVudCBuYW1lPSJNeUNvbXBvbmVudCIgLz4KYGBgCgo="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
      config: '{ apiUrl: "/api" }\n',
      api: '{ operation: "/some" }\n',
    });
  });

  it("Convert explicit app+desc+comp #1", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---desc
**This is a description #1**.
---comp display
<Component name="MyComponent" />
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgoqKlRoaXMgaXMgYSBkZXNjcmlwdGlvbiAjMSoqLgoKYGBgeG1sdWkgCjxDb21wb25lbnQgbmFtZT0iTXlDb21wb25lbnQiIC8+CmBgYAoK"></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
    });
  });

  it("Convert explicit app+desc+comp #2", () => {
    // --- Act
    const base64 =
      "eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==";
    const content = `\`\`\`xmlui-pg
---app display
<Button>Click me</Button>
---desc
**This is a description #1**.
---comp display
<Component name="MyComponent" />
---desc
**This is a description #2**.
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(
      `<samp data-pg-content="eyJhcHAiOiI8QnV0dG9uPkNsaWNrIG1lPC9CdXR0b24+XG4iLCJjb21wb25lbnRzIjpbIjxDb21wb25lbnQgbmFtZT1cIk15Q29tcG9uZW50XCIgLz5cbiJdfQ==" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgoqKlRoaXMgaXMgYSBkZXNjcmlwdGlvbiAjMSoqLgoKYGBgeG1sdWkgCjxDb21wb25lbnQgbmFtZT0iTXlDb21wb25lbnQiIC8+CmBgYAoKKipUaGlzIGlzIGEgZGVzY3JpcHRpb24gIzIqKi4KCg=="></samp>\n\n`,
    );
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      components: ['<Component name="MyComponent" />\n'],
    });
  });

  it("Convert wight height", () => {
    // --- Act
    const base64 = "eyJoZWlnaHQiOiIzMDBweCIsImFwcCI6IjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj5cbiJ9";
    const content = `\`\`\`xmlui-pg display height="300px"
<Button>Click me</Button>
  \`\`\``;

    const result = convertPlaygroundPatternToMarkdown(content);

    // --- Assert
    expect(result).toBe(`<samp data-pg-content="eyJoZWlnaHQiOiIzMDBweCIsImFwcCI6IjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj5cbiJ9" data-pg-markdown="YGBgeG1sdWkgCjxCdXR0b24+Q2xpY2sgbWU8L0J1dHRvbj4KYGBgCgo="></samp>\n\n`);
    expect(base64ToJson(base64)).toStrictEqual({
      app: "<Button>Click me</Button>\n",
      height: "300px",
    });
  });
});

function base64ToString(base64: string) {
  return Buffer.from(base64, "base64").toString("utf-8");
}

function base64ToJson(base64: string) {
  const jsonString = base64ToString(base64);
  return JSON.parse(jsonString);
}
