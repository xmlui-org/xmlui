# xmlui-inline Feasibility Plan

## Goal

Create a new `xmlui-inline` code fence for Markdown that renders XMLUI apps **within** the parent app's context, sharing state, scripts, and variables—unlike `xmlui-pg` which creates isolated sandboxes using Shadow DOM.

## Resources

- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- Component creation: xmlui/dev-docs/conv-create-components.md
- Unit tests location: xmlui/tests
- Unit tests runner: vitest
- E2E tests conventions: xmlui/dev-docs/conv-e2e-testing.md

## Current Architecture Analysis

### xmlui-pg Isolation Mechanism

**How xmlui-pg Creates Sandboxes:**

1. **Markdown Processing** (`Markdown.tsx`, lines 290-306):
   - `observePlaygroundPattern()` finds `xmlui-pg` code fences
   - `convertPlaygroundPatternToMarkdown()` converts to `<samp data-pg-content="...">` tags with base64-encoded data

2. **NestedApp Rendering** (`MarkdownNative.tsx`, lines 497-520):
   - ReactMarkdown renders `<samp>` tags
   - Props decoded: `app`, `components`, `config`, `api`
   - Renders `<NestedAppAndCodeViewNative>` → `<NestedApp>`

3. **Complete Isolation** (`NestedAppNative.tsx`, lines 183-265):
   - **Shadow DOM**: `rootRef.current.attachShadow({ mode: "open" })` (line 183)
   - **Separate React Root**: `ReactDOM.createRoot(shadowRef.current)` (line 257)
   - **Own Style Context**: `<StyleProvider forceNew={true}>` (line 269)
   - **Own API Interceptor**: `<ApiInterceptorProvider>` with isolated mock (line 270)
   - **Own AppRoot**: Complete `<AppRoot>` tree with separate state (line 272)

**Why xmlui-pg is Isolated:**
- Shadow DOM prevents CSS leakage both ways
- Separate React root = separate reconciliation + state tree
- New `AppRoot` = fresh component registry, themes, globals
- Adopted stylesheets cloned, not shared

### Parent App Rendering Context

**What's Available in Parent Context:**

From `ComponentAdapter.tsx` and `renderChild.tsx`:

1. **RendererContext** (passed to all components):
   - `state`: Current container state (mutable via `updateState`)
   - `extractValue`: Evaluates properties/bindings from parent state
   - `lookupEventHandler`: Resolves event handlers in parent scope
   - `appContext`: Global functions (navigate, toast, confirm, etc.)
   - `registerComponentApi`: Registers methods accessible to parent
   - `layoutContext`: Parent layout information

2. **AppStateContext** (`AppContent.tsx`):
   - Bucket-based state management for cross-component communication
   - `getState(bucket)`, `setState(bucket, value)`

3. **ComponentProvider** Context:
   - Component registry mapping names → renderers
   - Extension manager for third-party components

4. **Shared Providers** (from `AppWrapper.tsx`):
   - React Router context
   - React Query client
   - Theme provider
   - Logger, Icon, Inspector providers

## Feasibility Assessment

### ✅ Feasible: Inline Rendering Without Shadow DOM

**Approach:**

1. **New Parser** (`utils.ts`):
   - Add `observeInlinePattern()` to detect `xmlui-inline` code fences
   - Similar to `observePlaygroundPattern()` but simpler structure
   - No need for complex segments (app/components/config/api)
   - Just parse XMLUI markup directly

2. **Direct Component Rendering** (new component: `InlineApp.tsx`):
   - **NO Shadow DOM, NO separate React root**
   - Parse XMLUI markup with `xmlUiMarkupToComponent()`
   - Call `renderChild()` directly in parent's render tree
   - Pass parent's `RendererContext` down
   - Result: inline components render as if written in parent markup

3. **Markdown Integration** (`MarkdownNative.tsx`):
   - Add new case in ReactMarkdown components
   - Detect `<span data-inline-content="...">` (new marker)
   - Render `<InlineApp>` component instead of `<NestedApp>`

