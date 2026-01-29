# Extending Table with Keyboard Shortcuts and Actions

**IMPORTANT**: 

- Always read these resources after you summarize a conversation:
  - Component creation conventions: xmlui/dev-docs/conv-create-components.md
  - E2E testing conventions: xmlui/dev-docs/conv-e2e-testing.md
  - Unit tests folder: xmlui/tests

- Do not generate unnecessary content (like estimations, executive summaries, etc.)
- Strive for conciseness

## Initial Request

I want to extend the Table component with events that represent user-triggered actions so developers can write event handlers for them:

- selectAll
- cut
- copy
- paste
- delete

For all events, I want to pass the current selection context of the Table as well as the current row and cell context.

I want to bind these actions to keyboard shortcut keys (when the Table has focus).

I also want a customizable key binding mechanism that describes shortcut keys with an object like this:

```json
{
  "selectAll": "Ctrl+A",
  "cut": "Ctrl+X",
  "copy": "Ctrl+C",
  "paste": "Ctrl+V",
  "delete": "Delete"
}
```

I want to use the same approach Electron uses for defining keys as strings, striving for platform independence.

I want to extract the key binding (key parsing) mechanism so I can use it in the future for other components.

## Implementation Considerations

- Implementation should be done in small steps, running new unit tests and new e2e tests after each step.
- Whenever a component is updated (such as Table), after the particular step's feature implementation and successful testing, I want to run all e2e tests for the component as a final step.
- Implementation should include checking affected source files against potential linting issues.
- When a particular step is completed, wait for my approval before proceeding to the next step.

---

## Implementation Plan

### Step 1: Create KeyBinding Parser Utility ✅ COMPLETED
**Goal**: Create a reusable keyboard shortcut parser that converts Electron-style key strings to browser keyboard events.

**Tasks**:
1. Create parser in `xmlui/src/parsers/keybinding-parser/` with files:
   - `keybinding-parser.ts`: Main parser implementation
   - `keybinding-parser.test.ts`: Unit tests

2. Implement `parseKeyBinding(keyString: string)` with:
   - Support for Electron accelerator key names:
     - `CmdOrCtrl`: Command on macOS, Ctrl on Windows/Linux
     - `Alt`: Alt/Options
     - `Shift`: Shift
     - `Super`: Command on macOS, Windows key on Windows/Linux
     - `Ctrl`: Control key
     - `Cmd`: Command key (macOS only)
   - Support for special keys: Delete, Backspace, Enter, Escape, Tab, Arrow keys (ArrowUp, ArrowDown, ArrowLeft, ArrowRight), etc.
   - Platform detection for key normalization
   - Returns normalized `ParsedKeyBinding` object

3. Implement `matchesKeyEvent(event: KeyboardEvent, binding: ParsedKeyBinding)`:
   - Check if a keyboard event matches a parsed key binding
   - Handle platform-specific modifier key matching

4. Create comprehensive unit tests in `xmlui/src/parsers/keybinding-parser/keybinding-parser.test.ts`:
   - Test parsing Electron accelerator keys (CmdOrCtrl, Alt, Shift, Super, Ctrl, Cmd)
   - Test parsing special keys (Delete, Backspace, Enter, etc.)
   - Test parsing key combinations (e.g., "CmdOrCtrl+A", "Shift+Delete")
   - Test platform-specific behavior (Ctrl vs Cmd on macOS)
   - Test invalid inputs (malformed strings, unknown keys)
   - Test matching keyboard events against parsed bindings
   - Test case sensitivity
   - Test whitespace handling

**Expected Output**:
- `keybinding-parser.ts` utility file with fully functional parser
- `keybinding-parser.test.ts` unit test file with comprehensive test coverage
- All unit tests passing
- No linting errors

---

### Step 2: Add KeyBinding Properties to Table Metadata ✅ COMPLETED
**Goal**: Define the API for keyboard shortcuts in the Table component.

**Learnings from Table Code Review**:
- Table metadata defined in `Table.tsx` using `createMetadata()` helper
- Properties are in the `props` section of metadata
- Properties use helpers like `d()` for descriptions
- Default values defined in `defaultProps` object at bottom of `TableNative.tsx`
- Complex object props documented with examples

