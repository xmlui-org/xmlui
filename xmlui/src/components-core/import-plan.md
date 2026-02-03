# Implementation Plan: JavaScript Import Syntax for Helper Modules

## Executive Summary

This document outlines the complete implementation plan for adding JavaScript `import` syntax support to XMLUI's scripting engine. The feature will allow developers to organize helper functions into separate `.xs` module files and import them into `<script>` tags and `.xmlui.xs` code-behind files.

## Current Architecture Analysis

### File Types and Extensions
1. **`.xmlui`** - Component markup files
2. **`.xmlui.xs`** - Code-behind files for components (paired with `.xmlui` files)
3. **`.xs`** - Helper module files (currently exists but not fully utilized)

### Current Scripting Flow

#### In Built Mode (Vite):
```
.xs file → vite-xmlui-plugin → Parser.parseStatements() → 
collectCodeBehindFromSource() → ESM export
```

#### In Buildless Mode (Runtime):
```
.xmlui.xs file → fetch → parseCodeBehindResponse() → 
Parser.parseStatements() → collectCodeBehindFromSource() → 
Merge with component definition
```

### Current Limitations
- **No import support**: Functions cannot be shared across files
- **Code duplication**: Same helper functions must be copy-pasted
- **No dependency resolution**: Each file is parsed in isolation
- **Module system exists but unused**: The `parseScriptModule()` function and `ScriptModule` type exist but aren't integrated with imports

## Proposed Solution

### 1. Syntax Design

Allow ES6-style import statements with restrictions:

```javascript
// In helpers.xs
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
```

```javascript
// In InvoiceList.xmlui.xs or <script> tag
import { calculateTotal, formatCurrency } from './helpers.xs';

var invoices = [
  { id: 1, total: calculateTotal(items) }
];
```

**Restrictions:**
- Only named imports allowed (no default exports)
- Only function imports supported initially
- Import paths must be relative (start with `./` or `../`)
- Imports must be at the top of the file (before any other statements)
- Only `.xs` files can be imported

### 2. Implementation Steps

#### Phase 1: Lexer & Parser Extensions

**A. Add Import Token to TokenType** (`TokenType.ts`)
```typescript
export enum TokenType {
  // ... existing tokens
  Import,      // "import" keyword
  From,        // "from" keyword  
  Export,      // "export" keyword (for future)
}
```

**B. Add Import Statement AST Node** (`ScriptingNodeTypes.ts`)
```typescript
export const T_IMPORT_DECLARATION = 22;
```

**C. Define Import Statement Interface** (`ScriptingSourceTree.ts`)
```typescript
export interface ImportDeclaration extends ScripNodeBase {
  type: IMPORT_DECLARATION;
  specifiers: ImportSpecifier[];  // { calculateTotal, formatCurrency }
  source: string;                  // './helpers.xs'
}

export interface ImportSpecifier {
  imported: string;    // Original name in module
  local?: string;      // Local alias (for 'as' syntax)
}

export type Statement =
  | ImportDeclaration  // ADD THIS
  | BlockStatement
  | EmptyStatement
  // ... rest
```

**D. Update Lexer** (`Lexer.ts`)
- Add `"import"` and `"from"` to keyword recognition
- Ensure they're tokenized as `TokenType.Import` and `TokenType.From`

**E. Add Parser Method** (`Parser.ts`)
```typescript
/**
 * Parses an import statement
 *
 * importStatement
 *   : "import" "{" identifier ("," identifier)* "}" "from" stringLiteral
 *   ;
 */
private parseImportStatement(): ImportDeclaration | null {
  const startToken = this._lexer.get(); // consume 'import'
  
  // Expect opening brace
  if (this._lexer.peek().type !== TokenType.LBrace) {
    this.reportError("W032"); // Expected '{'
    return null;
  }
  this._lexer.get();
  
  // Parse import specifiers
  const specifiers: ImportSpecifier[] = [];
  while (true) {
    const idToken = this._lexer.peek();
    if (idToken.type !== TokenType.Identifier) {
      this.reportError("W033"); // Expected identifier
      return null;
    }
    this._lexer.get();
    
    const specifier: ImportSpecifier = {
      imported: idToken.text
    };
    
    // Check for 'as' alias
    const nextToken = this._lexer.peek();
    if (nextToken.type === TokenType.As) {
      this._lexer.get();
      const aliasToken = this._lexer.get();
      if (aliasToken.type !== TokenType.Identifier) {
        this.reportError("W034"); // Expected identifier after 'as'
        return null;
      }
      specifier.local = aliasToken.text;
    }
    
    specifiers.push(specifier);
    
    // Check for comma or closing brace
    const delimToken = this._lexer.peek();
    if (delimToken.type === TokenType.RBrace) {
      this._lexer.get();
      break;
    }
    if (delimToken.type !== TokenType.Comma) {
      this.reportError("W035"); // Expected ',' or '}'
      return null;
    }
    this._lexer.get();
  }
  
  // Expect 'from'
  const fromToken = this._lexer.peek();
  if (fromToken.type !== TokenType.From) {
    this.reportError("W036"); // Expected 'from'
    return null;
  }
  this._lexer.get();
  
  // Parse module path
  const pathToken = this._lexer.get();
  if (pathToken.type !== TokenType.StringLiteral) {
    this.reportError("W037"); // Expected string literal
    return null;
  }
  
  const source = this.parseStringLiteral(pathToken, true).value;
  
  return this.createStatementNode<ImportDeclaration>(
    T_IMPORT_DECLARATION,
    { specifiers, source },
    startToken,
    pathToken
  );
}
```

