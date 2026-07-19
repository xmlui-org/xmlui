import * as fs from "fs";
import type { ApiInterceptorDefinition } from "../../src/components-core/interception/abstractions";
import { parseXmlUiMarkup } from "../parsers/xmlui-parser/parser";
import { SyntaxKind } from "../parsers/xmlui-parser/syntax-kind";
import type { Node } from "../parsers/xmlui-parser/syntax-node";

export function getExampleSource(absoluteFilePath: string) {
  try {
    return fs.readFileSync(absoluteFilePath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read example file at ${absoluteFilePath}: ${(err as Error).message}`);
  }
}

export function extractXmluiExample(markdown: string, nameOrId: string): ExtractedExample {
  // Try to match by id first, then fall back to name for backward compatibility.
  // The 'nameOrId' parameter can be either an id="..." or name="..." value from the codefence.
  // Matches ```xmlui-pg ... id="IDENTIFIER" ... \n<content>\n```
  // or ```xmlui-pg ... name="IDENTIFIER" ... \n<content>\n```
  const escaped = nameOrId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  // Try id first
  let pattern = new RegExp(
    '```xmlui-pg[^\\n]*\\bid="' + escaped + '"[^\\n]*\\n([\\s\\S]*?)```',
    "m",
  );
  let match = markdown.match(pattern);
  
  // Fall back to name if id not found
  if (!match) {
    pattern = new RegExp(
      '```xmlui-pg[^\\n]*\\bname="' + escaped + '"[^\\n]*\\n([\\s\\S]*?)```',
      "m",
    );
    match = markdown.match(pattern);
  }
  
  if (!match) throw new Error(`No xmlui-pg example with id or name "${nameOrId}" found`);
  return parseXmluiExampleContent(match[1]);
}

function parseXmluiExampleContent(content: string): ExtractedExample {
  // If no section markers, the whole content is the app source
  if (!/^---(?:app|comp|api|desc|config)\b/m.test(content)) {
    return splitInlineEntrypoint(content.trim());
  }

  // Parse ---app / ---comp / ---api sections (mirrors parsePlaygroundPattern in utils.ts)
  const result: ExtractedExample = { app: "" };
  let currentSection = "";
  let sectionContent = "";

  function closeSection() {
    const trimmed = sectionContent.trim();
    sectionContent = "";
    if (!trimmed) return;
    switch (currentSection) {
      case "app":
        result.app = trimmed;
        break;
      case "comp":
        (result.components ??= []).push(trimmed);
        break;
      case "api":
        result.apiInterceptor = JSON.parse(trimmed) as ApiInterceptorDefinition;
        break;
      // ---desc and other sections are ignored for testing purposes
      default:
        if (!result.app) {
          result.app = trimmed;
        }
    }
  }

  for (const line of content.split("\n")) {
    if (line.startsWith("---app")) {
      closeSection();
      currentSection = "app";
    } else if (line.startsWith("---comp")) {
      closeSection();
      currentSection = "comp";
    } else if (line.startsWith("---api")) {
      closeSection();
      currentSection = "api";
    } else if (line.startsWith("---")) {
      closeSection();
      currentSection = "";
    } else {
      sectionContent += line + "\n";
    }
  }
  closeSection();

  return splitInlineEntrypoint(result);
}

type ExtractedExample = {
  app: string;
  components?: string[];
  apiInterceptor?: ApiInterceptorDefinition;
};

function splitInlineEntrypoint(example: ExtractedExample | string): ExtractedExample {
  const result = typeof example === "string" ? { app: example } : example;
  if (!result.app.includes("<Component")) {
    return result;
  }

  const parsed = parseXmlUiMarkup(result.app, { role: "entrypoint" });
  if (parsed.errors.length > 0) {
    return result;
  }

  const topLevelElements = (parsed.node.children ?? []).filter(
    (child) => child.kind === SyntaxKind.ElementNode,
  );
  const inlineComponents: string[] = [];
  const appElements: Node[] = [];

  for (const element of topLevelElements) {
    if (getElementName(result.app, element) === "Component") {
      inlineComponents.push(result.app.substring(element.pos, element.end).trim());
    } else {
      appElements.push(element);
    }
  }

  if (inlineComponents.length === 0 || appElements.length !== 1) {
    return result;
  }

  return {
    ...result,
    app: result.app.substring(appElements[0].pos, appElements[0].end).trim(),
    components: [...inlineComponents, ...(result.components ?? [])],
  };
}

function getElementName(source: string, element: Node): string | undefined {
  const tagNameNode = element.children?.find((child) => child.kind === SyntaxKind.TagNameNode);
  const identifier = tagNameNode?.children?.[tagNameNode.children.length - 1];
  return identifier ? source.substring(identifier.pos, identifier.end) : undefined;
}
