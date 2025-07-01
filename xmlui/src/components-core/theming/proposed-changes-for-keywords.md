# Proposal Document

This is a proposal document to handle temporary states (`focus`, `disabled`, etc.) appearing with the keywords `checked` and `indicator` in the theme variable format.

## The Problem

The `RadioGroupOption` needs both the `checked` and `indicator` keywords placed before the component name in the theme variable format, as well as requires a `disabled` state attached to the end of the variable in certain situations. The current system does not permit this.

So this works:

```ts
[`backgroundColor-checked-${RGOption}`]: `$textColor--disabled`
```

This does not:

```ts
[`backgroundColor-checked-${RGOption}--disabled`]: `$textColor--disabled`
```

Using the same logic, this works:

```ts
[`backgroundColor-checked-indicator-${RGOption}`]: `transparent`,
```

This doesn't:

```ts
[`backgroundColor-checked-indicator-${RGOption}--disabled`]: `transparent`,
```

## Current Version & Intermittent Solution

This is how the `Checkbox` and the `Switch` use `checked`, `indicator` and `disabled`:

```ts
[`backgroundColor-checked-${COMP}-success`]: `$borderColor-${COMP}-success`,
[`backgroundColor-indicator-${COMP}`]: "$backgroundColor-primary",
[`borderColor-checked-${COMP}`]: "$color-primary-500",
[`backgroundColor-checked-${COMP}`]: "$color-primary-500",
[`backgroundColor-${COMP}--disabled`]: "$color-surface-200"
```

Notice that the keywords in question don't appear the same time as the `disabled` state indicator.

However, the `RadioGroupOption` component needs certain state to be themeable, where both keywords and the `disabled` state needs to be used at the same time.

Currently, this is done via a stop-gap solution by flipping the necessary keyword locations:

```ts
[`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
[`backgroundColor-${RGOption}-checked--disabled`]: `$textColor--disabled`,
[`backgroundColor-checked-indicator-${RGOption}`]: `transparent`,
[`backgroundColor-${RGOption}-checked-indicator--disabled`]: `transparent`,
```

## Proposal

The proposal entails moving the keywords after the component name and let them appear after each other:

```ts
[`backgroundColor-checked-${RGOption}`]: "$color-primary-500",
[`backgroundColor-checked-${RGOption}--disabled`]: `$textColor--disabled`,
[`backgroundColor-checked-indicator-${RGOption}`]: `transparent`,
[`backgroundColor-checked-indicator-${RGOption}--disabled`]: `transparent`,
```
