# Custom Syntax Highlighters [#custom-syntax-highlighters]

Add a custom language highlighter when Shiki does not have the grammar you need, or when a small tokenizer is easier to maintain than a TextMate grammar.

The `xmlui-docs-blocks` highlighter supports both Shiki languages and package-defined custom languages. A custom language provides tokens, optional semantic tokens, and separate token styles for light and dark theme tones.

## 1. Define a language

Create a `CustomSyntaxLanguage` object. The tokenizer returns character offsets into the original code string.

```ts
import type { CustomSyntaxLanguage, CustomSyntaxToken } from "xmlui-docs-blocks";

const instructions = new Set(["ld", "jp", "ret"]);

export const demoAssemblyLanguage: CustomSyntaxLanguage = {
  id: "demoasm",
  aliases: ["demo-asm"],
  tokenize(code: string): CustomSyntaxToken[] {
    const tokens: CustomSyntaxToken[] = [];
    const wordPattern = /[a-z]+/gi;

    for (const match of code.matchAll(wordPattern)) {
      const word = match[0].toLowerCase();
      if (!instructions.has(word) || match.index === undefined) {
        continue;
      }

      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "instruction",
      });
    }

    return tokens;
  },
  theme: {
    light: {
      instruction: { color: "#005cc5", fontWeight: 700 },
    },
    dark: {
      instruction: { color: "#79c0ff", fontWeight: 700 },
    },
  },
};
```

## 2. Add semantic highlighting when needed

Use `semanticHighlight` when the token type depends on more than local text. For example, the built-in Z80 demo marks identifiers that match a label definition as `label.reference`.

```ts
semanticHighlight({ code, tokens }) {
  const labels = new Set(
    tokens
      .filter((token) => token.type === "label.definition")
      .map((token) => code.slice(token.start, token.end).toLowerCase()),
  );

  return tokens
    .filter((token) => token.type === "identifier")
    .filter((token) => labels.has(code.slice(token.start, token.end).toLowerCase()))
    .map((token) => ({ ...token, type: "label.reference" }));
}
```

Semantic tokens are layered after tokenizer tokens. If ranges overlap, the later semantic token wins for that range.

## 3. Register the language

Add the language to the custom registry in `src/highlighter.ts`.

```ts
import { createCustomLanguageRegistry } from "./customHighlighter";
import { demoAssemblyLanguage } from "./demo/demoAssemblyHighlighter";

export const customLanguageRegistry = createCustomLanguageRegistry([
  demoAssemblyLanguage,
]);
```

`docsCodeHighlighter.availableLangs` combines Shiki languages with custom language IDs and aliases, so Markdown code fences can use either form:

<pre>
```demoasm
ld a, 1
ret
```
</pre>

## Token styles

Each token style can set `color`, `backgroundColor`, `fontStyle`, `fontWeight`, and `textDecoration`.

```ts
theme: {
  light: {
    comment: { color: "#6a737d", fontStyle: "italic" },
    register: { color: "#e36209" },
  },
  dark: {
    comment: { color: "#8b949e", fontStyle: "italic" },
    register: { color: "#ffa657" },
  },
}
```

You can also set a tone-specific code block background:

```ts
backgroundColor: {
  light: "#ffffff",
  dark: "#111827",
}
```

## Key points

**Offsets are character offsets**: `start` and `end` are zero-based offsets in the full code string, not line and column positions.

**Use stable token names**: Token names are local to your language, but keep them semantic: `instruction`, `register`, `number`, `comment`, `label.definition`, `label.reference`.

**Always provide both tones**: Define styles for `light` and `dark`. The active XMLUI theme tone selects the map at render time.

**Escape work is handled for you**: Tokenizers return positions only. The renderer escapes source text and emits the `<pre><code>` structure expected by XMLUI code blocks.

**Markdown metadata still works**: Line highlights and substring highlights are passed into custom highlighters as decorations, the same way they are passed to Shiki.

## See also

- [Code fences and playgrounds](/docs/playground-and-codefence) — markdown code block metadata
- [App globals](/docs/app-globals#codehighlighter) — how XMLUI receives a `codeHighlighter`