**Tasks**:
1. Update `Table.tsx` metadata in the `props` section (after existing props):
   ```typescript
   keyBindings: {
     description:
       "This property defines keyboard shortcuts for table actions. Provide an object with " +
       "action names as keys and keyboard shortcut strings as values. The shortcut strings use " +
       "Electron accelerator syntax (e.g., 'CmdOrCtrl+A', 'Delete'). Available actions: " +
       "`selectAll`, `cut`, `copy`, `paste`, `delete`. If not provided, default shortcuts are used.",
     valueType: "object",
     defaultValue: "{ selectAll: 'CmdOrCtrl+A', cut: 'CmdOrCtrl+X', copy: 'CmdOrCtrl+C', paste: 'CmdOrCtrl+V', delete: 'Delete' }",
   },
   ```

2. Update `defaultProps` in `TableNative.tsx` (at the bottom of the file):
   ```typescript
   keyBindings: {
     selectAll: "CmdOrCtrl+A",
     cut: "CmdOrCtrl+X",
     copy: "CmdOrCtrl+C",
     paste: "CmdOrCtrl+V",
     delete: "Delete",
   },
   ```

3. Update `TableProps` interface in `TableNative.tsx` (add after existing props):
   ```typescript
   keyBindings?: Record<string, string>;
   ```

**Expected Output**:
- `keyBindings` property in Table metadata with full documentation
- Default key bindings in `defaultProps`
- TypeScript type in `TableProps` interface
- No breaking changes to existing Table functionality
- Documentation follows existing Table patterns

---

### Step 3: Create Table Action Event Context Types ✅ COMPLETED
**Goal**: Define the data structure passed to keyboard action event handlers.

**Learnings from Table Code Review**:
- Table uses `useRowSelection` hook which returns `selectedItems` (array of row objects) and `selectedRowIdMap`
- Selection API is exposed via `selectionApi` object with methods: `getSelectedItems()`, `getSelectedIds()`, `clearSelection()`, `selectAll()`, `selectId()`
- Table has `focusedIndex` state tracking the currently focused row
- Each row has `row.original` containing the full row data object
- Selection is managed through the SelectionStore context
- Row selection respects `rowDisabledPredicate` and `rowUnselectablePredicate`
- Table operates on `data` array with items identified by `idKey` prop (defaults to "id")

**Tasks**:
1. Create context types in `TableNative.tsx` near the top with other types:
   
   ```typescript
   /**
    * Context information about the current selection in the table
    */
   type TableSelectionConaction events in Table's API.

**Learnings from Table Code Review**:
- Events are defined in `TableMd` metadata using `createMetadata()` helper
- Event naming convention: camelCase in metadata, onEventName in props
- Events use `AsyncFunction` type for async-capable handlers
- Table already has events: `contextMenu`, `sortingDidChange`, `willSort`, `rowDoubleClick`, `selectionDidChange`
- Events are documented with `description`, `signature`, and `parameters` fields

**Tasks**:
1. Update `Table.tsx` metadata in the `events` section:
   ```typescript
   selectAll: {
     description: "This event is triggered when the user presses the select-all keyboard shortcut (default: Ctrl+A/Cmd+A). The handler receives the complete action context including selection state and focused row information.",
     signature: "selectAll(context: TableActionContext): void | Promise<void>",
     parameters: {
       context: "The action context containing selection, focused row, and cell information.",
     },
   },
   cut: {
     description: "This event is triggered when the user presses the cut keyboard shortcut (default: Ctrl+X/Cmd+X). The handler receives the complete action context. Note: The component does not automatically modify data; the handler must implement the cut logic.",
     signature: "cut(context: TableActionContext): void | Promise<void>",
     parameters: {
       context: "The action context containing selection, focused row, and cell information.",
     },
   },
   copy: {
     description: "This event is triggered when the user presses the copy keyboard shortcut (default: Ctrl+C/Cmd+C). The handler receives the complete action context. The handler should implement the copy logic (e.g., using the Clipboard API).",
     signature: "copy(context: TableActionContext): void | Promise<void>",
     parameters: {
       context: "The action context containing selection, focused row, and cell information.",
     },
   },
   paste: {
     description: "This event is triggered when the user presses the paste keyboard shortcut (default: Ctrl+V/Cmd+V). The handler receives the complete action context. The handler must implement the paste logic.",
     signature: "paste(context: TableActionContext): void | Promise<void>",
     parameters: {
       context: "The action context containing selection, focused row, and cell information.",
     },
   },
   delete: {
     description: "This event is triggered when the user presses the delete keyboard shortcut (default: Delete key). The handler receives the complete action context. Note: The component does not automatically remove data; the handler must implement the delete logic.",
     signature: "delete(context: TableActionContext): void | Promise<void>",
     parameters: {
       context: "The action context containing selection, focused row, and cell information.",
     },
   },
   ```

2. Update `TableProps` interface in `TableNative.tsx`:
   - Add to the interface after existing event props:
   ```typescript
   onSelectAll?: AsyncFunction;
   onCut?: AsyncFunction;
   onCopy?: AsyncFunction;
   onPaste?: AsyncFunction;
   onDelete?: AsyncFunction;
   ```

**Expected Output**:
- Five new events in Table metadata with full documentation
- Updated TypeScript interface in TableNative.tsx
- Events follow existing Table event patterns
- Documentation clarifies that handlers must implement the actual logicy) */
     rowId: string;
     /** Whether this row is currently selected */
     isSelected: boolean;
     /** Whether this row is currently focused */
     isFocused: boolean;
   };
   
   /**
    * Context information about a specific cell (for future use)
    */
   type TableCellContext = {
     /** The cell value */
     value: any;
     /** Column accessor key */
     columnKey: string;
     /** Column index (0-based) */
     columnIndex: number;
   };
   
   /**
    * Complete context passed to table action event handlers
    */
   type TableActionContext = {
     /** Selection context */
     selection: TableSelectionContext;
     /** Current focused row context (if any) */
     focusedRow: TableRowContext | null;
     /** Cell context (null for now, reserved for future cell-level actions) */
     focusedCell: TableCellContext | null;
   };
   ```

