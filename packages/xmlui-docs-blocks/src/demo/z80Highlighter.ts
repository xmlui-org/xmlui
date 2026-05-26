import type { CustomSyntaxLanguage, CustomSyntaxToken } from "../customHighlighter";

const instructions = new Set([
  "adc",
  "add",
  "and",
  "bit",
  "call",
  "ccf",
  "cp",
  "cpd",
  "cpdr",
  "cpi",
  "cpir",
  "cpl",
  "daa",
  "dec",
  "di",
  "djnz",
  "ei",
  "ex",
  "exx",
  "halt",
  "im",
  "in",
  "inc",
  "ind",
  "indr",
  "ini",
  "inir",
  "jp",
  "jr",
  "ld",
  "ldd",
  "lddr",
  "ldi",
  "ldir",
  "neg",
  "nop",
  "or",
  "otdr",
  "otir",
  "out",
  "outd",
  "outi",
  "pop",
  "push",
  "res",
  "ret",
  "reti",
  "retn",
  "rl",
  "rla",
  "rlc",
  "rlca",
  "rld",
  "rr",
  "rra",
  "rrc",
  "rrca",
  "rrd",
  "rst",
  "sbc",
  "scf",
  "set",
  "sla",
  "sra",
  "srl",
  "sub",
  "xor",
]);

const directives = new Set(["org", "db", "dw", "ds", "equ", "end", "include"]);
const registers = new Set([
  "a",
  "b",
  "c",
  "d",
  "e",
  "h",
  "l",
  "af",
  "bc",
  "de",
  "hl",
  "ix",
  "iy",
  "sp",
  "pc",
  "i",
  "r",
]);
const conditions = new Set(["nz", "z", "nc", "c", "po", "pe", "p", "m"]);
const numberPattern = /\$[0-9a-f]+|%[01]+|0x[0-9a-f]+|[0-9][0-9a-f]*h?\b/iy;
const identifierPattern = /[._a-z][._a-z0-9]*/iy;

export const z80AssemblyLanguage: CustomSyntaxLanguage = {
  id: "z80",
  aliases: ["z80asm", "z80-asm"],
  tokenize,
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
  },
  backgroundColor: {
    light: "#ffffff",
    dark: "#111827",
  },
  theme: {
    light: {
      comment: { color: "#6a737d", fontStyle: "italic" },
      "label.definition": { color: "#795da3", fontWeight: 700 },
      "label.reference": { color: "#795da3" },
      instruction: { color: "#005cc5", fontWeight: 700 },
      directive: { color: "#d73a49" },
      register: { color: "#e36209" },
      condition: { color: "#22863a", fontWeight: 600 },
      number: { color: "#b31d28" },
      string: { color: "#032f62" },
    },
    dark: {
      comment: { color: "#8b949e", fontStyle: "italic" },
      "label.definition": { color: "#d2a8ff", fontWeight: 700 },
      "label.reference": { color: "#d2a8ff" },
      instruction: { color: "#79c0ff", fontWeight: 700 },
      directive: { color: "#ff7b72" },
      register: { color: "#ffa657" },
      condition: { color: "#7ee787", fontWeight: 600 },
      number: { color: "#ff7b72" },
      string: { color: "#a5d6ff" },
    },
  },
};

function tokenize(code: string): CustomSyntaxToken[] {
  const tokens: CustomSyntaxToken[] = [];
  let offset = 0;

  code.split("\n").forEach((line) => {
    tokenizeLine(line, offset, tokens);
    offset += line.length + 1;
  });

  return tokens;
}

function tokenizeLine(line: string, lineOffset: number, tokens: CustomSyntaxToken[]) {
  const commentStart = line.indexOf(";");
  const codeEnd = commentStart === -1 ? line.length : commentStart;
  const source = line.slice(0, codeEnd);
  const labelMatch = source.match(/^\s*([._a-z][._a-z0-9]*):/i);

  if (labelMatch?.index !== undefined) {
    const start = line.indexOf(labelMatch[1]);
    tokens.push({
      start: lineOffset + start,
      end: lineOffset + start + labelMatch[1].length,
      type: "label.definition",
    });
  }

  let index = 0;
  while (index < source.length) {
    const char = source[index];

    if (char === '"' || char === "'") {
      const end = findStringEnd(source, index, char);
      tokens.push({ start: lineOffset + index, end: lineOffset + end, type: "string" });
      index = end;
      continue;
    }

    numberPattern.lastIndex = index;
    const numberMatch = numberPattern.exec(source);
    if (numberMatch?.index === index) {
      tokens.push({
        start: lineOffset + index,
        end: lineOffset + index + numberMatch[0].length,
        type: "number",
      });
      index += numberMatch[0].length;
      continue;
    }

    identifierPattern.lastIndex = index;
    const identifierMatch = identifierPattern.exec(source);
    if (identifierMatch?.index === index) {
      const word = identifierMatch[0];
      const lowerWord = word.toLowerCase();
      const tokenType = getIdentifierType(lowerWord);
      if (!isLabelDefinition(source, index, word.length)) {
        tokens.push({
          start: lineOffset + index,
          end: lineOffset + index + word.length,
          type: tokenType,
        });
      }
      index += word.length;
      continue;
    }

    index++;
  }

  if (commentStart !== -1) {
    tokens.push({
      start: lineOffset + commentStart,
      end: lineOffset + line.length,
      type: "comment",
    });
  }
}

function getIdentifierType(word: string) {
  if (instructions.has(word)) return "instruction";
  if (directives.has(word)) return "directive";
  if (registers.has(word)) return "register";
  if (conditions.has(word)) return "condition";
  return "identifier";
}

function isLabelDefinition(source: string, index: number, length: number) {
  return source[index + length] === ":";
}

function findStringEnd(source: string, start: number, quote: string) {
  for (let index = start + 1; index < source.length; index++) {
    if (source[index] === quote) {
      return index + 1;
    }
  }
  return source.length;
}