**F. Update parseStatement()** (`Parser.ts`)
```typescript
private parseStatement(allowSequence = true): Statement | null {
  const startToken = this._lexer.peek();
  switch (startToken.type) {
    case TokenType.Import:
      return this.parseImportStatement();
    case TokenType.Semicolon:
      // ... existing cases
  }
}
```

#### Phase 2: Module Resolution System

**A. Create Module Resolver** (`xmlui/src/parsers/scripting/ModuleResolver.ts`)
```typescript
export type ModuleResolverFn = (modulePath: string, fromFile: string) => Promise<string>;

export class ModuleResolver {
  private cache = new Map<string, string>();
  private fetchFn: (url: string) => Promise<Response>;
  
  constructor(fetchFn?: (url: string) => Promise<Response>) {
    this.fetchFn = fetchFn || fetch;
  }
  
  async resolveModule(importPath: string, fromFile: string): Promise<string> {
    // Convert relative path to absolute
    const resolvedPath = this.resolvePath(importPath, fromFile);
    
    // Check cache
    if (this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath)!;
    }
    
    // Fetch module source
    const response = await this.fetchFn(resolvedPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch module: ${resolvedPath}`);
    }
    
    const source = await response.text();
    this.cache.set(resolvedPath, source);
    return source;
  }
  
  private resolvePath(importPath: string, fromFile: string): string {
    // Handle relative paths
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const baseUrl = new URL(fromFile, 'http://dummy.com');
      const resolvedUrl = new URL(importPath, baseUrl);
      return resolvedUrl.pathname.substring(1);
    }
    return importPath;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}
