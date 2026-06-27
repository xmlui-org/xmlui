import { describe, expect, it } from "vitest";

import {
  AppMd,
  ButtonMd,
  StackMd,
  TextMd,
} from "../../src/component-core/metadata";
import {
  componentReferenceSectionTitles,
  generateComponentReferenceMarkdown,
  parseComponentDocsMarkdown,
} from "../../src/metadata";
import type { XmluiComponentMetadata } from "../../src/metadata";

describe("component docs markdown compatibility", () => {
  it("parses old component docs marker blocks", () => {
    const blocks = parseComponentDocsMarkdown(`
%-DESC-START
Intro copy.
%-DESC-END

%-PROP-START label
Label example.
%-PROP-END

%-EVENT-START click
Click example.
%-EVENT-END

%-STYLE-START
Style notes.
%-STYLE-END

Free-form trailing docs.
`);

    expect(blocks.description).toBe("Intro copy.");
    expect(blocks.props.label).toBe("Label example.");
    expect(blocks.events.click).toBe("Click example.");
    expect(blocks.style).toBe("Style notes.");
    expect(blocks.rest).toBe("Free-form trailing docs.");
  });

  it("generates metadata sections with additional prop/event/style blocks", () => {
    const markdown = generateComponentReferenceMarkdown(component("Button"), {
      componentMetadata: ButtonMd,
      additionalMarkdown: `
%-DESC-START
Extra description.
%-DESC-END
%-PROP-START label
Label example.
%-PROP-END
%-EVENT-START click
Click example.
%-EVENT-END
%-STYLE-START
Style notes.
%-STYLE-END
`,
    });

    expect(markdown).toContain("# Button");
    expect(markdown).toContain("Extra description.");
    expect(markdown).toContain("| label | string | Button label. |");
    expect(markdown).toContain("Label example.");
    expect(markdown).toContain("| onClick | Click event. |");
    expect(markdown).toContain("Click example.");
    expect(markdown).toContain("## Behaviors");
    expect(markdown).toContain("Tooltip");
    expect(markdown).toContain("## Styling");
    expect(markdown).toContain("Style notes.");
  });

  it("keeps representative component reference section shape", () => {
    const cases = [
      ["App", AppMd],
      ["Button", ButtonMd],
      ["Text", TextMd],
      ["Stack", StackMd],
    ] as const;

    for (const [name, metadata] of cases) {
      const markdown = generateComponentReferenceMarkdown(component(name), {
        componentMetadata: metadata,
      });
      expect(componentReferenceSectionTitles(markdown)).toEqual(
        expect.arrayContaining([
          `# ${name}`,
          "## Props",
          "## Events",
          "## APIs",
          "## Context Variables",
          "## Templates",
          "## Behaviors",
        ]),
      );
    }
  });
});

function component(name: string): XmluiComponentMetadata {
  return {
    name,
    kind: "builtin",
    category: "component",
    description: `${name} description.`,
    allowsChildren: true,
    acceptsArbitraryProps: false,
    declarations: { local: true, global: false },
    props: [
      {
        name: "label",
        type: "string",
        description: "Button label.",
        required: false,
        expressionSupported: true,
      },
      {
        name: "tooltip",
        type: "string",
        description: "Tooltip text.",
        required: false,
        expressionSupported: true,
      },
    ],
    events: [
      {
        name: "click",
        attributeName: "onClick",
        type: "eventHandler",
        description: "Click event.",
        required: false,
        expressionSupported: false,
        async: true,
      },
    ],
    templates: [],
    contextVariables: [],
    apis: [],
    parts: [],
    themeVars: [],
    defaultThemeVars: {},
    toneSpecificThemeVars: {},
    layoutProps: true,
    examples: [],
  };
}
