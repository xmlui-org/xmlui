# Pass a template slot to a component

Use named `Slot` elements (ending in "Template") to let callers inject custom markup.

A component like `TaskCard` is often used in more than one context: a manager's view needs *Edit* and *Delete* buttons at the bottom, a team-member's view needs only a *Mark Done* button, and a read-only summary view needs no buttons at all. Rather than creating three separate components, add an `actionsTemplate` named slot to `TaskCard`. Each caller injects its own action row; when no template is provided the slot renders a sensible default.

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

**Named slot names must end in "Template"**: XMLUI enforces this convention. A slot named `actions` will produce an error; `actionsTemplate` is correct. Common patterns: `headerTemplate`, `footerTemplate`, `actionsTemplate`, `emptyTemplate`.

**Caller syntax uses `<property>`**: Provide slot content with the `<property name="…">` element nested directly inside the component tag:

```xmlui
<TaskCard title="Fix bug">
  <property name="actionsTemplate">
    <Button label="Edit" />
    <Button label="Delete" themeColor="attention" />
  </property>
</TaskCard>
```

**Default slot content**: Any markup placed as a child of `<Slot name="actionsTemplate">…</Slot>` inside the component definition is rendered when the caller provides no template. In the example above, the read-only view gets "No actions" automatically.

**Slot content evaluates in the caller's scope**: The markup inside `<property name="actionsTemplate">` sees the parent's variables and IDs, not the component's internal state. This lets callers reference their own context freely:

```xmlui
<!-- Parent scope -->
<App var.selectedId="{null}">
  <TaskCard title="Fix bug" id="{task.id}">
    <property name="actionsTemplate">
      <!-- selectedId is from the parent, resolved there -->
      <Button label="Select" onClick="selectedId = $props.id" />
    </property>
  </TaskCard>
</App>
```

**Passing context back through the slot**: The component can expose internal computed values to the caller's template by adding extra attributes on `<Slot>`. Those become `$`-prefixed context variables inside the template:

```xmlui
<!-- Component definition: expose a formatted label back to the template -->
<Slot
  name="actionsTemplate" 
  formattedTitle="{ '[' + $props.title.toUpperCase() + ']' }" 
/>

<!-- Caller template: receives $formattedTitle -->
<property name="actionsTemplate">
  <Text>{ $formattedTitle }</Text>
</property>
```

**Unnamed default slot**: `<Slot />` (no name) transposes any direct children of the component tag, making the component a transparent wrapper:

```xmlui
<!-- Component -->
<Component name="ActionBar">
  <Card><HStack><Slot /></HStack></Card>
</Component>

<!-- Caller — Button children flow into the HStack -->
<ActionBar>
  <Button label="Save" />
  <Button label="Cancel" />
</ActionBar>
```