```

**B. Update Module Parser** (`modules.ts`)
```typescript
export function parseScriptModuleWithImports(
  moduleName: string, 
  source: string,
  resolver?: ModuleResolver
): ScriptModule | ModuleErrors {
  const parsedModules = new Map<string, ScriptModule>();
  const moduleErrors: ModuleErrors = {};
  
  async function doParseModule(moduleName: string, source: string): Promise<ScriptModule | null> {
    if (parsedModules.has(moduleName)) {
      return parsedModules.get(moduleName);
    }
    
    const parser = new Parser(source);
    let statements: Statement[] = [];
    
    try {
      statements = parser.parseStatements()!;
    } catch (error) {
      moduleErrors[moduleName] = parser.errors;
      return null;
    }
    
    // Process import statements
    const imports: ImportDeclaration[] = [];
    const otherStatements: Statement[] = [];
    
    for (const stmt of statements) {
      if (stmt.type === T_IMPORT_DECLARATION) {
        imports.push(stmt as ImportDeclaration);
      } else {
        otherStatements.push(stmt);
      }
    }
    
    // Resolve and parse imported modules
    const importedModules = new Map<string, ScriptModule>();
    
    if (resolver) {
      for (const importStmt of imports) {
        try {
          const importedSource = await resolver.resolveModule(importStmt.source, moduleName);
          const importedModule = await doParseModule(importStmt.source, importedSource);
          if (importedModule) {
            importedModules.set(importStmt.source, importedModule);
          }
        } catch (error) {
          addErrorMessage("W038", importStmt, importStmt.source);
        }
      }
    }
    
    // Collect functions
    const functions: Record<string, FunctionDeclaration> = {};
    
    // Add imported functions
    for (const importStmt of imports) {
      const importedModule = importedModules.get(importStmt.source);
      if (importedModule) {
        for (const specifier of importStmt.specifiers) {
          const importedFunc = importedModule.functions[specifier.imported];
          if (!importedFunc) {
            addErrorMessage("W039", importStmt, specifier.imported, importStmt.source);
            continue;
          }
          const localName = specifier.local || specifier.imported;
          functions[localName] = importedFunc;
        }
      }
    }
    
    // Add local functions
    otherStatements
      .filter(stmt => stmt.type === T_FUNCTION_DECLARATION)
      .forEach(stmt => {
        const func = stmt as FunctionDeclaration;
        if (functions[func.id.name]) {
          addErrorMessage("W020", stmt, func.id.name);
          return;
        }
        functions[func.id.name] = func;
      });
    
    const parsedModule: ScriptModule = {
      type: "ScriptModule",
      name: moduleName,
      functions,
      statements: otherStatements,
      sources: new Map(),
      imports: importedModules,  // Add this field
    };
    
    parsedModules.set(moduleName, parsedModule);
    return parsedModule;
  }
  
  return doParseModule(moduleName, source);
}
```

#### Phase 3: Integration Points

**A. Update StandaloneApp.tsx** (Buildless Mode)

In `useStandalone()` hook, update code-behind loading:

```typescript
// When loading code-behind files
const loadedEntryPointCodeBehind = null;
if (loadedEntryPoint.component.props?.codeBehind !== undefined) {
  try {
    const response = await fetchWithoutCache(MAIN_CODE_BEHIND_FILE);
    const codeBehindText = await response.text();
    
    // Create module resolver for buildless mode
    const resolver = new ModuleResolver((url) => fetchWithoutCache(url));
    
    // Use new import-aware parser
    const parsedModule = await parseScriptModuleWithImports(
      'Main',
      codeBehindText,
      resolver
    );
    
    if (!isModuleErrors(parsedModule)) {
      loadedEntryPointCodeBehind = {
        vars: {},
        functions: parsedModule.functions,
        moduleErrors: {}
      };
    } else {
      loadedEntryPointCodeBehind = {
        vars: {},
        functions: {},
        moduleErrors: parsedModule
      };
    }
  } catch (e) {
    console.error("Error loading code behind", e);
  }
}
```

**B. Update vite-xmlui-plugin.ts** (Built Mode)

```typescript
async transform(code: string, id: string, options) {
  const hasXmluiScriptExtension = xmluiScriptExtension.test(id);
  const hasModuleScriptExtension = moduleScriptExtension.test(id);
  
  if (hasXmluiScriptExtension || hasModuleScriptExtension) {
    // Create a resolver that uses Vite's module system
    const resolver = new ModuleResolver(async (importPath) => {
      const resolved = path.resolve(path.dirname(id), importPath);
      const imported = await this.load({ id: resolved });
      return new Response(imported.code);
    });
    
    const moduleName = hasXmluiScriptExtension
      ? id.substring(0, id.length - (codeBehindFileExtension.length + 1))
      : id.substring(0, id.length - (moduleFileExtension.length + 1));
    
    // Use import-aware parser
    const parsedModule = await parseScriptModuleWithImports(
      moduleNameResolver(moduleName),
      code,
      resolver
    );
    
    let codeBehind: CollectedDeclarations;
    
    if (!isModuleErrors(parsedModule)) {
      codeBehind = {
        vars: {},
        functions: Object.fromEntries(
          Object.entries(parsedModule.functions).map(([name, func]) => [
            name,
            {
              [PARSED_MARK_PROP]: true,
              tree: funcToArrowExpr(func)
            }
          ])
        ),
        moduleErrors: {}
      };
    } else {
      codeBehind = {
        vars: {},
        functions: {},
        moduleErrors: parsedModule
      };
    }
    
    removeCodeBehindTokensFromTree(codeBehind);
    
    return {
      code: dataToEsm({ ...codeBehind, src: code }),
      map: { mappings: "" },
    };
  }
}
```

**C. Update collectCodeBehindFromSource** (`code-behind-collect.ts`)

```typescript
export async function collectCodeBehindFromSource(
  moduleName: string,
  source: string,
  resolver?: ModuleResolver
): Promise<CollectedDeclarations> {
  const result: CollectedDeclarations = {
    vars: {},
    moduleErrors: {},
    functions: {},
    hasInvalidStatements: false,
  };
  
  // Parse module with imports
  const parsedModule = await parseScriptModuleWithImports(
    moduleName,
    source,
    resolver
  );
  
  if (isModuleErrors(parsedModule)) {
    return { ...result, moduleErrors: parsedModule };
  }
  
  // Collect functions (including imported ones)
  Object.entries(parsedModule.functions).forEach(([name, func]) => {
    result.functions[name] = {
      [PARSED_MARK_PROP]: true,
      tree: funcToArrowExpr(func)
    };
  });
  
  // Collect var statements
  parsedModule.statements.forEach(stmt => {
    if (stmt.type === T_VAR_STATEMENT) {
      stmt.decls.forEach(decl => {
        result.vars[decl.id.name] = {
          [PARSED_MARK_PROP]: true,
          tree: decl.expr
        };
      });
    } else if (stmt.type !== T_FUNCTION_DECLARATION) {
      result.hasInvalidStatements = true;
    }
  });
  
  return result;
}

