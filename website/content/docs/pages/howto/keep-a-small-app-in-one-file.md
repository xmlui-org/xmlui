# Keep a small app in one file

Declare short, app-specific components directly in `Main.xmlui` when splitting them into separate files would add more ceremony than clarity.

Small apps, prototypes, and documentation examples often have one or two helper components that are only useful inside the current app. You can keep the app markup and those component definitions together at the top level of `Main.xmlui`.

```xmlui-pg copy display name="Small task tracker in one file" id="small-task-tracker-in-one-file" height="360px"
<App
  var.tasks="{[
    { title: 'Review invoice import', owner: 'Alice', status: 'ready' },
    { title: 'Fix CSV validation', owner: 'Bob', status: 'blocked' },
    { title: 'Publish release notes', owner: 'Carol', status: 'done' }
  ]}"
>
  <VStack>
    <H3>Today</H3>
    <Items data="{ tasks }">
      <TaskRow task="{ $item }" />
    </Items>
  </VStack>
</App>

<Component name="TaskRow">
  <Card>
    <HStack verticalAlignment="center">
      <VStack gap="$space-1">
        <Text variant="strong">{ $props.task.title }</Text>
        <Text variant="secondary">Owner: { $props.task.owner }</Text>
      </VStack>
      <SpaceFiller />
      <StatusBadge status="{ $props.task.status }" />
    </HStack>
  </Card>
</Component>

<Component name="StatusBadge">
  <Badge
    value="{ $props.status }"
    colorMap="{{
      blocked: '$color-warn',
      done: '$color-success',
      ready: '$color-info'
    }}"
  />
</Component>
```

## Key points

**Inline components are entry-file only**: This pattern works in `Main.xmlui`. Component files in the `components` folder still contain a single user-defined component and do not accept extra top-level app markup.

**Use one app root**: The file can contain zero or more top-level `<Component>` definitions and at most one non-`Component` root element. That non-`Component` element is the app markup.

```xmlui
<App>
  <Helper message="Hello" />
</App>

<Component name="Helper">
  <Text>{ $props.message }</Text>
</Component>
```

The order is flexible. This how-to puts the app first because the main question is how to keep a small app readable in one file. In component-focused documentation, it can be clearer to put the `<Component>` definitions first.

**Keep component boundaries in mind**: Inline components are still user-defined components. Variables and component IDs from the `App` are not automatically visible inside them. Pass values as props, as the example passes each task to `TaskRow`.

**Move shared components into files**: If a component is used by several pages, grows large, or needs its own code-behind file, move it to `components/ComponentName.xmlui`. File-based components also win if they have the same name as an inline component.

**An empty app is explicit**: If `Main.xmlui` contains only `<Component>` definitions, XMLUI renders an empty app as if the file contained `<Fragment />`, and logs a warning in the browser console.

---

**See also**

- [User-defined components](/docs/guides/user-defined-components) - the full component model, including slots and template properties
- [App structure](/docs/guides/app-structure) - how `Main.xmlui` and the `components` folder fit together
- [Scoping](/docs/guides/scoping) - how variables, IDs, props, and globals behave across component boundaries
- [Create a reusable component](/docs/howto/create-a-reusable-component) - when to extract markup into a component file
