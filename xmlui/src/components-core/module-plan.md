# Module System Simplification Plan

**Date:** 2026-02-04  
**Purpose:** Refactor the module loading, parsing, resolution, and code-behind handling system to improve code clarity, maintainability, and reduce complexity.

---

## Current State Analysis

### Components of the System

1. **ModuleResolver.ts** - Path resolution, caching, circular dependency detection
2. **modules.ts** - Module parsing with/without imports, validation
3. **code-behind-collect.ts** - Collecting declarations from parsed modules
4. **vite-xmlui-plugin.ts** - Build-time transformation of XMLUI files
5. **StandaloneApp.tsx** - Runtime loading and execution of components

### Identified Complexity Issues

#### 1. **Dual API Pattern (Sync/Async)**
- **Problem:** Two versions of critical functions (`parseScriptModule` vs `parseScriptModuleWithImports`, `collectCodeBehindFromSource` vs `collectCodeBehindFromSourceWithImports`)
- **Impact:** Code duplication, confusion about which to use, different behavior patterns
- **Locations:** `modules.ts` lines 151-226, 247-498; `code-behind-collect.ts` lines 23-49, 56-123

#### 2. **Scattered Cache Management**
- **Problem:** Three separate cache clearing points that must be called together
  - `clearParsedModulesCache()` in modules.ts
  - `ModuleResolver.clearCache()` in ModuleResolver.ts
  - `ModuleResolver.resetImportStack()` in ModuleResolver.ts
- **Impact:** Error-prone (forgetting one breaks the system), boilerplate in tests and runtime
- **Evidence:** Every test file and the vite plugin calls all three functions (see grep results: 8+ locations)

#### 3. **Mixed URL and File Path Handling**
- **Problem:** ModuleResolver handles both URLs (buildless) and file paths with conditional logic
- **Impact:** Complex path resolution logic with branching
- **Location:** `ModuleResolver.ts` lines 189-198

#### 4. **Module Fetcher Abstraction Overhead**
- **Problem:** Custom `ModuleFetcher` type adds indirection without clear benefit
- **Impact:** Extra layer of abstraction, requires setup in multiple places
- **Locations:** `ModuleResolver.ts` line 29, used throughout vite-xmlui-plugin.ts and StandaloneApp.tsx

#### 5. **Validation Logic Duplication**
- **Problem:** Import validation spread across multiple locations with similar error handling
- **Impact:** Inconsistent validation, harder to maintain rules
- **Locations:** `modules.ts` lines 88-144 (validateImportedModuleStatements), inline validation in parseScriptModuleWithImports

#### 6. **Complex Error Type Hierarchy**
- **Problem:** `ModuleErrors` type is `Record<string, ParserErrorMessage[]>` but also used as discriminated union result
- **Impact:** Type checking via `isModuleErrors()` helper, confusion between errors and parsed results
- **Location:** `modules.ts` lines 57-67

#### 7. **Cache vs Import Stack Inconsistency**
- **Problem:** `parsedModulesCache` for memoization vs `importStack` for circular detection are separate concerns mixed in ModuleResolver
- **Impact:** Two tracking mechanisms for related but different purposes
- **Locations:** `ModuleResolver.ts` lines 42-44 (cache), 49-52 (stack)

#### 8. **Inline Script Parsing Duplication**
- **Problem:** StandaloneApp and vite-xmlui-plugin both extract and parse `<script>` tags with similar logic
- **Impact:** Code duplication, potential inconsistency
- **Locations:** `StandaloneApp.tsx` lines 273-292, `vite-xmlui-plugin.ts` lines 37-42

#### 9. **Circular Dependency Detection Complexity**
- **Problem:** Circular import detection using manual stack tracking in ModuleResolver
- **Impact:** Complex to understand, easy to break if not careful with stack management
- **Location:** `ModuleResolver.ts` lines 78-101

#### 10. **Module Name Resolution Confusion**
- **Problem:** Module names are sometimes paths, sometimes URLs, sometimes relative imports
- **Impact:** Hard to trace what a "moduleName" actually represents in different contexts
- **Evidence:** `parseScriptModule(moduleName, ...)` vs `resolveAndFetchModule(importPath, fromFile)`

---

## Simplification Opportunities