function funcToArrowExpr(func: FunctionDeclaration): ArrowExpression {
  return {
    type: T_ARROW_EXPRESSION,
    args: func.args.slice(),
    statement: func.stmt,
    nodeId: func.nodeId
  } as ArrowExpression;
}
```

#### Phase 4: Error Handling

**A. Add New Error Codes** (`ParserError.ts`)
```typescript
export const errorMessages: Record<ErrorCodes, string> = {
  // ... existing errors
  W032: "Expected '{' after 'import'",
  W033: "Expected identifier in import specifier",
  W034: "Expected identifier after 'as'",
  W035: "Expected ',' or '}' in import specifiers",
  W036: "Expected 'from' keyword",
  W037: "Expected string literal for module path",
  W038: "Failed to load module: {0}",
  W039: "Imported function '{0}' not found in module '{1}'",
  W040: "Import statements must appear at the top of the file",
  W041: "Cannot import from non-.xs file: {0}",
  W042: "Circular import detected: {0}",
};
```

**B. Validate Import Order**
```typescript
// In parseStatements()
parseStatements(): Statement[] | null {
  this._statementLevel = 0;
  const statements: Statement[] = [];
  let seenNonImport = false;
  
  while (!this.isEof) {
    const statement = this.parseStatement();
    if (!statement) return null;
    
    // Validate import ordering
    if (statement.type === T_IMPORT_DECLARATION) {
      if (seenNonImport) {
        this.reportError("W040");
        return null;
      }
    } else {
      seenNonImport = true;
    }
    
    statements.push(statement);
    if (statement.type !== T_EMPTY_STATEMENT) {
      this.skipToken(TokenType.Semicolon);
    }
  }
  return statements;
}
```

**C. Detect Circular Imports**
```typescript
// In parseScriptModuleWithImports
const importStack: string[] = [];

