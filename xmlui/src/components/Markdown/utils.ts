export type SegmentProps = {
  display?: boolean;
  copy?: boolean;
  noPopup?: boolean;
  highlights?: (number | [number, number])[];
  filename?: string;
  name?: string;
  height?: string;
  content?: string;
  order?: number;
};

export type PlaygroundPattern = {
  default?: SegmentProps;
  app?: SegmentProps;
  components?: SegmentProps[];
  descriptions?: SegmentProps[];
  config?: SegmentProps;
  api?: SegmentProps;
};

export function observePlaygroundPattern(content: string): [number, number, string] | null {
  const startPattern = "```xmlui-pg";
  const endPattern = "```";

  const startIndex = content.indexOf(startPattern);
  if (startIndex === -1) {
    return null; // No match for the start pattern
  }

  // Find the end of the start pattern
  const startContentIndex = content.indexOf("\n", startIndex);
  if (startContentIndex === -1) {
    return null; // Malformed pattern, no newline after start
  }

  // Search for the end pattern after the start content
  let endIndex = startContentIndex;
  while (endIndex !== -1) {
    endIndex = content.indexOf(endPattern, endIndex + 1);
    if (endIndex !== -1) {
      // Check if the end pattern is not part of {pg-content} (escaped with backticks)
      const precedingChar = content[endIndex - 1];
      if (precedingChar !== "\\") {
        return [
          startIndex,
          endIndex + endPattern.length,
          content.substring(startIndex, endIndex + endPattern.length),
        ];
      }
    }
  }

  return null; // No valid end pattern found
}

export function parseSegmentProps(input: string): SegmentProps {
  const segment: SegmentProps = {};

  // --- Match the "display" flag
  if (/\bdisplay\b/.test(input)) {
    segment.display = true;
  }

  // --- Match the "copy" flag
  if (/\bcopy\b/.test(input)) {
    segment.copy = true;
  }

  // --- Match the "noPopup" flag
  if (/\bnoPopup\b/.test(input)) {
    segment.noPopup = true;
  }

  // Match the "highlights" pattern
  const highlightsMatch = input.match(/\{([^\}]+)\}/);
  if (highlightsMatch) {
    const highlights = highlightsMatch[1].split(",").map((range) => {
      if (range.includes("-")) {
        const [start, end] = range.split("-").map(Number);
        return [start, end]; // Represent ranges as [start, end]
      }
      return Number(range); // Represent single numbers as numbers
    });
    segment.highlights = highlights as (number | [number, number])[];
  }

  // Match the "filename" property
  const filenameMatch = input.match(/\bfilename="([^"]+)"/);
  if (filenameMatch) {
    segment.filename = filenameMatch[1];
  }

  // Match the "name" property
  const nameMatch = input.match(/\bname="([^"]+)"/);
  if (nameMatch) {
    segment.name = nameMatch[1];
  }

  // Match the "height" property
  const heightMatch = input.match(/\bheight="([^"]+)"/);
  if (heightMatch) {
    segment.height = heightMatch[1];
  }

  return segment;
}

export function parsePlaygroundPattern(content: string): PlaygroundPattern {
  const pattern: PlaygroundPattern = {};
  const match = observePlaygroundPattern(content);

  if (!match) {
    return pattern;
  }

  // --- Extract the pattern content
  const [_startIndex, _endIndex, patternContent] = match;
  const lines = patternContent.split("\n");
  pattern.default = parseSegmentProps(lines[0].trim());

  let segmentContent = "";
  let currentMode = "";
  let foundSegment = false;
  let order = 0;

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i];
    if (line.startsWith("---app")) {
      const appSegment = parseSegmentProps(line);
      pattern.app = { ...appSegment };
      closeCurrentMode("app");
    } else if (line.startsWith("---comp")) {
      closeCurrentMode("comp");
      const compSegment = parseSegmentProps(line);
      pattern.components ??= [];
      pattern.components.push(compSegment);
    } else if (line.startsWith("---config")) {
      const configSegment = parseSegmentProps(line);
      pattern.config ??= { ...configSegment };
      closeCurrentMode("config");
    } else if (line.startsWith("---api")) {
      const apiSegment = parseSegmentProps(line);
      pattern.api ??= { ...apiSegment };
      closeCurrentMode("api");
    } else if (line.startsWith("---desc")) {
      closeCurrentMode("desc");
      const descSegment = parseSegmentProps(line);
      pattern.descriptions ??= [];
      pattern.descriptions.push(descSegment);
    } else {
      // Append the line to the current segment content
      segmentContent += line + "\n";
    }
  }

  // --- Handle the last segment
  if (foundSegment) {
    closeCurrentMode("");
  } else {
    pattern.app = {
      ...pattern.default,
      content: segmentContent,
      order,
    };
  }

  return pattern;

  function closeCurrentMode(newMode: string) {
    foundSegment = true;
    switch (currentMode) {
      case "app":
        pattern.app.content = segmentContent;
        pattern.app.order = order++;
        break;
      case "comp":
        pattern.components[pattern.components.length - 1].content = segmentContent;
        pattern.components[pattern.components.length - 1].order = order++;
        break;
      case "config":
        pattern.config.content = segmentContent;
        pattern.config.order = order++;
        break;
      case "api":
        pattern.api.content = segmentContent;
        pattern.api.order = order++;
        break;
      case "desc":
        pattern.descriptions[pattern.descriptions.length - 1].content = segmentContent;
        pattern.descriptions[pattern.descriptions.length - 1].order = order++;
        break;
    }
    segmentContent = "";
    currentMode = newMode;
  }
}