### High-Impact Changes

1. **Unify Sync/Async APIs** - Make all parsing async, provide sync wrapper if needed
2. **Centralize Cache Management** - Single `ModuleCache` class with one clear method
3. **Separate URL Resolver** - Different strategies for URLs vs file paths
4. **Simplify Fetcher** - Direct async function, not custom type
5. **Consolidate Validation** - Single validation pass with clear rules

### Medium-Impact Changes

6. **Improve Error Types** - Use discriminated unions properly (Result<T, E> pattern)
7. **Separate Concerns** - Parsing, validation, resolution should be distinct phases
8. **Extract Common Logic** - Deduplicate script tag extraction
9. **Simplify Circular Detection** - Use Set-based approach or built-in cache cycle detection

### Low-Impact Changes

10. **Consistent Naming** - Clear distinction between modulePath, importPath, filePath
11. **Better Type Safety** - Leverage TypeScript more effectively
12. **Documentation** - Add inline docs explaining the flow

---

## Proposed Architecture

### New Structure

```
parsers/scripting/
├── ModuleCache.ts           # NEW: Unified cache management
├── ModuleLoader.ts          # NEW: High-level loading orchestration
├── ModuleParser.ts          # REFACTORED: Pure parsing (from Parser.ts)
├── ModuleValidator.ts       # NEW: Centralized validation rules
├── PathResolver.ts          # REFACTORED: Clean path resolution
├── FetchStrategy.ts         # NEW: URL vs File fetching strategies
└── types.ts                 # NEW: Shared types
```

### Key Improvements

1. **Single Entry Point:** `ModuleLoader.loadModule(path, options)` handles everything
2. **Clear Phases:** Parse → Validate → Resolve Imports → Collect Declarations
3. **One Cache:** `ModuleCache.clear()` is all you need
4. **Strategy Pattern:** Different fetchers for URLs vs files
5. **Result Type:** `Result<ParsedModule, ModuleError[]>` for type safety

---

## Migration Steps (Small, Testable)

### Phase 1: Preparation (Foundation) ✅ COMPLETED

#### Step 1.1: Create Module Types File ✅
**Goal:** Centralize all module-related types  
**Changes:**
- Create `xmlui/src/parsers/scripting/types.ts`
- Move `ResolvedModule`, `ModuleErrors`, `ModuleFetcher` types here
- Export from central location

**Testing:** Types compile, existing code still works  
**Files Modified:** New file + import updates  
**Estimated Risk:** Very Low

---

#### Step 1.2: Create ModuleCache Class ✅
**Goal:** Unify cache management (COMPLETED)  
**Changes:**
- Create `xmlui/src/parsers/scripting/ModuleCache.ts`
- Implement `ModuleCache` class with:
  - `get(path: string): ParsedModule | undefined`
  - `set(path: string, module: ParsedModule): void`
  - `has(path: string): boolean`
  - `clear(): void`
  - Static instance for global cache
- Include resolved module cache and parsed module cache

**Testing:** Unit tests for cache operations  
**Files Modified:** New file  
**Estimated Risk:** Very Low

---

#### Step 1.3: Create CircularDependencyDetector ✅
**Goal:** Isolate circular dependency logic (COMPLETED)  
**Changes:**
- Create `xmlui/src/parsers/scripting/CircularDependencyDetector.ts`
- Move import stack logic from ModuleResolver
- Simpler API: `push()`, `pop()`, `checkCircular()`, `reset()`

**Testing:** Unit tests for circular detection  
**Files Modified:** New file  
**Estimated Risk:** Low

---

### Phase 2: Consolidate Cache Usage ✅ COMPLETED

#### Step 2.1: Replace clearParsedModulesCache ✅
**Goal:** Use ModuleCache.clear() instead  
**Changes:**
- Update `modules.ts` to use `ModuleCache.clear()`
- Update all test files
- Update `vite-xmlui-plugin.ts`
- Update `code-behind-collect.ts`
- Keep old function as deprecated wrapper

**Testing:** Run all existing tests, should pass unchanged  
**Files Modified:** 8-10 files  
**Estimated Risk:** Low

---