async function doParseModule(moduleName: string, source: string): Promise<ScriptModule | null> {
  // Check for circular imports
  if (importStack.includes(moduleName)) {
    const cycle = [...importStack, moduleName].join(' -> ');
    addErrorMessage("W042", null, cycle);
    return null;
  }
  
  importStack.push(moduleName);
  try {
    // ... parsing logic
  } finally {
    importStack.pop();
  }
}
```

### 3. Testing Strategy

#### Unit Tests

**A. Parser Tests** (`xmlui/tests/parsers/scripting/import-parse.test.ts`)
```typescript
describe('Import Statement Parsing', () => {
  test('parses simple import', () => {
    const source = "import { foo } from './helpers.xs';";
    const parser = new Parser(source);
    const statements = parser.parseStatements();
    
    expect(statements).toHaveLength(1);
    expect(statements[0].type).toBe(T_IMPORT_DECLARATION);
    expect((statements[0] as ImportDeclaration).specifiers).toHaveLength(1);
  });
  
  test('parses multiple imports', () => {
    const source = "import { foo, bar, baz } from './helpers.xs';";
    // ...
  });
  
  test('parses import with alias', () => {
    const source = "import { foo as myFoo } from './helpers.xs';";
    // ...
  });
  
  test('rejects import after other statements', () => {
    const source = `
      var x = 1;
      import { foo } from './helpers.xs';
    `;
    // Should error
  });
});
```

**B. Module Resolution Tests** (`xmlui/tests/parsers/scripting/module-resolve.test.ts`)
```typescript
describe('Module Resolution', () => {
  test('resolves relative path', async () => {
    const resolver = new ModuleResolver();
    const result = resolver.resolvePath('./helpers.xs', '/components/Invoice.xmlui.xs');
    expect(result).toBe('/components/helpers.xs');
  });
  
  test('caches resolved modules', async () => {
    // ...
  });
});
```

**C. Integration Tests** (`xmlui/tests/integration/import-integration.test.ts`)
```typescript
describe('Import Integration', () => {
  test('imported functions are available in code-behind', async () => {
    // Create helpers.xs with calculateTotal
    // Create component with code-behind that imports calculateTotal
    // Verify function works
  });
  
  test('handles missing module gracefully', async () => {
    // Import non-existent module
    // Verify error reporting
  });
});
```

### 4. Documentation Updates

**A. Create Import Guide** (`docs/public/pages/howto/import-helpers.mdx`)
- Basic syntax examples
- Organizing helper functions
- Best practices
- Common errors and solutions

**B. Update Code-Behind Documentation** (`docs/content/pages/code-behind.mdx`)
- Add import syntax section
- Show examples of shared utilities
- Explain module resolution

**C. Add Examples** (`docs/src/examples/`)
- Simple import example
- Multi-level import example
- Shared utilities pattern

### 5. Migration Path

For existing users:
1. **No breaking changes** - Existing code without imports continues to work
2. **Gradual adoption** - Can add imports incrementally
3. **Clear documentation** - Migration guide for converting duplicated code to imports

### 6. Future Enhancements (Out of Scope)

- Default exports: `export default function helper() {}`
- Named exports: `export function helper() {}`
- Import entire module: `import * as helpers from './helpers.xs'`
- Import from npm packages
- Variable imports (currently only functions)
- Re-exports: `export { foo } from './other.xs'`

### 7. Test-Driven Implementation Flow

Each step follows this workflow:
1. **Implement** the feature/change
2. **Create** new unit tests for the implementation
3. **Run** the new unit tests to verify functionality
4. **Run** all existing parser and script execution tests to ensure no regressions
5. **Mark** the step as completed when all tests pass
6. **Request** approval before proceeding to the next step

### 8. Implementation Steps (Incremental & Testable)

#### Step 1: Add Import Token to Lexer
**Goal**: Recognize "import" and "from" keywords in the lexer

**Files to Modify**:
- `xmlui/src/parsers/scripting/TokenType.ts`
- `xmlui/src/parsers/scripting/Lexer.ts`
- `xmlui/src/parsers/scripting/TokenTrait.ts`

**Implementation**:
1. Add `Import` and `From` to `TokenType` enum
2. Add keyword recognition in lexer's keyword map
3. Ensure proper tokenization

**Tests to Create**:
- `xmlui/tests/parsers/scripting/lexer-import.test.ts`
  - Test "import" keyword is tokenized as `TokenType.Import`
  - Test "from" keyword is tokenized as `TokenType.From`
  - Test "import" as identifier (when not keyword context)
  - Test whitespace handling around import keyword

**Verification Commands**:
```bash
npm run test -- lexer-import.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- All new tests pass
- All existing lexer tests pass
- No regressions in parser tests

---

#### Step 2: Add Import AST Node Types
**Goal**: Define the data structures for import declarations

**Files to Modify**:
- `xmlui/src/parsers/scripting/ScriptingNodeTypes.ts`
- `xmlui/src/components-core/script-runner/ScriptingSourceTree.ts`

**Implementation**:
1. Add `T_IMPORT_DECLARATION = 22` constant
2. Define `ImportDeclaration` interface
3. Define `ImportSpecifier` interface
4. Add `ImportDeclaration` to `Statement` union type
5. Export type constant

**Tests to Create**:
- `xmlui/tests/parsers/scripting/ast-import.test.ts`
  - Test `T_IMPORT_DECLARATION` constant exists
  - Test `ImportDeclaration` type structure
  - Test `ImportSpecifier` type structure
  - Verify type exports

**Verification Commands**:
```bash
npm run test -- ast-import.test.ts
npm run test -- tests/parsers/scripting
npm run build  # Ensure TypeScript compiles
```

**Success Criteria**:
- TypeScript compiles without errors
- New AST types are properly exported
- All existing tests still pass

---

#### Step 3: Parse Simple Import Statement (Named Import Only)
**Goal**: Parse `import { foo } from './module.xs';`

**Files to Modify**:
- `xmlui/src/parsers/scripting/Parser.ts`
- `xmlui/src/parsers/scripting/ParserError.ts`