2. Add helper function to build context from current table state:
   - `buildActionContext()`: Constructs `TableActionContext` from current state
   - Takes parameters: selectedItems, selectedRowIdMap, focusedIndex, data, idKey

**Expected Output**:
- Type definitions added to `TableNative.tsx`
- JSDoc comments documenting each field
- Helper function to construct context from table state
- No implementation of event handlers yet (just type definitions)

---

### Step 4: Add Action Event Handlers to Table Metadata ✅ COMPLETED
**Goal**: Define the new events in Table's API.

**Tasks**:
1. Update `Table.tsx` metadata events section:
   - Add `selectAll` event
   - Add `cut` event
   - Add `copy` event
   - Add `paste` event
   - Add `delete` event
   - Each event signature receives `TableActionContext`
   - Document each event with examples

2. Update `TableProps` interface in `TableNative.tsx`:
   - Add event handler props (onSelectAll, onCut, onCopy, onPaste, onDelete)
   - Each handler type: `(context: TableActionContext) => void | Promise<void>`

**Expected Output**:
- Complete event metadata
- Updated TypeScript interfaces
- Documentation of event signatures

---

### Step 5: Implement Keyboard Event Handler in Table ✅ COMPLETED
**Goal**: Add keyboard event handling to the Table component.

**Learnings from Table Code Review**:
- Table already has `onKeyDown` handler attached to wrapper div (from `useRowSelection` hook)
- Current `onKeyDown` handles arrow keys and space for row selection
- Table wrapper has `tabIndex={-1}` making it focusable programmatically
- Focus is handled via `autoFocus` prop using `wrapperRef.current.focus()`
- Need to coordinate with existing keyboard handling from `useRowSelection`

**Tasks**:
1. Add `keyBindings` prop to `TableProps` interface in `TableNative.tsx`:
   ```typescript
   keyBindings?: Record<string, string>;
   ```

2. Add default key bindings to `defaultProps` in `TableNative.tsx`:
   ```typescript
   keyBindings: {
     selectAll: "CmdOrCtrl+A",
     cut: "CmdOrCtrl+X",
     copy: "CmdOrCtrl+C",
     paste: "CmdOrCtrl+V",
     delete: "Delete",
   },
   ```

