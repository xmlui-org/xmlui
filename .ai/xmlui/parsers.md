# Parsers

## Overview

XMLUI has **four separate parsers**, each responsible for a distinct language:
1. **XML parser** — converts `.xmlui` markup to an AST, then to `ComponentDef`
2. **Scripting parser** — converts `{expressions}` and `<script>` blocks to evaluable ASTs
3. **Style parser** — converts CSS value strings (sizes, borders, colors) to structured nodes
4. **Keybinding parser** — converts accelerator strings (e.g., `"CmdOrCtrl+S"`) to key descriptors

All parsers run in **both Vite mode (build time)** and **standalone mode (browser runtime)**. In Vite mode, the XML and scripting parsers are invoked by `vite-xmlui-plugin` to produce compiled JS. In standalone mode, they run in-browser on the fly.

**Key directories:**
```
xmlui/src/parsers/
├── xmlui-parser/       ← XML parser
├── scripting/          ← Expression/module parser
├── style-parser/       ← CSS value parser
├── keybinding-parser/  ← Keyboard shortcut parser
└── common/             ← Shared stream/token infrastructure
```

---

## 1. XML Parser (`xmlui-parser/`)

**Entry point:** `parseXmlUiMarkup(text: string): ParseResult`  
**Full pipeline:** `parseXmlUiMarkup()` → transform (`nodeToComponentDef()`) → lint (`lintApp()`)

### Files

| File | Role |
|------|------|
| `parser.ts` | Main entry; `ParseStack` (recursive descent) |
| `scanner.ts` | Lexer; tokenizes XML into `SyntaxKind` tokens |
| `syntax-node.ts` | AST node classes: `Node`, `ElementNode`, `AttributeNode`, `ContentListNode` |
| `syntax-kind.ts` | Enum of 28 token/node types |
| `diagnostics.ts` | ~40 error/warning codes (`ParserDiag` type) |
| `transform.ts` | Post-parse: `nodeToComponentDef()` → `ComponentDef` / `CompoundComponentDef` |
| `lint.ts` | Checks unrecognized properties against component metadata |
| `utils.ts` | `findTokenAtOffset()` for language server; debug helpers |
| `xmlui-tree.ts` | Serialization types: `XmlUiElement`, `XmlUiAttribute`, `XmlUiComment` |
| `CharacterCodes.ts` | Character code constants for scanner state machine |

### Parse Pipeline

```
Source text
  ↓ Scanner (createScanner)
    Tokens: SyntaxKind enum values + positions
  ↓ ParseStack (recursive descent)
    parseFile() → root ContentListNode
    parseOpeningTag() → ElementNode
    parseAttrList() → AttributeListNode
    parseContentList() → nested elements + text
  ↓ Raw AST (Node tree)
    Each node has: kind, pos (excl. trivia), start (incl. trivia), end
    triviaBefore?: Node[]  ← comments, whitespace
  ↓ nodeToComponentDef() [transform.ts]
    Validates structure, resolves namespaces
    Extracts: property/, template/, event/, slot/
    Collects code-behind <script> blocks
    → ComponentDef | CompoundComponentDef
  ↓ lintApp() [lint.ts]
    Checks attribute names against component metadata
    Severity: Warning | Error | Strict | Skip
```

### SyntaxKind Tokens

**Open/close:** `OpenNodeStart` (`<`), `CloseNodeStart` (`</`), `NodeEnd` (`>`), `NodeClose` (`/>`)  
**Content:** `Identifier`, `StringLiteral`, `CData`, `Script`, `TextNode`  
**Attribute:** `AttributeNode`, `AttributeKeyNode`, `Equal`, `Colon`  
**Structure:** `ElementNode`, `ContentListNode`, `AttributeListNode`, `TagNameNode`  
**Errors:** `ErrorNode`  
**Trivia:** `CommentTrivia`, `NewLineTrivia`, `WhitespaceTrivia` (skipped by default)  
**XML entities:** `AmpersandEntity`, `LessThanEntity`, `GreaterThanEntity`, etc.

