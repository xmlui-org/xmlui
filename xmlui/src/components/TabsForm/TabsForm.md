# TabsForm

`TabsForm` is an experimental structured form foundation. It renders each
direct `FormSegment` child as a tab while preserving a single shared `Form`
around all tab content.

The old XMLUI implementation transforms `TabsForm` into `Form` + `Tabs` +
`TabItem` nodes and forwards the standard Form APIs. This foundation preserves
that visible authoring model and forwards `reset`, `update`, `getData`, and
`validate` through the inner Form.
