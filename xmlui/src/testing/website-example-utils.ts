import * as fs from "fs";
import type { ApiInterceptorDefinition } from "../../src/components-core/interception/abstractions";

export function getExampleSource(absoluteFilePath: string) {
  try {
    return fs.readFileSync(absoluteFilePath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read example file at ${absoluteFilePath}: ${(err as Error).message}`);
  }
}

export function extractXmluiExample(markdown: string, name: string): ExtractedExample {
  // Matches ```xmlui-pg ... name="NAME" ... \n<content>\n```
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    '```xmlui-pg[^\\n]*\\bname="' + escaped + '"[^\\n]*\\n([\\s\\S]*?)```',
    "m",
  );
  const match = markdown.match(pattern);
  if (!match) throw new Error(`No xmlui-pg example named "${name}" found`);
  return parseXmluiExampleContent(match[1]);
}

function parseXmluiExampleContent(content: string): ExtractedExample {
  // If no section markers, the whole content is the app source
  if (!/^---(?:app|comp|api|desc|config)\b/m.test(content)) {
    return { app: content.trim() };
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

  return result;
}

type ExtractedExample = {
  app: string;
  components?: string[];
  apiInterceptor?: ApiInterceptorDefinition;
};
