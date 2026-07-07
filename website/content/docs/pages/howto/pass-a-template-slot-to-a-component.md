# Pass a template slot to a component

Templates let a caller pass *markup* into a component, not just data. Props are for values — a title, a count, a date. Templates are for structure — different buttons in a row, different empty states, different per-row layouts. When the variation between callers is structural rather than data-only, reach for a template.

## Stage 1 — an unnamed `<Slot />`

The simplest template is a single `<Slot />` element inside a component. Anything the caller writes between the component's opening and closing tags renders at the `<Slot />` location.

```xmlui-pg copy display name="Card wrapper with a single Slot"
---app display
<App>
  <ContentCard>
    <H4>Project status</H4>
    <Text>All on track for the April release.</Text>
  </ContentCard>
</App>
---comp display /Slot/
<Component name="ContentCard">
  <Card padding="$space-4">
    <Slot />
  </Card>
</Component>
```

The `H4` and `Text` written inside `<ContentCard>` flow into where `<Slot />` sits in the component definition. `ContentCard` becomes a wrapper that adds layout — a padded Card — around whatever the caller passes inside.

## Stage 2 — named slots and the pairing rule

When a component has more than one place a caller might customize, give each location its own *named* slot. The component declares each slot with `<Slot name="...">`; the caller supplies content with a `<property name="...">` element inside the component tag.

The two ends of the contract:

| Component (definition) | Caller (usage) |
|---|---|
| `<Slot name="actionsTemplate">` | `<property name="actionsTemplate">` |
| ↓ default content here ↓ | ↓ caller's markup here ↓ |
| `</Slot>` | `</property>` |

**The `name=` strings on both sides must match exactly.** That is the entire pairing rule. The `<property>` element on the caller side and the `<Slot>` element on the component side don't look related — they're paired only by their `name=` value.

**Slot names must end in `Template`.** A slot named `actions` produces an error at parse time; `actionsTemplate` is correct. The suffix marks slot names as a documented public API of the component, distinct from regular prop names.

## Stage 3 — default content

Markup placed *inside* a `<Slot name="...">…</Slot>` element renders as a fallback when the caller doesn't supply a matching `<property>`. A slot resolves to either the caller's markup or the default content — never both.

The richer example below has three views of the same `TaskCard` component: a manager view supplies Edit/Delete buttons, a team-member view supplies one Mark Done button, and a read-only view supplies nothing — the slot's default `"No actions"` text appears for that one.

```xmlui-pg copy display name="TaskCard with an actionsTemplate slot"
---app display
<App>
  <HStack wrapContent itemWidth="33.33%">
    <VStack>
      <H4>Manager view</H4>
      <TaskCard 
        title="Write release notes" 
        priority="high" 
        assignee="Alice" 
        dueDate="2026-04-10"
      >
        <property name="actionsTemplate">
          <HStack>
            <Button label="Edit" variant="outlined" size="sm" />
            <Button 
              label="Delete" 
              variant="outlined" 
              size="sm" 
              themeColor="attention" 
            />
          </HStack>
        </property>
      </TaskCard>
    </VStack>
    <VStack>
      <H4>Team member view</H4>
      <TaskCard 
        title="Review pull request" 
        priority="normal" 
        assignee="Bob" 
        dueDate="2026-04-12"
      >
        <property name="actionsTemplate">
          <Button label="Mark Done" size="sm" />
        </property>
      </TaskCard>
    </VStack>
    <VStack>
      <H4>Read-only view</H4>
      <TaskCard 
        title="Update dependencies" 
        priority="low" 
        assignee="Carol" 
        dueDate="2026-04-15"
      />
    </VStack>
  </HStack>
</App>
---comp display /actionsTemplate/ /Slot/ TaskCard
<Component name="TaskCard">
  <Card>
    <VStack>
      <Text variant="strong">{ $props.title ?? '(untitled)' }</Text>
      <HStack>
        <Badge
          value="{ $props.priority ?? 'normal' }"
          colorMap="{{
            high: '$color-warn',
            normal: '$color-info',
            low: '$color-success'
          }}"
        />
        <Text variant="secondary">{ $props.assignee }</Text>
      </HStack>
      <Text variant="secondary">Due: { $props.dueDate }</Text>
      <Slot name="actionsTemplate">
        <Text variant="secondary">No actions</Text>
      </Slot>
    </VStack>
  </Card>
</Component>
```

## Key points

**Slot content evaluates in the caller's scope, not the component's**: Markup inside `<property name="actionsTemplate">` sees the caller's variables and IDs, not the component's internal state. This is how a caller's button can reference parent state from inside the slot:

```xmlui
<App var.selectedId="{null}">
  <TaskCard title="Fix bug" id="{task.id}">
    <property name="actionsTemplate">
      <!-- selectedId comes from the caller's scope, resolved there -->
      <Button label="Select" onClick="selectedId = $props.id" />
    </property>
  </TaskCard>
</App>
```

**A component can have any number of named slots**: A complex component might expose `headerTemplate`, `footerTemplate`, `actionsTemplate`, and `emptyTemplate` — each one a distinct customization point with its own default. The caller fills only the ones it cares about; the rest fall back to defaults.

**The unnamed `<Slot />` and named slots can coexist**: A component can have a single `<Slot />` for general children plus several named `<Slot name="...Template">` for specific regions. The unnamed slot collects whatever the caller writes as direct children that aren't wrapped in a `<property>` element.

### Advanced: passing context back through a named slot

*Skip on first read.* So far data flows one direction: caller markup goes *into* the component. The reverse direction also works — a component can expose computed values *back* to the caller's template by adding extra attributes on `<Slot>`. Those become `$`-prefixed context variables visible inside the caller's `<property>` block:

```xmlui
<!-- Component definition: expose a formatted label back to the template -->
<Slot
  name="actionsTemplate" 
  formattedTitle="{ '[' + $props.title.toUpperCase() + ']' }" 
/>

<!-- Caller template: $formattedTitle is filled by the component -->
<property name="actionsTemplate">
  <Text>{ $formattedTitle }</Text>
</property>
```

This lets the component supply derived state (a formatted label, a row index, a computed flag) to per-instance markup the caller controls.
