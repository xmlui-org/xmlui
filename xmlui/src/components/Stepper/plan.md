# Stepper Component — Implementation Plan

> **Status**: Approved — ready for implementation  
> **References**: [Mantine Stepper](https://mantine.dev/core/stepper/), [Ark UI Steps](https://ark-ui.com/docs/components/steps)

---

## 1. Overview

A `Stepper` component guides users through a sequential multi-step process. It shows a visual progress indicator (numbered circles connected by lines/separators) and displays the content panel for the currently active step.

**XMLUI markup example:**

```xml
<Stepper id="wizard" activeStep="{0}" onStepChange="onWizardStepChange">
  <Step label="Account" description="Create your account">
    <!-- Step 1 content -->
  </Step>
  <Step label="Profile" description="Complete your profile">
    <!-- Step 2 content -->
  </Step>
  <Step label="Done" description="Review and submit">
    <!-- Step 3 content -->
  </Step>
</Stepper>

<HStack>
  <Button enabled="{wizard.hasPrevStep}" onClick="wizard.prev()">Back</Button>
  <Button enabled="{wizard.hasNextStep}" onClick="wizard.next()">Next</Button>
  <Button visible="{wizard.isCompleted}" onClick="submitForm">Submit</Button>
</HStack>
```

---

## 2. File structure

```
xmlui/src/components/Stepper/
├── Stepper.tsx            # Metadata + renderer for Stepper
├── StepperNative.tsx      # React implementation for Stepper
├── Stepper.module.scss    # Styles and theme variables
├── Step.tsx               # Metadata + renderer for Step
├── StepNative.tsx         # React implementation for Step
└── StepperContext.tsx     # Shared React context for parent–child communication
```

No `index.ts`. Both `Stepper` and `Step` are registered in `ComponentProvider.tsx`.

---

## 3. Component API design

### 3.1 `Stepper` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `activeStep` | `number` | `0` | 0-based index of the currently active step. Can be bound two-way via `state`. |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction of the step indicator strip. |
| `allowNextStepsSelect` | `boolean` | `true` | When `false`, clicking on a future (not yet reached) step is disabled. This is a global switch; per-step control is available via the `Step.allowStepSelect` prop. |
| `linear` | `boolean` | `false` | When `true`, users must complete steps in order; forward navigation is blocked until the current step is valid. |
| `completed` | `boolean` | — | Explicitly marks the stepper as completed. When not set, falls back to `activeStep === stepCount`. Useful when completion is determined by external/server-side logic. |
| `iconPosition` | `"left" \| "right"` | `"left"` | Side the step icon appears relative to the step label/description body. Horizontal orientation only. |

**Controlled vs. uncontrolled:** `activeStep` follows the same hybrid pattern as other XMLUI inputs — if the prop is bound, the component is controlled; otherwise it manages state internally and exposes `state.activeStep` for markup bindings.

### 3.2 `Stepper` events

| Event | Signature | Description |
|---|---|---|
| `onStepChange` | `(index: number) => void` | Fires when the active step changes (user click or programmatic). |
| `onComplete` | `() => void` | Fires when the user navigates past the last step (i.e., becomes fully completed). |

### 3.3 `Stepper` component APIs (imperative)

| Method | Signature | Description |
|---|---|---|
| `next` | `(): void` | Advance to the next step. No-op if already on the last step or if `linear` is true and the current step is invalid. |
| `prev` | `(): void` | Go back to the previous step. No-op if already on the first step. |
| `goToStep` | `(index: number): void` | Jump to an arbitrary step index. Respects `allowNextStepsSelect` and `linear` constraints. |
| `reset` | `(): void` | Return to step 0 and clear the highest-visited state. |

### 3.4 `Stepper` context variables (exposed to children & binding in markup)

| Variable | Type | Description |
|---|---|---|
| `activeStep` | `number` | Current 0-based step index (same as `state.activeStep`). |
| `hasPrevStep` | `boolean` | Whether `prev()` would do anything. |
| `hasNextStep` | `boolean` | Whether `next()` would do anything. |
| `isCompleted` | `boolean` | `true` when the `completed` prop is set, otherwise falls back to `activeStep === stepCount`. |
| `stepCount` | `number` | Total number of `Step` children. |
| `percent` | `number` | Progress as a 0–100 value (`activeStep / stepCount * 100`). |

These are surfaced via `updateState` so markup can reference `wizard.activeStep`, `wizard.isCompleted`, etc.

---

### 3.5 `Step` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Short title shown next to the step indicator. |
| `description` | `string` | — | Subtitle/secondary text shown below the label. |
| `icon` | `string` | — | XMLUI icon name to show inside the step indicator when the step is active or incomplete. Defaults to the 1-based step number. |
| `completedIcon` | `string` | `"check"` | Icon shown inside the indicator when the step is completed. |
| `loading` | `boolean` | `false` | Replaces the step icon with a spinner to indicate async work in progress. |
| `allowSkip` | `boolean` | `false` | Allows this step to be skipped when `linear` mode is on. |
| `allowStepSelect` | `boolean` | `true` | Per-step override for whether the user can click this step's indicator to navigate to it. Takes precedence over the parent `allowNextStepsSelect` for this specific step. |
| `headerTemplate` | (template) | — | Slot for fully custom step header content. Receives `$step` context (see below). |

### 3.6 `Step` context variables

| Variable | Description |
|---|---|
| `$step.index` | 0-based index of this step. |
| `$step.label` | The step's label. |
| `$step.isActive` | Whether this is the currently active step. |
| `$step.isCompleted` | Whether this step's index is less than `activeStep`. |
| `$step.isFirst` | `index === 0` |
| `$step.isLast` | `index === stepCount - 1` |

### 3.7 `Step` events

| Event | Signature | Description |
|---|---|---|
| `onActivate` | `(): void` | Fires when this step becomes the active step. |

---

## 4. Parent–child registration pattern

Follows the same approach as `Tabs`/`TabItem`:

1. `Stepper` creates a `StepperContext` and provides it to children.
2. Each `Step` registers itself (index, label, description, loading, etc.) via `useEffect` on mount and unregisters on unmount.
3. `Stepper` reads the registered list to render the step indicator strip.
4. `Step` reads from context to know whether to show its content panel (active step).

---

## 5. Visual anatomy

```
[indicator]─────[indicator]─────[indicator]
    ↓                 ↓               ↓
 step body        step body       step body
(label+desc)    (label+desc)   (label+desc)

        ┌─────────────────────────┐
        │  Active step content    │
        └─────────────────────────┘
```

**Horizontal orientation**: indicators are in a row at the top, separator lines connect them, content panel is below.

**Vertical orientation**: indicators in a column on the left, vertical connectors between them, content panel to the right of the active indicator.

Step indicator states: `incomplete` (default, numbered), `active` (highlighted ring), `completed` (checkmark / custom icon), `loading` (spinner).

---

## 6. Theme variables (proposed)

Grouped under the `Stepper` and `Step` namespaces:

| Variable | Description |
|---|---|
| `size-indicator-Stepper` | Width/height of the step indicator circle |
| `borderWidth-indicator-Stepper` | Border thickness of the indicator ring |
| `color-indicator-active-Stepper` | Fill color of the active indicator |
| `color-indicator-completed-Stepper` | Fill color of completed indicators |
| `color-indicator-incomplete-Stepper` | Fill/border color of incomplete indicators |
| `color-separator-Stepper` | Color of the connector line between indicators |
| `color-separator-completed-Stepper` | Color of a completed connector line |
| `thickness-separator-Stepper` | Thickness of the connector line |
| `fontSize-label-Stepper` | Font size for step labels |
| `fontSize-description-Stepper` | Font size for step descriptions |
| `color-label-active-Stepper` | Label color when step is active |
| `color-label-completed-Stepper` | Label color when step is completed |
| `color-label-incomplete-Stepper` | Label color when step is incomplete |
| `gap-Stepper` | Spacing between the indicator strip and the content panel |

---

## 7. What was borrowed from each reference

### From Mantine Stepper
- `orientation` (`horizontal` / `vertical`)
- `iconPosition` (`left` / `right`)
- `allowNextStepsSelect` on the parent — global switch to prevent jumping forward
- Per-step `loading` state (spinner replaces icon)
- Per-step `completedIcon` override
- Per-step `icon` override (custom icon for incomplete/active state)
- `label` + `description` per step

### From Ark UI Steps
- `linear` mode — blocks forward navigation until the current step passes validation
- `allowSkip` per step — even in linear mode some steps may be bypassed
- `onComplete` event — fires when all steps are completed
- `percent` context variable (useful for progress bar binding)
- `goToStep(index)`, `reset()` imperative APIs
- `hasPrevStep` / `hasNextStep` state variables

### XMLUI-specific adaptations
- **No `Stepper.Completed` slot** — XMLUI handles this naturally with `visible="{wizard.isCompleted}"` on arbitrary content, so no dedicated compound child needed.
- **No built-in navigation buttons** — XMLUI convention for wizards is to put `Button` components outside Stepper in the markup and wire them to `wizard.next()` / `wizard.prev()` APIs. This keeps layout flexible.
- **Custom icons via icon name strings** — XMLUI uses named icon strings (e.g. `icon="check"`) rather than React nodes. For advanced custom headers, `headerTemplate` slot is provided.
- **`allowSkip` per step** instead of a callback — easier to express declaratively in XML markup.
- **Step content animation** — uses the standard XMLUI `Animation` behavior attached to the content panel, rather than a built-in transition. This keeps the component consistent with the rest of the framework.
- **`completed` prop** — explicit boolean to override the default completion heuristic (`activeStep === stepCount`), for cases where the server or a form determines whether the flow is truly done.
- **Per-step `allowStepSelect`** — both the global `allowNextStepsSelect` on `Stepper` and the per-step `allowStepSelect` on `Step` are supported; per-step takes precedence.

---

## 8. Out of scope (not planned)

- Built-in navigation buttons (use markup + API calls)
- Step validation callback (`isStepValid`) — can be handled by raising `onStepChange` and calling `goToStep` conditionally in markup scripts
- Step-level color override — would complicate the theme variable model; if needed later, can be added as a `Step` prop

---

## 9. Implementation sequence

Each step ends with a type-check verification command. Run all commands from the workspace root (`/Users/dotneteer/source/xmlui`) unless noted otherwise.

---

### Step 1 — StepperContext

**Goal**: Establish the shared context that `Stepper` provides and `Step` consumes. No visual output yet.

**Files to create:**
- `xmlui/src/components/Stepper/StepperContext.tsx`

**What to implement:**
- `StepItem` type: `{ innerId: string; index: number; label?: string; description?: string; loading?: boolean; allowSkip?: boolean; allowStepSelect?: boolean; onActivate?: () => void }`
- `IStepperContext` interface: `{ register, unregister, activeStep, stepCount, orientation, allowNextStepsSelect, linear }`
- Export `StepperContext` (created with `createContext` and a no-op default)
- Export `useStepperContext()` hook
- Export `useStepperContextValue(...)` factory hook (called by `StepperNative`) — returns the context value object

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 2 — Step shell (native + metadata + renderer)

**Goal**: A minimal but compiling `Step` component that registers itself in `StepperContext` and renders nothing more than a placeholder content area.

**Files to create:**
- `xmlui/src/components/Stepper/StepNative.tsx`
- `xmlui/src/components/Stepper/Step.tsx`

**`StepNative.tsx`:**
- Export `defaultProps`: `{ completedIcon: "check", loading: false, allowSkip: false, allowStepSelect: true }`
- `forwardRef` component; accepts `label`, `description`, `icon`, `completedIcon`, `loading`, `allowSkip`, `allowStepSelect`, `onActivate`, `children`, plus XMLUI infrastructure props
- On mount: call `context.register(...)` with its data (use `useId()` for `innerId`)
- On unmount: call `context.unregister(innerId)`
- Render children only when `activeStep === ownIndex` (read from context)

**`Step.tsx`:**
- `const COMP = "Step"`
- Full `createMetadata` with all props from §3.5, event `onActivate`, context vars from §3.6
- `docFolder: "Stepper"` so docs are grouped
- `nonVisual: false` (it has a content area though it defers visual indicator rendering to the parent)
- `createComponentRenderer` that maps props and passes `renderChild(node.children)`
- Export `stepComponentRenderer`

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 3 — Stepper SCSS module

**Goal**: Declare all theme variables before the Stepper metadata references them.

**Files to create:**
- `xmlui/src/components/Stepper/Stepper.module.scss`

**What to declare** (using `createThemeVar` boilerplate from `.ai/xmlui/components/styling.md`):

| SCSS variable | Theme variable name |
|---|---|
| indicator size | `size-indicator-Stepper` |
| indicator border width | `borderWidth-indicator-Stepper` |
| active indicator color | `color-indicator-active-Stepper` |
| completed indicator color | `color-indicator-completed-Stepper` |
| incomplete indicator color | `color-indicator-incomplete-Stepper` |
| separator color | `color-separator-Stepper` |
| completed separator color | `color-separator-completed-Stepper` |
| separator thickness | `thickness-separator-Stepper` |
| label font size | `fontSize-label-Stepper` |
| description font size | `fontSize-description-Stepper` |
| active label color | `color-label-active-Stepper` |
| completed label color | `color-label-completed-Stepper` |
| incomplete label color | `color-label-incomplete-Stepper` |
| indicator-strip to content gap | `gap-Stepper` |

**CSS rules**: stub classes for `.root`, `.steps`, `.step`, `.indicator`, `.separator`, `.stepBody`, `.stepLabel`, `.stepDescription`, `.content` (no real styling yet — just ensure the file compiles).

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 4 — Stepper shell (native + metadata + renderer + registration)

**Goal**: A compiling `Stepper` that provides context, renders an empty indicator strip, and can be exercised in the playground.

**Files to create:**
- `xmlui/src/components/Stepper/StepperNative.tsx`
- `xmlui/src/components/Stepper/Stepper.tsx`

**Files to modify:**
- `xmlui/src/components/ComponentProvider.tsx` — register both renderers

**`StepperNative.tsx`:**
- Export `defaultProps`: `{ activeStep: 0, orientation: "horizontal", allowNextStepsSelect: true, linear: false, iconPosition: "left" }`
- `forwardRef` component
- Uses `useStepperContextValue(...)` and wraps children in `<StepperContext.Provider value={...}>`
- Renders `<div>` with a `.steps` strip (empty for now) + a `.content` area (`{children}`)
- Accepts all props from §3.1, plus `completed`, plus XMLUI infra props (`updateState`, `registerComponentApi`, `onStepChange`, `onComplete`, `style`, `className`, `classes`)
- Implements `next()`, `prev()`, `goToStep()`, `reset()` via `registerComponentApi`
- Publishes state via `updateState`: `{ activeStep, hasPrevStep, hasNextStep, isCompleted, stepCount, percent }`

**`Stepper.tsx`:**
- `const COMP = "Stepper"`
- Full `createMetadata`: all props from §3.1 + `completed`, events from §3.2, APIs from §3.3, context vars from §3.4
- `themeVars: parseScssVar(styles.themeVars)` + all `defaultThemeVars`
- `createComponentRenderer`; pass `state`, `updateState`, `registerComponentApi`, `renderChild`, and all mapped props/events
- Export `stepperComponentRenderer`

**`ComponentProvider.tsx`:**
```typescript
import { stepperComponentRenderer } from "./Stepper/Stepper";
import { stepComponentRenderer } from "./Stepper/Step";
// ...
this.registerCoreComponent(stepperComponentRenderer);
this.registerCoreComponent(stepComponentRenderer);
```

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 5 — Complete Step visual implementation

**Goal**: Each `Step` fully renders its content area; the indicator (circle + label + description) is rendered by `Stepper` later, but Step handles all its own state logic.

**Files to modify:**
- `xmlui/src/components/Stepper/StepNative.tsx`
- `xmlui/src/components/Stepper/Step.tsx`

**What to complete in `StepNative.tsx`:**
- Add `$step` context variable derivation (`isActive`, `isCompleted`, `isFirst`, `isLast`) and pass to `headerTemplate` renderer
- Render content area with `display: none` when not active (or unmount — decide based on whether `keepMounted` analogue is needed)
- Fire `onActivate` event when `isActive` transitions from `false` → `true`
- Expose `allowStepSelect` prop so parent indicator can disable the button

**What to complete in `Step.tsx`:**
- Wire `headerTemplate` slot via `MemoizedItem` + `$step` context vars
- Map `allowStepSelect`, `loading`, `allowSkip` through the renderer

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 6 — Complete Stepper visual implementation

**Goal**: `Stepper` renders the full visual indicator strip with all states, separators, navigation logic, and theme-variable styling.

**Files to modify:**
- `xmlui/src/components/Stepper/StepperNative.tsx`
- `xmlui/src/components/Stepper/Stepper.module.scss`

**What to implement in `StepperNative.tsx`:**
- Iterate registered `StepItem[]` from `useStepperContextValue` to render indicator buttons
- Each indicator button: step number (or `icon`), completed state (check / `completedIcon`), `loading` spinner via `<Spinner>`, separator line after each (except last)
- Apply `data-state="active|completed|incomplete"` attributes for CSS targeting and test selectors
- `allowNextStepsSelect` + per-step `allowStepSelect` logic: disable indicator button when `!allowNextStepsSelect && stepIndex > activeStep` unless the step's own `allowStepSelect` overrides
- `linear` mode: `next()` is a no-op when `activeStep`'s step has `allowSkip=false` AND (future condition — left as a hook for future validation)
- `completed` prop: `isCompleted = completed ?? (activeStep >= stepCount)`; fire `onComplete` when `isCompleted` becomes `true`
- `orientation="vertical"`: flex direction column, step indicator on left, vertical separators
- `iconPosition="right"`: reverse icon/body order in each step header
- `highestStepVisited` ref — track the furthest visited step (needed for `allowNextStepsSelect` logic to allow going back to visited steps even when the flag is false)
- Parts: apply `partClassName` for `indicator`, `separator`, `stepBody`, `stepLabel`, `stepDescription`, `content`

**What to complete in `Stepper.module.scss`:**
- Full CSS rules for all states (active, completed, incomplete), orientations, icon positions, separator directions
- Use theme variables for all colours, sizes, and spacing

**Verify:**
```bash
npx tsc --noEmit -p xmlui/tsconfig.json
```

---

### Step 7 — E2E tests: navigation and step states

**Goal**: Core functionality tests — navigation APIs, step state transitions, prop-driven behaviour.

**File to create:**
- `xmlui/src/components/Stepper/Stepper.spec.ts`

**Test groups to cover (`test.describe`):**

#### Basic Functionality
- Renders steps and shows first step content by default
- Next/prev buttons advance and retreat active step
- `next()` is a no-op on the last step; `prev()` is a no-op on the first step
- `goToStep(n)` jumps directly to step `n`
- `reset()` returns to step 0
- `onStepChange` event fires with correct index
- `onComplete` event fires when the last step is passed
- `hasPrevStep` / `hasNextStep` / `isCompleted` / `percent` state variables are correct at each step
- `activeStep` prop (controlled mode) externally sets the active step
- `completed` prop overrides `isCompleted` even when `activeStep < stepCount`

#### `allowNextStepsSelect` and `allowStepSelect`
- Future step indicator buttons are disabled when `allowNextStepsSelect="false"`
- Per-step `allowStepSelect="false"` disables that indicator regardless of global setting
- Per-step `allowStepSelect="true"` re-enables an indicator even when parent sets `allowNextStepsSelect="false"`
- Clicking an enabled indicator navigates to that step

#### `linear` mode
- `next()` is blocked on a non-skippable step (stub — full validation left for future)
- Steps with `allowSkip="true"` can be bypassed

#### Step events
- `onActivate` fires on a `Step` when it becomes active

**Run after implementing:**
```bash
npx playwright test Stepper.spec.ts --reporter=line
```

---

### Step 8 — E2E tests: appearance, accessibility, theme variables, and behaviors

**Goal**: Visual, keyboard, ARIA, and theme-variable coverage.

**File to modify:**
- `xmlui/src/components/Stepper/Stepper.spec.ts`

**Test groups to add:**

#### Orientation and icon position
- Horizontal layout: step indicators are in a row (check `flex-direction`)
- Vertical layout: step indicators are in a column
- `iconPosition="right"` places icon on the right side of the label body

#### `loading` and `completedIcon`
- Step with `loading="true"` shows a spinner in place of the icon
- Default completed indicator shows check icon
- Per-step `completedIcon` overrides the default for completed steps

#### `headerTemplate` slot
- Custom header template renders and receives `$step` context vars (`index`, `label`, `isActive`, `isCompleted`)

#### Accessibility
- Step indicator buttons have accessible names (`aria-label` derived from `label`/`description`)
- Completed steps have `aria-current` or equivalent
- Keyboard: `Tab` moves focus between clickable indicators; `Enter`/`Space` activates the focused step; non-clickable steps are skipped in tab order

#### Theme Variables
- At least 3 theme variable tests: indicator active color, separator color, indicator size
- Use exact `rgb(...)` values per e2e conventions

#### Behaviors and Parts
- `animation` behavior: attaches to step content (`animation="fadeIn"`)
- `tooltip` behavior: tooltip on a `Stepper` appears on hover
- `variant` behavior: applies custom theme variant styling

**Run after implementing:**
```bash
npx playwright test Stepper.spec.ts --reporter=line
# Stability check with parallelism:
npx playwright test Stepper.spec.ts --workers=10
```

---

### Step 9 — Changeset

**Goal**: Record the addition for the release notes.

**File to create:**
- `.changeset/add-stepper-component.md`

```markdown
---
"xmlui": patch
---

Add `Stepper` and `Step` components for guided multi-step workflows.
```

**Verify:**
```bash
npx changeset status
```

---

## 10. Resolved decisions

| # | Decision |
|---|---|
| 1 | Both `allowNextStepsSelect` on `Stepper` (global) and `allowStepSelect` on `Step` (per-step override) are supported. Per-step takes precedence. |
| 2 | Keep `allowNextStepsSelect`; also keep `linear` as they serve different concerns (`allowNextStepsSelect` controls UI clickability, `linear` blocks programmatic forward navigation until a step is valid). |
| 3 | `activeStep` is **0-based**, matching `Tabs.activeTab`. |
| 4 | Add an explicit `completed` boolean prop on `Stepper`. When not set, falls back to `activeStep === stepCount`. |
| 5 | Step content transition uses the standard XMLUI **`Animation` behavior** — no built-in animation baked into the component. |