### Error Handling

- Parser is **error-recovering** — collects multiple errors, continues parsing
- `ParseResult = { node: Node; errors: ParserDiag[] }`
- `ParserDiag`: `{ code, message, pos, end, contextPos, contextEnd }`
- `contextPos`/`contextEnd` used by language server for highlighting

### Key Error Codes

| Code | Meaning |
|------|---------|
| U003 | Expected tag open |
| U007 | Tag name mismatch (open ≠ close) |
| U012 | Duplicate attribute |
| U013 | Uppercase attribute |
| U021 | Nested component definitions |
| U035 | File must have single root element |
| U037 | Duplicate xmlns declaration |
| U039 | Namespace not found |
| W001 | Invalid character |
| W007 | Unterminated comment |

### Expression Handling

Expressions `{...}` in attribute values are **not parsed at XML stage**. The scanner treats them as opaque string content. The scripting parser handles them separately when the value is first evaluated.

---

## 2. Scripting Parser (`scripting/`)

**Entry points:**
- `parser.parseExpr()` — parse a single `{expression}`
- `parser.parseStatements()` — parse a full `<script>` block
- `ModuleLoader.loadModule(path, options)` — load + parse an imported module with caching

### Files

| File | Role |
|------|------|
| `Lexer.ts` | Tokenizer; 16-token lookahead buffer; ~50 token types |
| `TokenType.ts` | Enum: operators, keywords, literals, assignment ops |
| `TokenTrait.ts` | Token metadata: precedence, associativity |
| `Parser.ts` | Recursive descent; `parseExpr()`, `parseStatements()` |
| `ScriptingNodeTypes.ts` | AST type constants: `T_IDENTIFIER`, `T_BINARY_EXPRESSION`, etc. |
| `types.ts` | `Result<T, E>`, `ResolvedModule`, `ModuleErrors`, `ParseResult` |
| `ParserError.ts` | ~20 error codes/messages |
| `modules.ts` | `parseScriptModule()` — high-level module parse |
| `ModuleLoader.ts` | Orchestrates: resolve → fetch → parse → circular check → cache |
| `ModuleResolver.ts` | Path resolution (relative → absolute) |
| `ModuleCache.ts` | Two-tier cache: raw content + parsed AST |
| `CircularDependencyDetector.ts` | Import stack tracking; cycle detection |
| `ModuleValidator.ts` | Post-parse: only function declarations allowed in imported modules |
| `PathResolver.ts` | Determine if path is URL, file path, or relative |
| `ScriptExtractor.ts` | Extracts `<script>...</script>` from XMLUI markup |
| `code-behind-collect.ts` | Collects function declarations from code-behind for API surface |
| `tree-visitor.ts` | AST visitor pattern for traversal/transformation |

### Expression Parse Pipeline

```
Expression string: "count + 1"
  ↓ Lexer.tokenize()
    16-token lookahead buffer
    Token stream: { type, value, pos }
  ↓ Parser.parseExpr()
    Recursive descent with precedence climbing
    → Expression AST node
```

### Module Parse Pipeline

```
Module source code
  ↓ Lexer.tokenize()
  ↓ Parser.parseStatements()
    Parses: var/let/const, function, if, while, for, return, throw
    → Statement[] AST
  ↓ ModuleValidator (if imported module)
    Only function declarations allowed
  ↓ Import resolution (if imports detected)
    PathResolver.resolve() → absolute path
    CircularDependencyDetector.checkCircular()
    Recursively load dependencies
    ModuleCache: two-tier (raw + parsed)
  ↓ ScriptModule
    functions: Record<string, FunctionDeclaration>
    variables: Record<string, VarDeclaration>
    imports: Record<string, ImportedModule>
    statements: Statement[]
```

### Key AST Node Types

