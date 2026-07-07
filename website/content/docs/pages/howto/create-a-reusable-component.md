# Create a reusable component

Extract repeated markup into a `.xmlui` file with properties and slots.

A project dashboard often renders the same task-card layout in several places — a *My Tasks* panel, an *All Tasks* panel, a sprint board, and so on. Copy-pasting the block is a fast start, but the copies quickly drift: one gets a status icon, another gets a wider priority badge, and soon you're maintaining four versions of the same thing. Extract the block into a single `TaskCard` component and every panel automatically benefits from any future change.

```xmlui-pg copy display name="TaskCard used in two panels"
---app display
<App>
  <HStack wrapContent itemWidth="50%">
    <VStack>
      <H4>My Tasks</H4>
      <TaskCard
        title="Write release notes"
        priority="high"
        assignee="Alice"
        dueDate="2026-04-10"
      />
      <TaskCard
        title="Review pull request"
        priority="normal"
        assignee="Alice"
        dueDate="2026-04-12"
      />
    </VStack>
    <VStack>
      <H4>All Tasks</H4>
      <TaskCard
        title="Write release notes"
        priority="high"
        assignee="Alice"
        dueDate="2026-04-10"
      />
      <TaskCard
        title="Update dependencies"
        priority="low"
        assignee="Bob"
        dueDate="2026-04-15"
      />
      <TaskCard
        title="Fix login bug"
        priority="high"
        assignee="Carol"
        dueDate="2026-04-08"
      />
    </VStack>
  </HStack>
</App>
---comp display /\$props/ TaskCard
<Component name="TaskCard">
  <Card>
    <VStack>
      <Text variant="strong">{ $props.title ?? '(untitled)' }</Text>
      <HStack>
        <Badge
          value="{ $props.priority ?? 'normal' }"
          colorMap="{{
            high: '$color-warn',
            normal: '$color-success'
          }}"
        />
        <Text variant="secondary" fontSize="$fontSize-sm">{ $props.assignee }</Text>
      </HStack>
      <Text variant="secondary" fontSize="$fontSize-sm">Due: { $props.dueDate }</Text>
    </VStack>
  </Card>
</Component>
```

## Key points

**File placement and naming**: The file is `components/TaskCard.xmlui`. The `name` attribute on `<Component>` must match the filename exactly, and the name must start with an uppercase letter. XMLUI discovers files in the `components/` folder automatically.

**Accessing props with `$props`**: Inside a user-defined component, every caller-supplied attribute is available through `$props`. There is no other way to read them:

```xmlui
<Component name="TaskCard">
  <Text>{ $props.title }</Text>   <!-- ✅ correct -->
  <Text>{ title }</Text>          <!-- ❌ title is not in scope -->
</Component>
```

**Guard against missing props with `??`**: A caller may omit an optional attribute. The nullish-coalescing operator `??` provides a safe fallback without suppressing intentional `false` or `0` values:

```xmlui
{ $props.title ?? '(untitled)' }    <!-- falls back when title is absent -->
{ $props.priority ?? 'normal' }     <!-- falls back when priority is absent -->
```

**Scope isolation, with globals as an escape hatch**: Local variables (declared with `var.`) and element IDs in the parent are invisible inside `TaskCard` by default. There are two ways to get values across that boundary:

*Pass via props* for component-specific data — the card receives only what it needs and is reusable in different contexts:

```xmlui
<App var.currentUser="Alice">
  <TaskCard assignee="{currentUser}" title="Fix bug" />
</App>
<!-- inside TaskCard: $props.assignee works, currentUser does not -->
```

*Use a global* for app-wide values that many components share — current user, theme mode, feature flags, derived utilities. Globals are declared with `global.` on the root of `Main.xmlui`, or as top-level declarations in a `Globals.xs` code-behind file. They are visible from every component without prop-threading:

```xmlui
<App global.currentUser="Alice">
  <TaskCard title="Fix bug" />
</App>
<!-- inside TaskCard: { currentUser } reads the global directly — no $props needed -->
```

Prefer props when the same component is rendered with different data in different places. Prefer globals when every consumer reads the same singleton value and prop-threading would only create boilerplate. See [Scoping › Global variables](/docs/guides/scoping#global-variables) and [Scripting › Code-Behind files](/docs/guides/scripting#code-behind-files) for details on globals and `Globals.xs`.

**`id` is reserved — never use it as a prop name**: The `id` attribute is special in XMLUI: it registers a named reference that parent built-in components can use to call the component's API. If you pass `id="{$item.id}"` to a user-defined component, XMLUI captures it as the component reference, not as `$props.id`. Use a descriptive name instead:

```xmlui
<!-- ❌ wrong: id is captured by the framework, $props.id is undefined -->
<TaskCard id="{task.id}" />

<!-- ✅ correct: use a dedicated prop name -->
<TaskCard taskId="{task.id}" />
```

**Why extract**: Once `TaskCard.xmlui` exists, adding a status icon, changing the priority color, or tweaking padding is a one-file change that takes effect everywhere the component is used.

---

**See also**

- [User-defined components](/docs/guides/user-defined-components) — fuller treatment of the reusable-component story, including slots and template properties
- [Scoping](/docs/guides/scoping) — how variables and IDs flow across component boundaries, with rules for globals
- [Scripting › Code-Behind files](/docs/guides/scripting#code-behind-files) — pairing a `.xmlui.xs` file with the component for shared helper functions