**Implementation**:
1. Add `parseImportStatement()` method
2. Handle single named import (no aliases yet)
3. Add error codes: W032-W037
4. Update `parseStatement()` to handle `TokenType.Import`

**Tests to Create**:
- `xmlui/tests/parsers/scripting/import-parse-basic.test.ts`
  - Parse `import { foo } from './helpers.xs';`
  - Parse `import { foo } from "../utils.xs";`
  - Verify specifier name is correct
  - Verify source path is correct
  - Test syntax errors (missing braces, missing from, etc.)
  - Test with semicolon and without

**Verification Commands**:
```bash
npm run test -- import-parse-basic.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Simple import statements parse correctly
- AST structure matches expected format
- Syntax errors are caught and reported
- All existing parser tests pass

---

#### Step 4: Parse Multiple Named Imports
**Goal**: Parse `import { foo, bar, baz } from './module.xs';`

**Files to Modify**:
- `xmlui/src/parsers/scripting/Parser.ts` (enhance `parseImportStatement()`)

**Implementation**:
1. Handle comma-separated import specifiers
2. Parse multiple identifiers in single import

**Tests to Create**:
- `xmlui/tests/parsers/scripting/import-parse-multiple.test.ts`
  - Parse 2 imports
  - Parse 5+ imports
  - Test trailing comma handling
  - Test errors (missing comma, unexpected token, etc.)
  - Verify all specifiers are captured

**Verification Commands**:
```bash
npm run test -- import-parse-multiple.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Multiple imports parse correctly
- All specifiers are in the AST
- Error handling works for malformed lists
- Existing tests pass

---

#### Step 5: Parse Import with Aliases
**Goal**: Parse `import { foo as myFoo, bar } from './module.xs';`

**Files to Modify**:
- `xmlui/src/parsers/scripting/Parser.ts` (enhance `parseImportStatement()`)
- `xmlui/src/parsers/scripting/ParserError.ts`

**Implementation**:
1. Handle `as` keyword in import specifiers
2. Parse local alias names
3. Add error code W034 for missing identifier after 'as'

**Tests to Create**:
- `xmlui/tests/parsers/scripting/import-parse-alias.test.ts`
  - Parse single import with alias
  - Parse multiple imports with mixed aliases
  - Parse all imports with aliases
  - Test error: missing identifier after 'as'
  - Verify both `imported` and `local` are captured

**Verification Commands**:
```bash
npm run test -- import-parse-alias.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Aliases parse correctly
- Both original and local names in AST
- Error handling for malformed aliases
- All tests pass

---

#### Step 6: Validate Import Statement Position
**Goal**: Enforce imports must be at the top of the file

**Files to Modify**:
- `xmlui/src/parsers/scripting/Parser.ts` (enhance `parseStatements()`)
- `xmlui/src/parsers/scripting/ParserError.ts`

**Implementation**:
1. Track whether non-import statements have been seen
2. Error if import appears after other statements
3. Add error code W040

**Tests to Create**:
- `xmlui/tests/parsers/scripting/import-position.test.ts`
  - Valid: imports at top, then functions
  - Valid: imports at top, then vars
  - Valid: multiple imports at top
  - Invalid: import after function declaration
  - Invalid: import after var statement
  - Invalid: import in the middle

**Verification Commands**:
```bash
npm run test -- import-position.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Position validation works
- Clear error messages for misplaced imports
- All tests pass

---

#### Step 7: Create Module Resolver (Basic)
**Goal**: Resolve relative module paths

**Files to Create**:
- `xmlui/src/parsers/scripting/ModuleResolver.ts`

**Implementation**:
1. Create `ModuleResolver` class
2. Implement `resolvePath()` for relative paths
3. Basic path normalization
4. No fetching yet (just path resolution)

**Tests to Create**:
- `xmlui/tests/parsers/scripting/module-resolver.test.ts`
  - Resolve `./helpers.xs` from `/components/Invoice.xmlui.xs`
  - Resolve `../utils.xs` from `/components/sub/Item.xmlui.xs`
  - Resolve nested relative paths
  - Handle edge cases (multiple ../, ./, etc.)
  - Test path normalization