**What Gets Shared Automatically:**

- ✅ **Parent State**: `extractValue` reads from parent container state
- ✅ **App State Buckets**: Inline apps can `getState()`/`setState()` on shared buckets
- ✅ **Event Handlers**: `lookupEventHandler` resolves in parent scope
- ✅ **Scripts/Actions**: `lookupAction` and `lookupSyncCallback` work from parent
- ✅ **Theme**: Inherits active theme/tone (no isolation)
- ✅ **Component Registry**: Same registry, can use parent's compounds
- ✅ **Router Context**: Shares navigation state
- ✅ **Global Functions**: Same `appContext` (navigate, toast, etc.)

**Counter Example:**
```xmlui
<App>
  <Script name="counter" value="0"/>
  
  <Markdown>
    ```xmlui-inline
    <Text>Counter: {$counter}</Text>
    ```
    
    ```xmlui-inline
    <Button onClick="setState('counter', $counter + 1)">Increment</Button>
    ```
    
    ```xmlui-inline
    <Button onClick="setState('counter', $counter - 1)">Decrement</Button>
    ```
  </Markdown>
</App>
```

All three inline apps access the same `$counter` variable via `extractValue` reading parent state.

### ✅ Styling Solution: Inline-Specific Styling (Option C)

**Approach:**
- Create new `.xmlui-inline` wrapper class in `Markdown.module.scss`
- Reset typography properties that might bleed from markdown context:
  - `font-size`, `line-height`, `font-family`, `font-weight`
  - Text decoration, text transform, letter-spacing
- Preserve layout/positioning to maintain markdown flow integration
- Components inside inline apps use their own component styles normally

**Why This Works:**
- Minimal interference with XMLUI component styling
- Maintains proper text rendering for markdown
- Allows inline components to position naturally within markdown flow
- No CSS isolation overhead (unlike Shadow DOM)

### ⚠️ Complexity: Component Lifecycle

**Challenge:**
Inline apps need proper React lifecycle management without separate roots.

**Solution:**

1. **Component Boundary**
   - Each `xmlui-inline` block becomes one React component (`<InlineApp>`)
   - Uses React's normal reconciliation
   - Proper mount/unmount when Markdown content changes

2. **State Management**
   - No separate state container
   - All state lives in parent's AppStateContext buckets
   - Cleanup: Remove state bucket listeners on unmount

