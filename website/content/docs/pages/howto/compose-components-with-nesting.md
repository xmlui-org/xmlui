# Compose components with nesting

Build higher-order components that wrap others while forwarding props.

Rather than placing all Kanban board markup in a single file, build it as three focused layers: `TaskCard` renders one task, `TaskColumn` groups tasks under a labelled column header, and `TaskBoard` owns the full data set and assembles the layout. Each layer has one job, accepts typed props, and is independently readable.

```xmlui-pg copy display name="Kanban board built from composed components"
---app display
<App>
  <TaskBoard />
</App>
---comp display /\$props\.tasks/ /allTasks/ TaskBoard
<Component name="TaskBoard"
  var.allTasks="{[
    { 
      id: 1, title: 'Design mockup', priority: 'high',
      assignee: 'Alice', status: 'todo'
    },
    {
      id: 2, title: 'Write release notes', priority: 'normal', 
      assignee: 'Bob',   status: 'todo'
    },
    { 
      id: 3, title: 'Review pull request', priority: 'high',
      assignee: 'Carol', status: 'in-progress' 
    },
    { 
      id: 4, title: 'Update dependencies', priority: 'low',
      assignee: 'Alice', status: 'in-progress' 
    },
    { 
      id: 5, title: 'Fix login bug', priority: 'high', 
      assignee: 'Bob', status: 'done'
    },
    { 
      id: 6, title: 'Add dark mode', priority: 'normal', 
      assignee: 'Carol', status: 'done'
    }
  ]}"
  var.todoTasks="{allTasks.filter(t => t.status === 'todo')}"
  var.inProgressTasks="{allTasks.filter(t => t.status === 'in-progress')}"
  var.doneTasks="{allTasks.filter(t => t.status === 'done')}"
>
  <HStack wrapContent itemWidth="33.33%">
    <TaskColumn title="To Do"       tasks="{todoTasks}"       />
    <TaskColumn title="In Progress" tasks="{inProgressTasks}" />
    <TaskColumn title="Done"        tasks="{doneTasks}"        />
  </HStack>
</Component>
---comp display /\$props\.tasks/ /\$item/ TaskColumn
<Component name="TaskColumn">
  <VStack>
    <HStack>
      <Text variant="strong">{ $props.title }</Text>
      <SpaceFiller />
      <Badge value="{ $props.tasks.length }" variant="pill" />
    </HStack>
    <Items data="{ $props.tasks }">
      <TaskCard
        title="{ $item.title }"
        priority="{ $item.priority }"
        assignee="{ $item.assignee }"
      />
    </Items>
  </VStack>
</Component>
---comp display TaskCard
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
    </VStack>
  </Card>
</Component>
```

## Key points

**Derive filtered arrays as reactive variables**: Compute filtered subsets on the `<Component>` tag rather than inside child attribute values. The variables update reactively whenever `allTasks` changes, and the expressions stay readable:

```xmlui
<Component name="TaskBoard"
  var.allTasks="{fetchedTasks}"
  var.todoTasks="{allTasks.filter(t => t.status === 'todo')}"
>
```

**Passing arrays as props**: Use curly-brace evaluation so the array object is passed, not a string:

```xmlui
<TaskColumn tasks="{todoTasks}" />  <!-- ✅ passes the array -->
<TaskColumn tasks="todoTasks" />    <!-- ❌ passes the literal string "todoTasks" -->
```

**`$item` inside nested iteration**: When `TaskColumn` iterates `$props.tasks` with `Items`, the `$item` context variable refers to each element of *that* array. There is no mixing with an outer iteration — each component's iteration context is independent:

```xmlui
<!-- Inside TaskColumn: $item is one task from $props.tasks -->
<Items data="{ $props.tasks }">
  <TaskCard title="{ $item.title }" />
</Items>
```

**Scope isolation between components**: Variables and IDs declared in `TaskBoard` are invisible inside `TaskColumn` or `TaskCard`. Pass needed values explicitly as props.

```xmlui
<!-- TaskBoard's allTasks variable is NOT visible inside TaskColumn -->
<!-- Pass the relevant slice explicitly: -->
<TaskColumn tasks="{todoTasks}" />
```

**Single responsibility keeps files small**: Each component solves exactly one problem. `TaskCard` renders a single task. `TaskColumn` groups tasks under a header. `TaskBoard` owns the data and arranges the columns. When requirements change — say, adding drag-and-drop — you touch only the layer that is responsible for that concern.
