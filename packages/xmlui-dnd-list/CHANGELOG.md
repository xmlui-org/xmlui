# xmlui-dnd-list

## 0.2.0

### Minor Changes

- 54a6dd9: Add `xmlui-dnd-list`: a drag-and-drop sortable list extension. `DndItems` is
  a drop-in replacement for `Items` that adds an `onReorder(newOrder, info)`
  event, plus an optional `dragHandle` mode that confines dragging to a rendered
  `⋮⋮` grip so input-heavy rows stay interactive.

## 0.1.0

### Minor Changes

- Initial release. `DndItems` — a drag-and-drop sortable list, drop-in for
  `Items` with an `onReorder(newOrder, info)` event and an optional
  `dragHandle` mode that confines dragging to a rendered `⋮⋮` grip.