```typescript
// Expressions
{ type: T_IDENTIFIER;            name: string }
{ type: T_BINARY_EXPRESSION;     left, operator, right }
{ type: T_UNARY_EXPRESSION;      operator, operand }
{ type: T_FUNCTION_INVOCATION_EXPRESSION; target, parameters: Expression[] }
{ type: T_MEMBER_ACCESS;         object, member }
{ type: T_CONDITIONAL_EXPRESSION; condition, then, else }

// Statements
{ type: T_VAR_STATEMENT;         declarations: VarDeclaration[] }
{ type: T_VAR_DECLARATION;       name, initializer?, isReactive? }
{ type: T_FUNCTION_DECLARATION;  name, params, body }
{ type: T_IF_STATEMENT;          condition, then, else? }
{ type: T_RETURN_STATEMENT;      value? }
{ type: T_THROW_STATEMENT;       value }
```

### Circular Dependency Detection

```typescript
// CircularDependencyDetector tracks the import stack
// A imports B imports A → returns ["A", "B", "A"]
// null → no cycle
checkCircular(modulePath: string): string[] | null
```

- Static stack; cleared between module loads
- Returns full cycle chain for error messages

### Error Pattern

- Uses `Result<T, E>` — no exceptions for module loading errors
- `ModuleErrors = Record<string, ParserErrorMessage[]>` — maps module path to errors
- Individual parse errors carry position info for IDE reporting

---

## 3. Style Parser (`style-parser/`)

**Entry points:** `StyleParser.parseSize()`, `.parseBorder()`, `.parseColor()`, `.parseBorderStyle()`

### Files

| File | Role |
|------|------|
| `StyleInputStream.ts` | Character stream with position tracking |
| `StyleLexer.ts` | Tokenizes CSS values: numbers, units, color names, hex, `rgb()`, theme IDs |
| `tokens.ts` | Token types: `Number`, `ColorName`, `ColorFunc`, `HexaColor`, `BorderStyle`, `ThemeId`, `Ws`, `Eof` |
| `StyleParser.ts` | Parse methods per CSS value type |
| `source-tree.ts` | AST nodes: `SizeNode`, `BorderNode`, `ColorNode`, `BorderStyleNode`, `ThemeIdDescriptor` |
| `errors.ts` | `StyleParserError`; error codes S001–S016 |

### What It Parses

| Input | Parser Method | Output |
|-------|--------------|--------|
| `12px`, `1rem`, `auto`, `100%` | `parseSize()` | `SizeNode { value, unit }` |
| `red`, `#FF0000`, `rgb(255,0,0)` | `parseColor()` | `ColorNode { ... }` |
| `2px solid #000` | `parseBorder()` | `BorderNode { widthValue, widthUnit, color, styleValue }` |
| `solid`, `dashed`, `dotted` | `parseBorderStyle()` | `BorderStyleNode` |
| `xmlui-primary`, `xmlui-spacing-sm` | Any | `ThemeIdDescriptor { id, defaultValue? }` |

### Theme Variable Integration

The lexer recognizes the `xmlui-` prefix as `ThemeId` tokens. `BorderNode` can carry up to 3 theme IDs (`themeId1`, `themeId2`, `themeId3`). These are resolved to CSS custom properties at runtime.

### Error Handling

- **Throws** `StyleParserError` immediately on invalid syntax (no recovery)
- Error codes S001–S016 map to specific validation failures

---

## 4. Keybinding Parser (`keybinding-parser/`)

**Entry point:** `parseKeyBinding(input: string): ParsedKeyBinding`

### Syntax

```
"CmdOrCtrl+A"       → Ctrl+A (Win/Linux) | Cmd+A (macOS)
"Shift+Delete"
"Alt+ArrowDown"
"Super+S"           → Command+S (macOS) | Windows key+S (Windows)
```

### Supported Modifiers