export function convertPlaygroundPatternToMarkdown(content: string): string {
  const pattern = parsePlaygroundPattern(content);

  // --- Determine max order for segments
  let maxOrder = 0;
  if (pattern.app?.order > maxOrder) {
    maxOrder = pattern.app.order;
  }
  if (pattern.config?.order > maxOrder) {
    maxOrder = pattern.config.order;
  }
  if (pattern.api?.order > maxOrder) {
    maxOrder = pattern.api.order;
  }
  if (pattern.descriptions) {
    pattern.descriptions.forEach((desc) => {
      if (desc.order > maxOrder) {
        maxOrder = desc.order;
      }
    });
  }
  if (pattern.components) {
    pattern.components.forEach((comp) => {
      if (comp.order > maxOrder) {
        maxOrder = comp.order;
      }
    });
  }

  // --- Assemble the final markdown content
  let markdownContent = "";
  const pgContent: any = { noPopup: pattern.default?.noPopup };

  // --- Extract optional playground attributes
  if (pattern.default.height) {
    pgContent.height = pattern.default.height;
  }
  if (pattern.default.name) {
    pgContent.name = pattern.default.name;
  }

  // --- Iterate through segments
  for (let i = 0; i <= maxOrder; i++) {
    let segment: SegmentProps | undefined;
    let type = "";
    if (pattern.app?.order === i) {
      segment = pattern.app;
      type = "app";
    } else if (pattern.config?.order === i) {
      segment = pattern.config;
      type = "config";
    } else if (pattern.api?.order === i) {
      segment = pattern.api;
      type = "api";
    }
    if (!segment && pattern.descriptions) {
      const descSegment = pattern.descriptions.find((desc) => desc.order === i);
      if (descSegment) {
        segment = descSegment;
        type = "desc";
      }
    }
    if (!segment && pattern.components) {
      const compSegment = pattern.components.find((comp) => comp.order === i);
      if (compSegment) {
        segment = compSegment;
        type = "comp";
      }
    }
    if (segment === undefined) {
      continue; // Skip if no segment found
    }

    // --- Assemble the app
    // --- Assemble segment attributes
    let segmentAttrs =
      `${segment.copy ? "copy" : ""} ` +
      `${segment.filename ? `filename="${segment.filename}"` : ""} ` +
      `${segment.name ? `name="${segment.name}"` : ""}`;
    if (segment.highlights && segment.highlights.length > 0) {
      const highlights = segment.highlights
        .map((highlight) =>
          Array.isArray(highlight) ? `${highlight[0]}-${highlight[1]}` : highlight,
        )
        .join(",");
      segmentAttrs += `{${highlights}}`;
    }
    segmentAttrs = segmentAttrs.trim().replace(/\s+/g, " ");

    switch (type) {
      case "app":
        if (segment.display) {
          markdownContent += "```xmlui " + segmentAttrs + "\n" + segment.content + "```\n\n";
        }
        pgContent.app = segment.content;
        break;
      case "config":
        if (segment.display) {
          markdownContent += "```json " + segmentAttrs + "\n" + segment.content + "```\n\n";
        }
        pgContent.config = segment.content;
        break;
      case "api":
        // --- Never display API segments
        pgContent.api = segment.content;
        break;
      case "comp":
        if (segment.display) {
          markdownContent += "```xmlui " + segmentAttrs + "\n" + segment.content + "```\n\n";
        }
        pgContent.components ??= [];
        pgContent.components.push(segment.content);
        break;
      case "desc":
        markdownContent += segment.content + "\n";
        break;
    }
  }

  // --- Convert the JSON representation of pgContent to a base64 string
  const jsonString = JSON.stringify(pgContent);
  const base64String = btoa(jsonString);
  markdownContent += '<samp data-pg-content="' + base64String + '"></samp>\n\n';

  return markdownContent;
}
