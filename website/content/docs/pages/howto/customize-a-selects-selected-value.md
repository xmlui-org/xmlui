# Customize a Select's selected value

A `Select` whose selected label is long enough to wrap looks off: every
wrapped line renders **centered**, not left-aligned — and that's true with
no customization at all. Fixing it takes a `valueTemplate`, and the fix
needs two props, not one: an explicit width so the label's box fills the
trigger, and an explicit `textAlign` so the browser's own button default
doesn't win.

## The problem: a wrapped label centers by default

`Select`'s trigger renders as a real `<button>` element (Radix UI's
`SelectPrimitive.Trigger`, which xmlui's non-searchable, single-select
`Select` renders through). Browsers apply `text-align: center` to `<button>`
by default, and nothing in xmlui's Select styling overrides it — so any
text that wraps inside the trigger inherits that centering. You don't need
a `valueTemplate` to see it:

```xmlui-pg copy display name="The default: a long label wraps and centers" height="320px"
---app display
<App>
  <VStack width="260px" gap="$space-2" padding="$space-3" borderWidth="1px" borderColor="$color-surface-300">
    <Text variant="strong">No customization — still centers</Text>
    <Select width="100%" label="Priority" initialValue="escalate">
      <Option value="normal" label="Normal priority" />
      <Option value="escalate" label="Escalate to the payments team's on-call engineer for urgent review" />
    </Select>
  </VStack>
</App>
```

The label wraps onto three lines, and each one is centered in the trigger —
fine for a short, badge-like value, but odd for a sentence-like label.

## The fix: valueTemplate with a full-width, left-aligned Text

There's no theme variable for the selected value's text alignment — the
`Select` variable families cover color and size, not alignment — so
`valueTemplate` is the mechanism here, not a workaround. It takes two props
on the `Text` inside it:

- **`width="100%"`** so the box spans the trigger instead of shrinking to
  its own content.
- **`textAlign="start"`** so the browser's centered button default doesn't
  win.

Both matter, and it's easy to stop after the first one: set only the width
and the box does fill the trigger, but the wrapped lines are *still*
centered, because a `<button>`'s inherited `text-align: center` applies to
anything inside it that doesn't set its own — a full-width box included.

```xmlui-pg copy display name="A valueTemplate with width and textAlign" height="320px"
---app display
<App>
  <VStack width="260px" gap="$space-2" padding="$space-3" borderWidth="1px" borderColor="$color-surface-300">
    <Text variant="strong">width="100%" + textAlign="start"</Text>
    <Select width="100%" label="Priority" initialValue="escalate">
      <property name="valueTemplate">
        <Text testId="full-value" width="100%" textAlign="start" value="{$item.label}" />
      </property>
      <Option value="normal" label="Normal priority" />
      <Option value="escalate" label="Escalate to the payments team's on-call engineer for urgent review" />
    </Select>
  </VStack>
</App>
```

The same long label is selected here as in the first playground, and it now
wraps flush against the trigger's left edge instead of centering. Compare the
two triggers directly — same option, same width, one prop pair apart.

## `$item` and `$itemContext` inside the template

`valueTemplate` renders once per selected value (once in single-select mode,
once per chip in multi-select mode). Inside it:

- **`$item.label`** and **`$item.value`** give you the selected option's
  label and value, exactly as declared on its `<Option>`.
- **`$itemContext.removeItem()`** removes that value from the current
  selection — the hook a multi-select badge's close button calls. It's a
  no-op to reach for in single-select mode, where there's nothing to remove
  from; it matters once `multiSelect` is `true` and you're rendering your
  own chip instead of the built-in badge. See the [Select reference's
  `valueTemplate` example](/docs/reference/components/Select#valuetemplate)
  for the multi-select badge-with-remove-button recipe this pairs with.

## When to reach for a template instead of a theme variable

Theme variables and `valueTemplate` solve different problems, and reaching
for the wrong one costs a detour:

- **Theme variables** (`textColor-Select`, `fontSize-Select`,
  `backgroundColor-Select`, and friends) recolor or resize the *existing*
  value display without changing what it renders. Use them for anything the
  variable set already covers — see [Customize Select and AutoComplete
  menus](/docs/howto/customize-select-and-autocomplete-menus) for the full
  menu/item/badge variable list.
- **`valueTemplate`** replaces *what* renders, not just how it looks. Reach
  for it when the change is structural: an icon beside the label, a
  multi-line layout, a custom remove control, or — this how-to's case —
  correcting how a wrapped label fills and aligns inside the trigger. If a
  theme variable can't express the change, a template is the escape hatch,
  and it hands you the full markup budget of any other xmlui content.

## Key points

**A wrapped selected value centers by default, template or not.** The
trigger is a real `<button>`, and the browser's own `text-align: center`
for buttons is never overridden by xmlui's Select styling.

**The fix needs both `width="100%"` and `textAlign="start"` on the
template's `Text`.** The width makes the box fill the trigger instead of
shrinking to its content; the alignment overrides the inherited centering.
Either one alone leaves the label still off: no width and it doesn't even
reliably wrap at the trigger's width; width with no alignment override and
it wraps centered.

**`$item.label` / `$item.value`** read the selected option; **`$itemContext.removeItem()`**
removes it from the selection, relevant once `multiSelect` is `true`.

**Theme variables restyle; `valueTemplate` restructures.** Start with theme
variables for color and size. Move to a template only when the change is
structural — layout, composition, or (as here) how wrapped text aligns.

---

## See also

- [Select component reference](/docs/reference/components/Select#valuetemplate) — full `valueTemplate` API, including the multi-select remove-button recipe
- [Customize Select and AutoComplete menus](/docs/howto/customize-select-and-autocomplete-menus) — theme variables for the dropdown menu, items, and badges
- [Wrap long text in a Link](/docs/howto/wrap-long-text-in-a-link) — the same width-and-wrapping mechanics applied to `Link` text