#### Step 2.2: Replace ModuleResolver Cache Calls ✅
**Goal:** Consolidate into ModuleCache (COMPLETED)  
**Changes:**
- Move `ModuleResolver.moduleCache` into `ModuleCache`
- Update `ModuleResolver.clearCache()` to call `ModuleCache.clear()`
- Update `ModuleResolver.resetImportStack()` to call `CircularDependencyDetector.reset()`

**Testing:** All tests still pass  
**Files Modified:** ModuleResolver.ts, test files  
**Estimated Risk:** Low

---

#### Step 2.3: Single Clear Function ✅
**Goal:** One function to rule them all (COMPLETED)  
**Changes:**
- Create `clearAllModuleCaches()` in ModuleCache
- Calls: `ModuleCache.clear()` + `CircularDependencyDetector.reset()`
- Update all call sites to use this single function
- Deprecate old individual functions

**Testing:** All tests pass with single call  
**Files Modified:** 8-10 files  
**Estimated Risk:** Low

---

### Phase 3: Simplify Module Resolution ✅ COMPLETED

#### Step 3.1: Create PathResolver Class ✅
**Goal:** Clean separation of path resolution logic  
**Changes:**
- Create `xmlui/src/parsers/scripting/PathResolver.ts`
- Extract path resolution methods from ModuleResolver
- Support both URL and file path resolution with clear separation
- Use strategy pattern: `FilePathResolver` and `URLPathResolver`

**Testing:** Unit tests for all path resolution scenarios  
**Files Modified:** New file  
**Estimated Risk:** Medium

---

#### Step 3.2: Migrate ModuleResolver to Use PathResolver ✅
**Goal:** Reduce complexity in ModuleResolver  
**Changes:**
- Update `ModuleResolver.resolvePath()` to delegate to PathResolver
- Keep same public API initially
- Remove internal path manipulation logic

**Testing:** All path resolution tests pass  
**Files Modified:** ModuleResolver.ts  
**Estimated Risk:** Medium

---

### Phase 4: Unify Async/Sync APIs ✅ COMPLETED

#### Step 4.1: Make Core Parsing Async ✅
**Goal:** Remove duplication between sync and async paths  
**Changes:**
- Update `parseScriptModule()` to be async
- Rename to `parseScriptModuleAsync()`
- Keep old `parseScriptModule()` as sync wrapper that throws on imports
- Update inline documentation

**Testing:** Run module parsing tests  
**Files Modified:** modules.ts  
**Estimated Risk:** Medium

---

#### Step 4.2: Update collectCodeBehind Functions ✅
**Goal:** Use async version as primary  
**Changes:**
- Make `collectCodeBehindFromSource()` call the async version without fetcher
- Remove duplication in logic
- Keep both functions but one is wrapper of the other

**Testing:** Code-behind collection tests pass  
**Files Modified:** code-behind-collect.ts  
**Estimated Risk:** Low

---

#### Step 4.3: Update Call Sites to Async ✅
**Goal:** Use async throughout  
**Changes:**
- Update `vite-xmlui-plugin.ts` (already async)
- Update `StandaloneApp.tsx` (already async)
- Update transform.ts if needed
- Only sync calls should be in tests that explicitly test sync behavior

**Testing:** Integration tests pass  
**Files Modified:** 3-5 files  
**Estimated Risk:** Medium

---

### Phase 5: Consolidate Validation ✅ COMPLETED

#### Step 5.1: Create ModuleValidator Class ✅
**Goal:** Centralize all validation rules  
**Changes:**
- Create `xmlui/src/parsers/scripting/ModuleValidator.ts`
- Move `validateImportedModuleStatements()` from modules.ts
- Add methods: `validateMainModule()`, `validateImportedModule()`
- Clear error message generation

**Testing:** Validation tests pass  
**Files Modified:** New file + modules.ts  
**Estimated Risk:** Low

---

#### Step 5.2: Use ModuleValidator in Parsing ✅
**Goal:** Single validation pass  
**Changes:**
- Update `parseScriptModuleWithImports()` to use ModuleValidator
- Remove inline validation code
- Consistent error collection

**Testing:** All validation scenarios covered  
**Files Modified:** modules.ts  
**Estimated Risk:** Medium

---

### Phase 6: Improve Error Handling ✅ COMPLETED