3. Create custom hook `useTableKeyboardActions` in `TableNative.tsx`:
   - Import `parseKeyBinding` and `matchesKeyEvent` from keybinding-parser
   - Merge user-provided `keyBindings` with defaults:
     - For each action (selectAll, cut, copy, paste, delete)
     - If user provided a binding, use it; otherwise use default
     - This allows partial overrides (e.g., only changing "delete" binding)
   - Parse merged `keyBindings` into `ParsedKeyBinding` objects (memoize with useMemo)
   - Detect duplicate key bindings:
     - Build a reverse map of key → actions
     - If same key maps to multiple actions, log a warning: `console.warn("Key binding conflict: 'X' is bound to multiple actions: [action1, action2]. Using: action2")`
     - Use the last action in the list (latest wins)
   - Return handler function that:
     - Checks each key binding against the event
     - Builds `TableActionContext` using helper function
     - Calls appropriate event handler (onSelectAll, onCut, etc.)
     - Prevents default for matched events

4. Integrate with existing keyboard handling:
   - Combine the new keyboard action handler with existing `onKeyDown` from `useRowSelection`
   - Create a composite handler that:
     1. First checks for action shortcuts (selectAll, cut, etc.)
     2. If no match, delegates to existing `onKeyDown` from useRowSelection
     3. This preserves existing arrow key/space navigation

5. Update the wrapper div's `onKeyDown`:
   - Replace current `onKeyDown={onKeyDown}` with the composite handler
   - Ensure both action shortcuts and selection navigation work together

**Expected Output**:
- `useTableKeyboardActions` custom hook implemented
- Default key bindings used for actions not specified in user's `keyBindings` prop
- Duplicate key binding conflicts detected and logged as warnings
- Keyboard events trigger action handlers
- Context properly constructed from table state
- Integration with existing row selection keyboard navigation
- No regression in existing keyboard behavior
- Table still handles focus appropriately

---

### Step 6: Add Unit Tests for Keyboard Handling ✅ COMPLETED
**Goal**: Test keyboard event handling logic.

**Learnings from Table Code Review**:
- Table tests are in `xmlui/tests/` (not tests-e2e)
- Use `.test.ts` extension for unit tests
- Table has existing unit tests in `Table.spec.ts`

**Tasks**:
1. Review existing `Table.spec.ts` structure for patterns

2. Add new test suite section for keyboard actions in `Table.spec.ts`:
   ```typescript
   describe("Keyboard Actions", () => {
     // Test default key bindings applied
     // Test custom key bindings override defaults
     // Test each action event fires correctly
     // Test context object structure
     // Test modifier keys (Ctrl, Shift, etc.)
     // Test platform-specific behavior (CmdOrCtrl)
     // Test that actions respect table focus
     // Test integration with existing keyboard navigation
   });
   ```
Learnings from Table Code Review**:
- E2E tests are in `xmlui/tests-e2e/` directory
- Use `.spec.ts` extension for E2E tests  
- Table has E2E tests showing patterns like `page.keyboard.press()`
- E2E testing conventions document shows how to test keyboard interactions

**Tasks**:
1. Add E2E test file or section in existing Table e2e tests:
   - Import test fixtures (`initTestBed`, `page`)
   - Set up test table with selectable rows and data

2. Key test scenarios:
   ```typescript
   test("Ctrl+A selects all rows", async ({ initTestBed, page }) => {
     // Create table with selectable rows
     // Focus the table
     // Press Ctrl+A (or Cmd+A on Mac)
     // Verify onSelectAll was called
     // Verify all rows are selected
   });
   
   test("Delete key triggers delete action", async ({ initTestBed, page }) => {
     // Create table with selected rows
     // Focus the table
     // Press Delete key
     // Verify onDelete was called with correct context
   });
   
   test("Cut/Copy/Paste trigger respective actions", async ({ initTestBed, page }) => {
     // Test each keyboard shortcut
     // Verify event handlers called
     // Verify context contains selection data
   });
   
   test("Custom key bindings work", async ({ initTestBed, page }) => {
     // Create table with custom keyBindings prop
     // Test the custom shortcuts trigger actions
   });
   
   test("Shortcuts only work when table has focus", async ({ initTestBed, page }) => {
     // Focus something else
     // Press shortcuts
     // Verify actions don't trigger
     // Focus table
     // Press shortcuts
     // Verify actions trigger
   });
   
   test("Shortcuts don't interfere with text selection", async ({ initTestBed, page }) => {
     // Table with userSelectCell="text"
     // Focus inside a cell
     // Press Ctrl+C
     // Verify native copy works, not custom handler
   });
   ```

