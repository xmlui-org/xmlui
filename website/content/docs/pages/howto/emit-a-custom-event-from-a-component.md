# Emit a custom event from a component

Define an event property in a user-defined component and fire it from an inner handler.

A `TaskCard` component knows its own task id, but it has no business reaching into the parent's state to remove itself from a list. Instead the card emits a `done` event that carries the id, and the parent decides what to do — in this case filter the task out of its local array. This is the core data-flow pattern for user-defined components: **props flow down, events flow up**.

```xmlui-pg copy display name="Mark tasks done by emitting an event"
---app display /onDone/ /emitEvent/
<App
  var.tasks="{[
    { id: 1, title: 'Write release notes', priority: 'high',   assignee: 'Alice' },
    { id: 2, title: 'Review pull request', priority: 'normal', assignee: 'Bob'   },
    { id: 3, title: 'Update dependencies', priority: 'low',    assignee: 'Carol' }
  ]}"
>
  <Items data="{tasks}">
    <TaskCard
      taskId="{$item.id}"
      title="{$item.title}"
      priority="{$item.priority}"
      assignee="{$item.assignee}"
      onDone="(taskId) => tasks = tasks.filter(t => t.id !== taskId)"
    />
  </Items>
  <Text variant="secondary">{ tasks.length } task(s) remaining</Text>
</App>
---comp display /emitEvent/ TaskCard
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
      <Button
        label="Mark Done"
        size="sm"
        variant="outlined"
        onClick="emitEvent('done', $props.taskId);"
      />
    </VStack>
  </Card>
</Component>
```

## Key points

**`emitEvent(name, payload)`**: Call it anywhere inside a user-defined component — event handlers, script blocks, or as part of a chained expression. The first argument is the event name (camel-case recommended). Additional arguments are the payload:

```xmlui
<!-- fire with a scalar -->
onClick="emitEvent('done', $props.taskId)"

<!-- fire with an object carrying multiple values -->
onClick="emitEvent('statusChanged', { taskId: $props.taskId, status: 'done' })"

<!-- fire with no payload -->
onClick="emitEvent('cancelled')"
```

**`on<EventName>` attribute on the caller**: The parent listens by adding an attribute whose name is the event name prefixed with `on` (capitalising the first letter). Use an arrow function to receive the payload as a named parameter:

```xmlui
<!-- listens to the 'done' event; taskId holds the emitted value -->
<TaskCard onDone="(taskId) => tasks = tasks.filter(t => t.id !== taskId)" />

<!-- listens to statusChanged; destructure the object payload -->
<TaskCard onStatusChanged="(payload) => handleChange(payload.id, payload.status)" />
```

**Events flow up, not down**: The child component never holds a reference to the parent's state. It emits a fact ("I was marked done") and the parent decides what to do (remove form list, patch an API, show a toast). This keeps components decoupled and reusable.

**Multiple events from one component**: Call `emitEvent` with different names for different actions. The caller can handle each independently:

```xmlui
<!-- inside TaskCard -->
<Button label="Edit"   onClick="emitEvent('edit',   $props.taskId)" />
<Button label="Delete" onClick="emitEvent('delete',  $props.taskId)" />

<!-- caller wires them up separately -->
<TaskCard onEdit="(id) => openEditModal(id)" onDelete="(id) => deleteTask(id)" />
```

**`id` is reserved — use a different prop name**: The `id` attribute is reserved by XMLUI to assign a component reference that can be accessed by parent built-in components. Never name a user-defined component prop `id`. Use a descriptive name such as `taskId`, `itemId`, or `recordId` instead:

```xmlui
<!-- ❌ wrong: 'id' is captured by the framework, not visible as $props.id -->
<TaskCard id="{$item.id}" />

<!-- ✅ correct: use a dedicated prop name -->
<TaskCard taskId="{$item.id}" />
```

**Using `<event>` tag for multi-line handlers**: When the event handling logic is longer than a one-liner, use the `<event>` tag inside the component:

```xmlui
<Button label="Mark Done">
  <event name="click">
    emitEvent('done', $props.taskId);
    emitEvent('activityLogged', { action: 'done', taskId: $props.taskId });
  </event>
</Button>
```
