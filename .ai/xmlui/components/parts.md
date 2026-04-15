# Component Parts Pattern

Parts allow individual sub-elements of a component to be targeted by theme variables and by test selectors.

## When to Use

Use parts when:
- The component has multiple visual sub-elements with distinct styling needs (e.g., label + input + adornments)
- Tests need stable selectors for individual elements
- The component supports layout overrides on a sub-element (use `defaultPart` to specify which)

Skip parts for simple single-element components.

## Standard Part Constants

Import from `components-core/parts`:

```typescript
import {
  partClassName,
  PART_LABEL,
  PART_INPUT,
  PART_START_ADORNMENT,
  PART_END_ADORNMENT,
} from "../../components-core/parts";
```

## Metadata Declaration

```typescript
parts: {
  label: { description: "The label element." },
  input: { description: "The main input area." },
  startAdornment: { description: "Decorative element at the start." },
  endAdornment: { description: "Decorative element at the end." },
},
defaultPart: "input",
```

## Native Component Implementation

Apply `partClassName()` to mark DOM elements as parts:

```typescript
export const ComponentNameNative = forwardRef(function ComponentNameNative(props, ref) {
  return (
    <div className={styles.container}>
      {label && (
        <span className={classnames(partClassName(PART_LABEL), styles.label)}>
          {label}
        </span>
      )}

      <input
        ref={ref}
        className={classnames(partClassName(PART_INPUT), styles.input)}
        {...inputProps}
      />

      {startAdornment && (
        <div className={classnames(partClassName(PART_START_ADORNMENT), styles.adornment)}>
          {startAdornment}
        </div>
      )}

      {endAdornment && (
        <div className={classnames(partClassName(PART_END_ADORNMENT), styles.adornment)}>
          {endAdornment}
        </div>
      )}
    </div>
  );
});
```

## Using Parts in E2E Tests

```typescript
// Select by part ID
const input = page.getByTestId("test").locator("[data-part-id='input']");

// When the part wraps the testId element (part is the parent), select without testId scope:
const label = page.locator("[data-part-id='label']");

// Use .first() when multiple instances appear on the page
const firstInput = page.locator("[data-part-id='input']").first();
```

The part selector string matches the key declared in `parts: { ... }` in metadata.