3. Follow E2E testing conventions:
   - Use `initTestBed` fixture for test setup
   - Use Playwright keyboard API for interactions
   - Verify event handlers called with correct data
   - Test accessibility (focus management)
   - Test on different platforms if possible

**Expected Output**:
- E2E tests for all keyboard shortcuts
- All tests passing
- Coverage of focus and context scenarios
- Tests verify integration with browser keyboard events
- No interference with existing functionality
   const mockOnCut = jest.fn();
   // etc.
   ```

**Expected Output**:
- Comprehensive unit tests in `Table.spec.ts`
- All tests passing
- Good coverage of keyboard handling logic
- No regression in existing tests
- Clear test descriptions

---

### Step 7: Add E2E Tests for Keyboard Shortcuts
**Goal**: Test keyboard shortcuts in real browser environment.

**Tasks**:
1. Create/update `Table.spec.ts` in `tests-e2e/`:
   - Test Ctrl+A (selectAll) with selectable rows
   - Test Delete key (delete) with selected rows
   - Test Cut/Copy/Paste with selected rows
   - Test custom key bindings work
   - Test events receive correct context data
   - Test shortcuts only work when Table has focus
   - Test shortcuts don't interfere with text selection in cells

2. Follow e2e testing conventions from `conv-e2e-testing.md`:
   - Use `initTestBed` fixture
   - Test with keyboard interactions
   - Verify event handlers called with correct data
   - Test accessibility

**Expected Output**:
- E2E tests for all keyboard shortcuts
- All tests passing
- Coverage of focus and context scenarios

---

### Step 8: Run Full Table E2E Test Suite
**Goal**: Ensure no regressions in existing Table functionality.

**Tasks**:
1. Run all existing Table e2e tests
2. Fix any issues or regressions
3. Verify all tests pass

**Expected Output**:
- All existing Table tests still passing
- No regressions introduced

---

### Step 9: Add Documentation Example
**Goal**: Provide clear usage examples in component documentation.

**Tasks**:
1. Update Table metadata with practical examples:
   - Example showing default keyboard shortcuts
   - Example with custom key bindings
   - Example event handlers logging context
   - Example handling cut/copy/paste with clipboard API
   - Example handling delete to remove rows

**Expected Output**:
- Clear, working examples in metadata
- Examples demonstrate real-world usage

---

### Step 10: Linting and Final Validation
**Goal**: Ensure code quality and consistency.

**Tasks**:
1. Run linter on all modified files
2. Fix any linting issues
3. Review code for consistency with XMLUI conventions
4. Ensure TypeScript types are correct
5. Ensure no console warnings in tests

**Expected Output**:
- All files pass linting
- Code follows XMLUI conventions
- No TypeScript errors
- Clean test output

---

## Summary of Deliverables

1. ✅ Reusable `keyBinding.ts` utility with tests
2. ✅ Table component with `keyBindings` property
3. ✅ Five new action events: selectAll, cut, copy, paste, delete
4. ✅ Proper event context with selection, row, and cell data
5. ✅ Unit tests for keyboard handling
6. ✅ E2E tests for keyboard shortcuts
7. ✅ Full Table test suite passing
8. ✅ Documentation with examples
9. ✅ Linted, validated code

## Architecture Notes

### Component Structure
- **Table.tsx**: Metadata and renderer (add event definitions)
- **TableNative.tsx**: React implementation (add keyboard handling logic)
- **keyBinding.ts**: Utility (new file, reusable across components)

### Key Design Decisions
- Use browser's native KeyboardEvent API for matching
- Parse key strings once, cache parsed bindings
- Context object includes all relevant Table state
- Shortcuts only active when Table has focus
- Platform-specific handling (Cmd on Mac, Ctrl elsewhere)
- Event handlers are async-capable

### Integration Points
- Works with existing row selection (`rowsSelectable` prop)
- Works with existing Table API methods (`getSelectedIds`, etc.)
- Respects disabled rows and unselectable rows
- Compatible with pagination and virtualization