3. **Error Boundaries**
   - Wrap each `<InlineApp>` in `<ErrorBoundary>`
   - Isolated error handling (one broken inline doesn't crash parent)

### ✅ Feasible: Variable Scoping

**How It Works:**

Parent script variables (e.g., `<Script name="counter">`) are stored in parent container state.

Inline apps use `extractValue` which:
1. Receives `$counter` in markup
2. Calls `extractValue(node.props.text)` (if `text="{$counter}"`)
3. `extractValue` resolves against parent's `state` object
4. Returns current value

Updates via `setState()`:
1. Inline button calls `onClick="setState('counter', $counter + 1)"`
2. `lookupEventHandler` resolves in parent scope
3. `updateState` modifies parent container state
4. All components (inline and parent) re-render with new value

**This is identical to how nested components work in regular XMLUI.**

## Implementation Steps

### Phase 1: Parser Extension
1. Add `observeInlinePattern()` to `utils.ts`
2. Add `convertInlinePatternToMarkdown()` (simpler than playground)
3. Output: `<span data-inline-content="base64-encoded-xmlui">`
4. Update `TransformedMarkdown` useMemo to process `xmlui-inline` blocks

### Phase 2: InlineApp Component
1. Create `InlineApp.tsx` in Markdown folder
Each step is independent and requires:
- ✅ Lint-free code (no ESLint/TypeScript errors)
- ✅ Unit tests and/or e2e tests added
- ✅ All tests passing (new + existing)
- ✅ User approval before proceeding to next step

---

### Step 1: Parser Extension

**Objective:** Add detection and parsing for `xmlui-inline` code fences

**Files to Modify:**
- `utils.ts`: Add new functions

**Implementation:**
1. Add `observeInlinePattern()` function
   - Detects ````xmlui-inline` code fences
   - Returns `[startIndex, endIndex, content]` or `null`
   - Similar to `observePlaygroundPattern()` but simpler (no segments)

2. Add `convertInlinePatternToMarkdown()` function
   - Input: matched `xmlui-inline` code fence content
   - Output: `<span data-inline-content="base64-encoded-xmlui"></span>`
   - Base64 encode the XMLUI markup for safe transport through markdown parser

**Tests to Add:**
- `tests/components/markdown-inline.test.ts`: Unit tests for `observeInlinePattern()`
  - Test pattern detection (finds first occurrence)
  - Test no match returns null
  - Test escaped backticks handling
  - Test multiple blocks in sequence
- Same file: Unit tests for `convertInlinePatternToMarkdown()`
  - Test basic conversion
  - Test base64 encoding/decoding round-trip
  - Test empty content handling

**Validation:**
- Run `npm run lint` - no errors
- Run `npm test` (vitest) - all pass
- No changes to existing behavior (parser doesn't affect output yet)

**Deliverable:** Parser functions that detect and encode `xmlui-inline` blocks

**🛑 APPROVAL GATE: User reviews parser implementation and tests**

---

### Step 2: Markdown Processing Integration

**Objective:** Process `xmlui-inline` blocks during markdown transformation

**Files to Modify:**
- `Markdown.tsx`: Update `TransformedMarkdown` component

**Implementation:**
1. Update `TransformedMarkdown` useMemo (around line 290)
   - Add loop after playground pattern processing
   - Call `observeInlinePattern()` to find inline blocks
   - Call `convertInlinePatternToMarkdown()` to replace with `<span>` markers
   - Update `resolvedMd` string with replacements

**Tests to Add:**
- `tests/components/markdown-inline.test.ts`: Unit tests for inline processing
  - Test that `xmlui-inline` blocks are converted to `<span>` tags
  - Test multiple inline blocks in same content
  - Test mixing `xmlui-pg` and `xmlui-inline` blocks
  - Test inline blocks with markdown text before/after

**Validation:**
- Run `npm run lint` - no errors
- Run `npm test` (vitest) - all pass
- Existing Markdown e2e tests still pass: `npx playwright test tests/e2e/components/Markdown` (nothing renders yet, just parsing)

**Deliverable:** Markdown component processes inline blocks into `<span>` markers

**🛑 APPROVAL GATE: User reviews transformation logic and tests**

---

### Step 3: Styling Infrastructure

**Objective:** Add CSS for inline app wrapper

**Files to Modify:**
- `Markdown.module.scss`: Add new styles

**Implementation:**
1. Add `.xmlui-inline` class
   - Reset typography: `font-size: initial`, `line-height: initial`, `font-family: initial`
   - Reset text styling: `font-weight: initial`, `text-decoration: none`, `text-transform: none`
   - Reset letter-spacing, word-spacing
   - Preserve layout: `display: inline-block`, `vertical-align: baseline`
   - Add slight margin for visual separation: `margin: 0.25em 0`

2. Export theme variables (if needed for customization)

**Tests to Add:**
- No automated tests for this step (CSS only)
- Manual verification in subsequent steps when components render

**Validation:**
- Run `npm run lint` - no errors
- Visual inspection: styles compile without warnings
- SCSS compiles successfully
- Run `npm run build` to ensure SCSS compilation works

**Deliverable:** CSS class ready for inline app wrapper

**🛑 APPROVAL GATE: User reviews styling approach**

---

### Step 4: InlineApp Component Implementation

**Objective:** Create component that renders parsed XMLUI inline

**Files to Create:**
- `InlineApp.tsx`: New component in Markdown folder

**Implementation:**
1. Create `InlineApp` component
   - Props: `markup` (string), need access to parent `RendererContext`
   - Use `xmlUiMarkupToComponent()` to parse markup
   - Handle parsing errors (create error component)
   - Memoize parsed component with `useMemo`
   - Call `renderChild()` to render parsed component
   - Wrap in `<div className={styles.xmluiInline}>` for styling
   - Wrap in `<ErrorBoundary>` for isolation

2. Key considerations:
   - Component must receive parent's `renderChild` function (via context or props)
   - Must handle empty/invalid markup gracefully
   - Must cleanup on unmount (React handles this automatically)

**Tests to Add:**
- `tests/components/markdown-inline.test.ts`: Unit tests for InlineApp component
  - Test component interface (props, types)
  - Test parsing error handling path
  - Test empty markup handling
- Note: Full rendering tests will be in e2e (Step 5)

**Validation:**
- Run `npm run lint` - no errors
- Run `npm test` (vitest) - all pass
- Component compiles without TypeScript errors
- Run `npm run build` to verify build succeeds

**Deliverable:** Working InlineApp component (not integrated yet)

**🛑 APPROVAL GATE: User reviews component implementation and tests**

---

### Step 5: Markdown Rendering Integration

**Objective:** Connect InlineApp to Markdown rendering pipeline

**Files to Modify:**
- `MarkdownNative.tsx`: Add `span` handler to ReactMarkdown components

**Implementation:**
1. Add new `span` handler in ReactMarkdown components object (around line 570)
   - Check for `data-inline-content` attribute
   - Decode base64 content
   - Render `<InlineApp markup={decodedContent} />`
   - Pass through other span elements unchanged

2. Import `InlineApp` component
3. Import `decodeFromBase64` utility

**Tests to Add:**
- `tests/e2e/components/Markdown/markdown-inline.xmlui.nonsmoke.spec.ts`: E2E tests
  - Test simple inline component renders (e.g., `<Text>Hello</Text>`)
  - Test inline with props (e.g., `<Button variant="primary">Click</Button>`)
  - Test error handling (invalid XMLUI shows error, doesn't crash)
  - Test multiple inline blocks render independently
  - Use `initTestBed` fixture with proper XMLUI app structure

**Validation:**
- Run `npm run lint` - no errors
- Run `npx playwright test tests/e2e/components/Markdown/markdown-inline` - all pass
- Run existing Markdown e2e tests - all pass: `npx playwright test tests/e2e/components/Markdown`
- Manual test: Simple inline component renders visually

**Deliverable:** Complete basic inline rendering (no state sharing yet)

**🛑 APPROVAL GATE: User reviews integration and basic rendering**

---

### Step 6: State Sharing - Read Access

**Objective:** Enable inline apps to read parent state variables

**Files to Verify/Test:**
- No code changes needed (architecture already supports this)
- `extractValue` in renderer context already reads parent state

**Tests to Add:**
- `tests/e2e/components/Markdown/markdown-inline.xmlui.nonsmoke.spec.ts`: E2E test for state reading
  - Parent defines `<Script name="message" value="Hello"/>`
  - Inline app renders `<Text>{$message}</Text>`
  - Verify text displays "Hello"
  - Update parent state via button click, verify inline updates

**Validation:**
- Run `npm run lint` - no errors
- Run `npx playwright test tests/e2e/components/Markdown/markdown-inline` - all pass
- Verify inline components re-render when parent state changes

**Deliverable:** Inline apps can read parent variables

**🛑 APPROVAL GATE: User verifies read-only state access works**

---

### Step 7: State Sharing - Write Access

**Objective:** Enable inline apps to modify parent state

**Files to Verify/Test:**
- No code changes needed (architecture already supports this)
- `lookupEventHandler` already resolves in parent scope

**Tests to Add:**
- `tests/e2e/components/Markdown/markdown-inline.xmlui.nonsmoke.spec.ts`: E2E test for state modification
  - Parent defines `<Script name="counter" value="0"/>`
  - First inline displays counter with testId
  - Second inline has button with `onClick="setState('counter', $counter + 1)"` and testId
  - Third inline has button with `onClick="setState('counter', $counter - 1)"` and testId
  - Click increment button, verify all three inline blocks show updated value
  - Click decrement button, verify all three inline blocks show updated value

**Validation:**
- Run `npm run lint` - no errors
- Run `npx playwright test tests/e2e/components/Markdown/markdown-inline` - all pass
- Manual test: Counter example works as expected

**Deliverable:** Complete state sharing (read + write)

**🛑 APPROVAL GATE: User verifies bidirectional state sharing**

---

### Step 8: Advanced Features Testing

**Objective:** Verify compound components, scripts, and error isolation

**Tests to Add:**
- `tests/e2e/components/Markdown/markdown-inline.xmlui.nonsmoke.spec.ts`: E2E test for compound components
  - Parent defines compound component in `<Components>`
  - Inline app uses that compound component
  - Verify component renders with testId

- Same file: E2E test for script functions
  - Parent defines `<Script name="greet" value="(name) => 'Hello ' + name"/>`
  - Inline calls script: `<Text testId="greeting">{greet('World')}</Text>`
  - Verify text contains "Hello World"

- Same file: E2E test for error isolation
  - Multiple inline blocks with testIds
  - One has invalid XMLUI (syntax error)
  - Verify: broken inline shows error message via testId
  - Verify: other inline blocks render correctly
  - Verify: parent app container is still visible

**Validation:**
- Run `npm run lint` - no errors
- Run `npx playwright test tests/e2e/components/Markdown/markdown-inline` - all pass
- Run all existing Markdown e2e tests: `npx playwright test tests/e2e/components/Markdown` - all pass

**Deliverable:** Production-ready feature with comprehensive test coverage

**🛑 APPROVAL GATE: User reviews complete implementation**

---

### Step 9: Documentation and Examples

**Objective:** Document the feature for users

**Files to Create/Modify:**
- Add examples to `Markdown.md` component documentation
- Update any relevant how-to guides

**Implementation:**
1. Add examples showing:
   - Basic inline component
   - State sharing (counter example)
   - Multiple inline blocks collaborating
   - Error handling behavior

2. Add comparison section: when to use `xmlui-inline` vs `xmlui-pg`

**Validation:**
- Documentation renders correctly
- Examples are copy-pasteable and work

**Deliverable:** Complete documentation

**🛑 APPROVAL GATE: User reviews documentation**
### Medium Risk
- ⚠️ **Style Conflicts**: Markdown typography vs XMLUI component styles
  - Mitigation: Targeted CSS resets
- ⚠️ **Performance**: Multiple inline apps → multiple parse calls
  - Mitigation: Memoize parsed components in `useMemo`

### High Risk
- ❌ **NONE** - Architecture supports this naturally

## Comparison: xmlui-pg vs xmlui-inline

| Feature | xmlui-pg | xmlui-inline |
|---------|----------|--------------|
| **Rendering** | Separate React root in Shadow DOM | Direct renderChild in parent tree |
| **State** | Isolated (own AppRoot) | Shared (parent container state) |
| **Scripts** | Own scope | Parent scope |
| **Styles** | Isolated (Shadow DOM) | Inherited + optional reset |
| **Components** | Own registry + extensions | Parent registry |
| **Theme** | Own (can override) | Parent theme |
| **Router** | Own (optional) | Parent router |
| **Use Case** | Sandboxed demos, playgrounds | Inline interactive examples |

## Conclusion

**Feasibility: HIGH**

The xmlui-inline feature is architecturally feasible because:

1. **No Shadow DOM Needed**: Inline apps can render directly in parent's React tree using `renderChild()`
2. **State Sharing Works**: Existing `extractValue`/`updateState` mechanisms naturally support cross-component state
3. **Minimal Changes**: Mostly parser + new component, no core rendering changes
4. **Clean Architecture**: Follows XMLUI's existing component composition patterns

The key insight: **xmlui-inline is just a way to write nested XMLUI components in Markdown instead of XML**. The rendering pipeline doesn't distinguish between components defined in `<App>` markup vs those parsed from Markdown code fences.
