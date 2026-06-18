import type { XmluiDocument, XmluiElement, XmluiNode } from "./ir";

type RawElement = XmluiElement & {
  parent?: RawElement;
};

type ParseFrame = {
  element: RawElement;
};

const NAME_RE = /^[A-Za-z_$][\w$.-]*/;

export function parseXmlui(source: string): XmluiDocument {
  const root = parseXml(source);

  if (root.type === "Component") {
    const name = root.props.name;
    if (!name) {
      throw new Error("<Component> requires a name attribute.");
    }
    const componentRoot = stripInternalRoot(root, name);
    return {
      kind: "component",
      name,
      root: componentRoot,
    };
  }

  if (root.type !== "App") {
    throw new Error(`Expected <App> or <Component> as the document root, got <${root.type}>.`);
  }

  return {
    kind: "app",
    root,
  };
}

function parseXml(source: string): XmluiElement {
  const stack: ParseFrame[] = [];
  let root: RawElement | undefined;
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("<!--", index)) {
      const end = source.indexOf("-->", index + 4);
      if (end < 0) {
        throw new Error("Unterminated XML comment.");
      }
      index = end + 3;
      continue;
    }

    if (source[index] === "<") {
      if (source[index + 1] === "/") {
        const closeEnd = source.indexOf(">", index + 2);
        if (closeEnd < 0) {
          throw new Error("Unterminated closing tag.");
        }
        const closeName = source.slice(index + 2, closeEnd).trim();
        const frame = stack.pop();
        if (!frame) {
          throw new Error(`Unexpected closing tag </${closeName}>.`);
        }
        if (frame.element.type !== closeName) {
          throw new Error(`Expected </${frame.element.type}>, got </${closeName}>.`);
        }
        frame.element.range.end = closeEnd + 1;
        index = closeEnd + 1;
        continue;
      }

      const openEnd = findTagEnd(source, index + 1);
      const rawTag = source.slice(index + 1, openEnd);
      const selfClosing = rawTag.trimEnd().endsWith("/");
      const element = parseOpenTag(rawTag, index, openEnd + 1, selfClosing);

      const parent = stack.at(-1)?.element;
      if (parent) {
        parent.children.push(element);
        element.parent = parent;
      } else if (!root) {
        root = element;
      } else {
        throw new Error("XMLUI documents must have a single root element.");
      }

      if (!selfClosing) {
        stack.push({ element });
      }
      index = openEnd + 1;
      continue;
    }

    const nextTag = source.indexOf("<", index);
    const end = nextTag < 0 ? source.length : nextTag;
    const rawText = source.slice(index, end);
    const text = normalizeText(rawText);
    if (text) {
      const parent = stack.at(-1)?.element;
      if (!parent) {
        throw new Error("Text is not allowed outside the root element.");
      }
      parent.children.push({
        kind: "text",
        value: text,
        range: { start: index, end },
      });
    }
    index = end;
  }

  if (stack.length > 0) {
    throw new Error(`Unclosed tag <${stack.at(-1)!.element.type}>.`);
  }

  if (!root) {
    throw new Error("XMLUI document is empty.");
  }

  return detach(root);
}

function parseOpenTag(
  rawTag: string,
  start: number,
  end: number,
  selfClosing: boolean,
): RawElement {
  const tag = selfClosing ? rawTag.trimEnd().slice(0, -1).trimEnd() : rawTag;
  const nameMatch = tag.match(NAME_RE);
  if (!nameMatch) {
    throw new Error(`Invalid tag near offset ${start}.`);
  }

  const type = nameMatch[0];
  const attrSource = tag.slice(type.length);
  const props: Record<string, string> = {};
  const vars: Record<string, string> = {};
  const globals: Record<string, string> = {};
  const events: Record<string, string> = {};

  for (const attr of parseAttributes(attrSource)) {
    if (attr.name.startsWith("var.")) {
      vars[attr.name.slice(4)] = attr.value;
      continue;
    }
    if (attr.name.startsWith("global.")) {
      globals[attr.name.slice(7)] = attr.value;
      continue;
    }
    if (/^on[A-Z]/.test(attr.name)) {
      const eventName = attr.name.slice(2, 3).toLowerCase() + attr.name.slice(3);
      events[eventName] = attr.value;
      continue;
    }
    props[attr.name] = attr.value;
  }

  return {
    kind: "element",
    type,
    props,
    vars,
    globals,
    events,
    children: [],
    range: { start, end },
  };
}

function parseAttributes(source: string): Array<{ name: string; value: string }> {
  const attrs: Array<{ name: string; value: string }> = [];
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index] ?? "")) {
      index++;
    }
    if (index >= source.length) {
      break;
    }

    const nameMatch = source.slice(index).match(NAME_RE);
    if (!nameMatch) {
      throw new Error(`Invalid attribute near "${source.slice(index).trim()}".`);
    }

    const name = nameMatch[0];
    index += name.length;
    while (/\s/.test(source[index] ?? "")) {
      index++;
    }

    let value = "";
    if (source[index] === "=") {
      index++;
      while (/\s/.test(source[index] ?? "")) {
        index++;
      }
      const quote = source[index];
      if (quote !== `"` && quote !== `'`) {
        throw new Error(`Attribute "${name}" must use quoted values.`);
      }
      index++;
      const valueStart = index;
      const valueEnd = source.indexOf(quote, valueStart);
      if (valueEnd < 0) {
        throw new Error(`Unterminated value for attribute "${name}".`);
      }
      value = decodeEntities(source.slice(valueStart, valueEnd));
      index = valueEnd + 1;
    }
    attrs.push({ name, value });
  }

  return attrs;
}

function stripInternalRoot(component: XmluiElement, name: string): XmluiElement {
  const { props: _props, ...rest } = component;
  return detach({
    ...rest,
    type: name,
    props: {},
  });
}

function findTagEnd(source: string, index: number): number {
  let quote: string | undefined;
  for (let i = index; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) {
        quote = undefined;
      }
      continue;
    }
    if (ch === `"` || ch === `'`) {
      quote = ch;
      continue;
    }
    if (ch === ">") {
      return i;
    }
  }
  throw new Error("Unterminated opening tag.");
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, `"`)
    .replace(/&apos;/g, `'`)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function detach<T extends XmluiElement>(element: T): T {
  delete (element as RawElement).parent;
  for (const child of element.children) {
    if (child.kind === "element") {
      detach(child as RawElement);
    }
  }
  return element;
}