| Token | Meaning |
|-------|---------|
| `CmdOrCtrl` | Ctrl (Win/Linux), Cmd (macOS) |
| `Ctrl` | Control |
| `Alt` | Alt / Option |
| `Shift` | Shift |
| `Super` | Command (macOS) / Windows (Win) |
| `Cmd` | Command (macOS only) |

### Output

```typescript
interface ParsedKeyBinding {
  key: string;      // "a", "Delete", "ArrowUp", "F5"
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;    // Command / Super
  original: string; // Input string (for debugging)
}
```

Special keys: Arrow keys, Delete, Backspace, Enter, Escape, Tab, F1–F12, Home, End, PageUp, PageDown, Insert.

---

## 5. Common Infrastructure (`common/`)

| File | Role |
|------|------|
| `InputStream.ts` | Character stream: `peek()`, `consume()`, `position`, `line`, `column` |
| `GenericToken.ts` | `{ text, type, startPosition, endPosition, startLine, endLine, startColumn, endColumn }` |
| `utils.ts` | Shared string utilities |

Both `StyleInputStream.ts` and `Lexer.ts` (scripting) follow the same stream pattern.

---

## 6. Integration Map

### How Parsers Connect

```
.xmlui file
  ↓ [XML Parser] parseXmlUiMarkup()
    Produces: Node tree (generic, no semantics)
  ↓ [XML Transform] nodeToComponentDef()
    Produces: ComponentDef / CompoundComponentDef
    Extracts: attribute string values including "{expression}" verbatim
  ↓ [Scripting Parser] parseExpr() (lazy, at evaluation time)
    Produces: Expression AST → evaluable function
  ↓ [Style Parser] parseSize() etc. (when theme variables are set)
    Produces: SizeNode, BorderNode → CSS values
  ↓ [Keybinding Parser] parseKeyBinding() (when Keyboard component used)
    Produces: ParsedKeyBinding → DOM event matching
```

### When Each Parser Runs

| Parser | Vite Mode | Standalone Mode |
|--------|-----------|-----------------|
| XML | Build time (via `vite-xmlui-plugin`) | Runtime (in-browser) |
| Scripting (expr) | Runtime (expressions stay lazy) | Runtime |
| Scripting (modules) | Build time for `<script src>` | Runtime |
| Style | Runtime | Runtime |
| Keybinding | Runtime | Runtime |

### Expression Laziness

Expressions in attributes are **not compiled at XML parse time**. They are:
1. Stored as raw strings in `ComponentDef.props`
2. Passed to the scripting parser the **first time they are evaluated**
3. Results cached to avoid re-parsing on subsequent renders

---

## 7. Anti-patterns

- **Do not call `parseXmlUiMarkup()` for expression parsing** — use `Parser.parseExpr()` directly
- **Do not parse style values with string split** — use `StyleParser` methods; they handle theme IDs
- **Do not import modules with side effects** — `ModuleValidator` rejects anything except function declarations in imported modules
- **Do not bypass `ModuleLoader` for module loading** — it handles circular detection and caching; calling the parser directly loses both

---

## Key Files

| File | Purpose |
|------|---------|
| `xmlui/src/parsers/xmlui-parser/parser.ts` | XML parser entry point |
| `xmlui/src/parsers/xmlui-parser/transform.ts` | XML → ComponentDef transform |
| `xmlui/src/parsers/xmlui-parser/diagnostics.ts` | Error code definitions |
| `xmlui/src/parsers/scripting/Parser.ts` | Expression/statement parser |
| `xmlui/src/parsers/scripting/ModuleLoader.ts` | Module load orchestrator |
| `xmlui/src/parsers/scripting/CircularDependencyDetector.ts` | Cycle detection |
| `xmlui/src/parsers/style-parser/StyleParser.ts` | CSS value parser |
| `xmlui/src/parsers/keybinding-parser/keybinding-parser.ts` | Keyboard shortcut parser |
| `xmlui/src/parsers/common/InputStream.ts` | Shared character stream |