**Verification Commands**:
```bash
npm run test -- module-resolver.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Path resolution logic works correctly
- Edge cases handled
- All tests pass

---

#### Step 8: Add Module Fetching to Resolver
**Goal**: Fetch and cache module source code

**Files to Modify**:
- `xmlui/src/parsers/scripting/ModuleResolver.ts`

**Implementation**:
1. Add `resolveModule()` method
2. Implement caching mechanism
3. Handle fetch errors
4. Support custom fetch function (for testing)

**Tests to Create**:
- `xmlui/tests/parsers/scripting/module-fetch.test.ts`
  - Mock fetch and test successful load
  - Test caching (second load uses cache)
  - Test fetch failure handling
  - Test cache clearing
  - Mock different module sources

**Verification Commands**:
```bash
npm run test -- module-fetch.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Fetching works with mock data
- Caching prevents duplicate fetches
- Error handling works
- All tests pass

---

#### Step 9: Update parseScriptModule for Imports
**Goal**: Parse modules and resolve their imports

**Files to Modify**:
- `xmlui/src/parsers/scripting/modules.ts`
- `xmlui/src/parsers/scripting/ParserError.ts`

**Implementation**:
1. Create `parseScriptModuleWithImports()` function
2. Separate import statements from other statements
3. Parse imported modules recursively (without execution yet)
4. Add error codes W038, W039
5. Keep existing `parseScriptModule()` unchanged for compatibility

**Tests to Create**:
- `xmlui/tests/parsers/scripting/module-with-imports.test.ts`
  - Parse module with single import
  - Parse module with multiple imports
  - Parse nested imports (A imports B, B imports C)
  - Test error: module not found
  - Test error: imported function not found
  - Verify function collection includes imports