#### Step 6.1: Create Result Type ✅
**Goal:** Type-safe error handling  
**Changes:**
- Add Result<T, E> type to types.ts
- Create helper functions: `ok()`, `err()`, `isOk()`, `isErr()`
- Add `ParseResult = Result<ScriptModule, ParserError[]>` type

**Testing:** Type checking works  
**Files Modified:** types.ts  
**Estimated Risk:** Low

---

#### Step 6.2: Update Return Types ✅
**Goal:** Use Result instead of union type  
**Changes:**
- Update `parseScriptModuleAsync()` return type
- Update `collectCodeBehindFromSourceWithImports()` return type
- Update call sites to check with `isOk()` / `isErr()`

**Testing:** All call sites updated correctly  
**Files Modified:** 5-8 files  
**Estimated Risk:** Medium

---

### Phase 7: Deduplicate Script Extraction

#### Step 7.1: Create ScriptExtractor Utility
**Goal:** Single place for script tag extraction  
**Changes:**
- Create `xmlui/src/parsers/scripting/ScriptExtractor.ts`
- Extract `extractInlineScript(markup: string)` function
- Returns `{ script: string, cleanedMarkup: string } | null`

**Testing:** Unit tests for various script tag scenarios  
**Files Modified:** New file  
**Estimated Risk:** Low

---

#### Step 7.2: Use ScriptExtractor
**Goal:** Remove duplication  
**Changes:**
- Update StandaloneApp.tsx to use ScriptExtractor
- Update vite-xmlui-plugin.ts to use ScriptExtractor
- Remove duplicate regex logic

**Testing:** All inline script tests pass  
**Files Modified:** StandaloneApp.tsx, vite-xmlui-plugin.ts  
**Estimated Risk:** Medium

---

### Phase 8: Simplify Module Fetcher

#### Step 8.1: Remove Custom Fetcher Type
**Goal:** Use standard async functions  
**Changes:**
- Change `ModuleFetcher` type to just `(path: string) => Promise<string>`
- Remove abstraction overhead
- Update ModuleResolver.setCustomFetcher parameter type

**Testing:** All fetcher usage still works  
**Files Modified:** ModuleResolver.ts, types.ts  
**Estimated Risk:** Low

---

#### Step 8.2: Optional Fetcher with Default
**Goal:** Simpler API  
**Changes:**
- Make fetcher optional in parsing functions
- Provide default fetcher for file system (Node) or fetch (browser)
- Auto-detect environment

**Testing:** Both Node and browser scenarios work  
**Files Modified:** modules.ts, ModuleResolver.ts  
**Estimated Risk:** Medium

---

### Phase 9: Create High-Level Loader

#### Step 9.1: Create ModuleLoader Class
**Goal:** Single entry point for all loading  
**Changes:**
- Create `xmlui/src/parsers/scripting/ModuleLoader.ts`
- High-level API: `loadModule(path, options)`
- Orchestrates: path resolution → fetching → parsing → validation → caching
- Options: `{ fetcher?, allowImports?, baseUrl? }`

**Testing:** Integration tests using ModuleLoader  
**Files Modified:** New file  
**Estimated Risk:** Medium

---

#### Step 9.2: Migrate to ModuleLoader
**Goal:** Use new API everywhere  
**Changes:**
- Update vite-xmlui-plugin.ts to use ModuleLoader
- Update StandaloneApp.tsx to use ModuleLoader
- Update code-behind-collect.ts to use ModuleLoader internally
- Keep old APIs as deprecated wrappers

**Testing:** All integration tests pass  
**Files Modified:** 3-5 files  
**Estimated Risk:** High

---

### Phase 10: Cleanup and Documentation

#### Step 10.1: Remove Deprecated Functions
**Goal:** Clean up old code  
**Changes:**
- Remove old sync versions if unused
- Remove deprecated wrappers
- Update imports throughout codebase

**Testing:** Full test suite passes  
**Files Modified:** 10-15 files  
**Estimated Risk:** Medium

---

#### Step 10.2: Add Comprehensive Documentation
**Goal:** Make system understandable  
**Changes:**
- Add JSDoc to all public APIs
- Create architecture.md documenting the flow
- Add inline comments explaining complex logic
- Update dev-docs if needed

