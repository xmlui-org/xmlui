# Assign a complex JSON literal to a variable

Initialize a component variable with a structured object literal by using double curly braces inside the attribute value.

A single `{expression}` in an attribute value is reserved for reactive expressions. To assign a literal object or array — rather than a bound variable — wrap it in double curly braces: `var.config="{{ key: 'value', items: [...] }}"`. The outer `""` delimit the attribute, the outer `{{` and `}}` signal a literal, and the content is a plain JavaScript object expression.

```xmlui-pg name="Assign a complex JSON literal to a variable"
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test"
  <!-- double curly braces inside double quote -->
  var.appConfig="{{
    name: 'Photo Gallery',
    version: '1.2.0',
    isPublic: true,
    photos: [
      { id: 1, title: 'Sunset Beach', likes: 42 },
      { id: 2, title: 'Mountain View', likes: 38 },
      { id: 3, title: 'City Lights', likes: 55 }
    ],
    authors: [
      { name: 'Alice Johnson', role: 'Photographer' },
      { name: 'Bob Smith', role: 'Editor' }
    ]
  }}">
  <!-- double curly braces inside double quote -->

  <Text>{appConfig.name} v{appConfig.version}</Text>

  <Text>Photos ({appConfig.photos.length})</Text>
  <Items data="{appConfig.photos}">
    <Text>{$item.title} - {$item.likes} likes</Text>
  </Items>

  <Text>Team</Text>
  <Items data="{appConfig.authors}">
    <Text>{$item.name} ({$item.role})</Text>
  </Items>

</Component>
```

## Key points

**Double curly braces signal an object literal**: `var.config="{{ ... }}"` — the outer pair are the XML attribute delimiters while `{{` and `}}` tell the parser that the content is a literal value, not a bound expression.

**The literal is still reactive**: Even though the value is fixed at declaration time, the variable behaves like any other `var.*` — it can be reassigned in event handlers, and any expression that reads it will re-render when it changes.

**Arrays and nested objects are supported**: You can include arrays, nested objects, strings, numbers, and booleans. The content follows standard JavaScript object-literal syntax, so trailing commas and computed keys work as expected.

**Prefer `AppState` for mutable structured data**: For structured data that will be updated by handlers, use `AppState` with an `initialValue` prop instead. Reserve the double-brace literal for static configuration that rarely or never changes.

---

## See also

- [Use accessors to simplify complex expressions](/docs/howto/use-accessors-to-simplify-complex-expressions) — extract a nested path from a complex object into a named local variable
- [Buffer a reactive edit](/docs/howto/buffer-a-reactive-edit) — stage edits to structured state before committing
- [Derive a value from multiple sources](/docs/howto/derive-a-value-from-multiple-sources) — combine multiple reactive variables in a single expression
