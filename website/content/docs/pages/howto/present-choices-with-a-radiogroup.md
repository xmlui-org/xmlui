# Present a short list of choices with a RadioGroup

Use a `RadioGroup` when a field has a small, fixed set of options worth showing inline — a visible alternative to a `Select` dropdown. Because `RadioGroup` owns the selected value and exposes the same `initialValue`, `onDidChange`, and `setValue` surface as other inputs, **swapping a dropdown for radio buttons is a tag substitution** — no new script or styling.

```xmlui-pg copy display name="A RadioGroup instead of a dropdown" height="320px"
<App var.plan="pro">
  <RadioGroup id="planRadio" initialValue="pro" orientation="horizontal"
    onDidChange="(val) => plan = val">
    <Option label="Free" value="free" />
    <Option label="Pro" value="pro" />
    <Option label="Team" value="team" />
  </RadioGroup>
  <Text>Selected plan: <Text variant="strong">{plan}</Text></Text>
  <Button label="Reset to Pro" onClick="planRadio.setValue('pro')" />
</App>
```

## Key points

**Options are `<Option label value>` children.** The `RadioGroup` governs the group and stores the selected `value`; each `Option` supplies a `label` (shown) and a `value` (reported). This is the same option shape a `Select` uses, which is what makes the swap mechanical.

**`initialValue` preselects; `onDidChange` reports changes.** `initialValue` sets the checked option at mount, and `onDidChange="(val) => …"` fires with the new `value` whenever the user picks a different option — identical to how you'd wire a `Select`.

**`setValue(value)` changes the selection from code.** Give the group an `id` and call `id.setValue('pro')` — as the "Reset to Pro" button does. `initialValue` only seeds the mount, so use `setValue` (not a rebind of `initialValue`) to move the selection programmatically.

**`orientation` lays the group out.** The default is `vertical` (one option per line); `orientation="horizontal"` puts them in a row. Horizontal radios are inputs in a row, so the same explicit-width guidance as other horizontal inputs applies — see [Set the Width of an Input Field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout).

**`enabled="false"`** disables the whole group.

**When to prefer a `Select` instead:** long option lists. Radio buttons show every option at once, which is an advantage for three or four choices and a liability for twenty — reach for a `Select` dropdown there.

## See also

- [RadioGroup component reference](/docs/reference/components/RadioGroup) — `initialValue`, `enabled`, `orientation`, `onDidChange`, `value`, `setValue`
- [Select component reference](/docs/reference/components/Select) — the dropdown alternative for long lists
- [Set the Width of an Input Field in an HStack](/docs/howto/set-width-for-input-fields-in-a-horizontal-layout) — sizing for horizontal radios and other inline inputs