**Testing:** Documentation review  
**Files Modified:** All new/modified files  
**Estimated Risk:** Very Low

---

#### Step 10.3: Performance Optimization
**Goal:** Ensure no performance regression  
**Changes:**
- Benchmark before/after
- Optimize cache lookups if needed
- Consider lazy loading strategies
- Profile import resolution

**Testing:** Performance tests  
**Files Modified:** Various  
**Estimated Risk:** Low

---

## Testing Strategy

### After Each Step

1. **Unit Tests:** Run relevant unit tests
2. **Integration Tests:** Run import-related integration tests
3. **Build Test:** Run `npm run build` for vite plugin
4. **Manual Test:** Test in playground if UI changes

### Regression Testing

- Keep all existing tests passing
- Add new tests for new functionality
- Test both buildless (URLs) and built (files) scenarios
- Test circular dependency detection
- Test error handling

### Test Files to Monitor

- `tests/parsers/scripting/code-behind-import.test.ts`
- `tests/parsers/scripting/module-parse.test.ts`
- `tests/integration/import-e2e.test.ts`
- `tests/integration/import-module-validation.test.ts`

---

## Risk Assessment

### High Risk Steps
- **Step 9.2** (Migrate to ModuleLoader): Touches many files, changes core flow

### Medium Risk Steps
- **Step 3.1, 3.2** (PathResolver): Path logic is subtle
- **Step 4.1, 4.3** (Async migration): Affects call patterns
- **Step 5.2, 6.2** (Validation/Error changes): Error handling is critical
- **Step 7.2** (Script extraction): Used in critical paths

### Low Risk Steps
- Most Phase 1 and 2 steps (new code, isolated changes)
- Documentation and cleanup steps

---

## Success Criteria

### Code Quality
- ✅ No duplicate parsing logic (sync/async)
- ✅ Single cache clear function
- ✅ Clear separation of concerns
- ✅ Less than 5 steps to understand module loading flow

### Maintainability
- ✅ New developer can understand the system in < 30 minutes
- ✅ Adding a new validation rule takes < 10 lines of code
- ✅ Path resolution logic isolated and testable

### Performance
- ✅ No performance regression (< 5% slowdown acceptable)
- ✅ Cache effectiveness maintained or improved

### Compatibility
- ✅ All existing tests pass
- ✅ Public API maintains backward compatibility during migration
- ✅ Both buildless and built modes work

---

## Migration Timeline

**Estimated Total Time:** 3-5 days (assuming full-time work)

- **Phase 1-2:** 0.5 days (foundation and cache consolidation)
- **Phase 3-4:** 1 day (path resolution and async unification)
- **Phase 5-6:** 0.5 days (validation and errors)
- **Phase 7-8:** 0.5 days (script extraction and fetcher)
- **Phase 9:** 1 day (high-level loader - most complex)
- **Phase 10:** 0.5-1 day (cleanup and documentation)

**Recommendation:** Execute phases sequentially, commit and test after each step.

---

## Open Questions

1. **Should we keep sync API at all?** 
   - Current usage: Only in tests and one place in transform.ts
   - Recommendation: Keep as thin wrapper that errors on imports

2. **How to handle browser vs Node.js fetching?**
   - Browser: Use `fetch()`
   - Node.js: Use `fs.readFile()`
   - Recommendation: Auto-detect or require explicit fetcher in browser

3. **Should ModuleLoader be a class or module with functions?**
   - Class: Better for dependency injection, testing
   - Module: Simpler, functional style
   - Recommendation: Class for better testability

4. **Deprecation strategy for old APIs?**
   - Option 1: Mark deprecated but keep forever
   - Option 2: Mark deprecated, remove in next major version
   - Recommendation: Option 2 with clear migration guide

---

## Conclusion

This plan transforms a complex, multi-faceted module system into a clear, layered architecture:

1. **Cache Layer:** Single ModuleCache manages all caching
2. **Path Layer:** PathResolver handles all path logic
3. **Parse Layer:** ModuleParser does pure parsing
4. **Validation Layer:** ModuleValidator enforces rules
5. **Loading Layer:** ModuleLoader orchestrates everything

Each step is small, testable, and builds on previous steps. The end result is more maintainable, easier to understand, and easier to extend.