**Verification Commands**:
```bash
npm run test -- module-with-imports.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Modules with imports parse correctly
- Imported functions are collected
- Error handling works
- Existing module tests still pass

---

#### Step 10: Detect Circular Imports
**Goal**: Prevent infinite recursion from circular dependencies

**Files to Modify**:
- `xmlui/src/parsers/scripting/modules.ts`
- `xmlui/src/parsers/scripting/ParserError.ts`

**Implementation**:
1. Track import stack during parsing
2. Detect when module is already being parsed
3. Add error code W042
4. Provide clear error message showing the cycle

**Tests to Create**:
- `xmlui/tests/parsers/scripting/circular-import.test.ts`
  - Test direct circular: A imports B, B imports A
  - Test indirect circular: A imports B imports C imports A
  - Test self-import: A imports A
  - Verify error message shows full cycle path
  - Test that non-circular imports still work

**Verification Commands**:
```bash
npm run test -- circular-import.test.ts
npm run test -- tests/parsers/scripting
```

**Success Criteria**:
- Circular imports are detected
- Clear error messages
- Non-circular imports unaffected
- All tests pass

---

#### Step 11: Update collectCodeBehindFromSource
**Goal**: Integrate import parsing with code-behind collection

**Files to Modify**:
- `xmlui/src/parsers/scripting/code-behind-collect.ts`

**Implementation**:
1. Make `collectCodeBehindFromSource()` async
2. Accept optional `ModuleResolver` parameter
3. Use `parseScriptModuleWithImports()` instead of `parseScriptModule()`
4. Convert `FunctionDeclaration` to `ArrowExpression` for imported functions
5. Keep function signature backward compatible (resolver optional)

**Tests to Create**:
- `xmlui/tests/parsers/scripting/code-behind-import.test.ts`
  - Collect code-behind without imports (backward compat)
  - Collect code-behind with single import
  - Collect code-behind with multiple imports
  - Verify imported functions are in result
  - Verify local functions are in result
  - Test with mock resolver

**Verification Commands**:
```bash
npm run test -- code-behind-import.test.ts
npm run test -- tests/parsers/scripting
npm run test -- tests/parsers/xmlui-parser  # Check for regressions
```

**Success Criteria**:
- Code-behind collection supports imports
- Backward compatibility maintained
- All parser tests pass
- No regressions in XMLUI parser

---

#### Step 12: Integrate with StandaloneApp (Buildless Mode)
**Goal**: Support imports in buildless/standalone apps

**Files to Modify**:
- `xmlui/src/components-core/StandaloneApp.tsx`

**Implementation**:
1. Update `parseCodeBehindResponse()` to use async code-behind collection
2. Create `ModuleResolver` instance with `fetchWithoutCache`
3. Pass resolver to `collectCodeBehindFromSource()`
4. Handle async flow in `useStandalone()` hook
5. Update error reporting for import errors

**Tests to Create**:
- `xmlui/tests/components-core/standalone-import.test.ts`
  - Mock Main.xmlui.xs with imports
  - Mock helper module
  - Verify functions are available
  - Test error handling for missing modules
  - Test with nested imports

**Verification Commands**:
```bash
npm run test -- standalone-import.test.ts
npm run test -- tests/components-core
npm run test -- tests/parsers
```

**Success Criteria**:
- Buildless mode supports imports
- Functions from imports are available
- Error handling works correctly
- All component and parser tests pass

---

#### Step 13: Integrate with Vite Plugin (Built Mode)
**Goal**: Support imports during Vite build

**Files to Modify**:
- `xmlui/bin/vite-xmlui-plugin.ts`

**Implementation**:
1. Create resolver that uses Vite's module system
2. Update transform to use `parseScriptModuleWithImports()`
3. Handle async parsing in plugin
4. Properly convert parsed modules to ESM exports
5. Maintain source maps

**Tests to Create**:
- `xmlui/tests/bin/vite-plugin-import.test.ts`
  - Mock Vite plugin context
  - Test transforming .xs file with imports
  - Test transforming .xmlui.xs file with imports
  - Verify ESM output is correct
  - Test error handling

**Verification Commands**:
```bash
npm run test -- vite-plugin-import.test.ts
npm run test -- tests/bin
npm run build  # Full build test
```

**Success Criteria**:
- Vite plugin handles imports
- ESM output is correct
- Build succeeds
- All tests pass

---

#### Step 14: End-to-End Integration Test
**Goal**: Verify complete import flow works in real scenario

**Files to Create**:
- `xmlui/tests/integration/import-e2e.test.ts`
- Test fixtures with actual .xmlui, .xmlui.xs, and .xs files

**Implementation**:
1. Create test fixture: helpers.xs with utility functions
2. Create test fixture: Component.xmlui.xs that imports helpers
3. Create test fixture: Component.xmlui that uses the component
4. Test both built and buildless modes
5. Verify runtime execution

**Tests to Create**:
- Integration test covering full flow
- Test function execution with imported functions
- Test error scenarios
- Test multiple components sharing same helper module
- Performance test (caching effectiveness)

**Verification Commands**:
```bash
npm run test -- import-e2e.test.ts
npm run test -- tests/integration
npm run test  # Full test suite
```

**Success Criteria**:
- End-to-end flow works
- Functions execute correctly
- Shared modules work
- Full test suite passes

---

#### Step 15: Documentation and Examples
**Goal**: Document the feature for users

**Files to Create**:
- `docs/public/pages/howto/import-helpers.mdx`
- `docs/src/examples/import-example/`

**Implementation**:
1. Write comprehensive import guide
2. Create example application
3. Add to component reference documentation
4. Update code-behind documentation
5. Create migration guide

**Verification**:
- Build docs without errors
- Review examples manually
- Verify all links work

**Success Criteria**:
- Documentation is clear and complete
- Examples work correctly
- Builds successfully

---

### 9. Progress Tracking

Use this checklist to track implementation progress:

- [x] **Step 1**: Add Import Token to Lexer
- [x] **Step 2**: Add Import AST Node Types  
- [x] **Step 3**: Parse Simple Import Statement
- [x] **Step 4**: Parse Multiple Named Imports
- [x] **Step 5**: Parse Import with Aliases
- [x] **Step 6**: Validate Import Statement Position
- [x] **Step 7**: Create Module Resolver (Basic)
- [x] **Step 8**: Add Module Fetching to Resolver
- [x] **Step 9**: Update parseScriptModule for Imports
- [x] **Step 10**: Detect Circular Imports
- [x] **Step 11**: Update collectCodeBehindFromSource
- [x] **Step 12**: Integrate with StandaloneApp (Buildless)
- [x] **Step 13**: Integrate with Vite Plugin (Built)
- [x] **Step 14**: End-to-End Integration Test
- [ ] **Step 15**: Documentation and Examples

### 10. Rollback Strategy

If any step fails:
1. Revert the changes from that step
2. Analyze test failures
3. Fix issues
4. Re-run tests
5. Do not proceed until all tests pass

Each step is independent enough that rollback won't affect previous completed steps.

## Open Questions

1. **Should we support absolute imports?** (e.g., `import { foo } from 'helpers.xs'`)
2. **Should imported functions be reactive?** (Currently, only local vars are reactive)
3. **How to handle import errors in production?** (Fail silently, show error component, etc.)
4. **Should we allow importing from `.xmlui.xs` files?** (Currently planning .xs only)

## Conclusion

This implementation provides a robust foundation for organizing XMLUI scripts into modular, reusable helper files while maintaining backward compatibility and following JavaScript standards.