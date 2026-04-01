# TiptapEditor [#tiptapeditor]

`TiptapEditor` wraps the Tiptap rich-text editor as an XMLUI component. It provides a full-featured markdown editing experience with toolbar, table editing, task lists, and live markdown output.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Display When | `displayWhen` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `editable`

> [!DEF]  default: **true**

Whether the editor is editable.

### `height`

> [!DEF]  default: **"300px"**

The height of the editor content area.

### `initialValue`

This property sets the component's initial value.

### `placeholder`

> [!DEF]  default: **"Start writing..."**

Placeholder text shown when the editor is empty.

### `toolbar`

> [!DEF]  default: **true**

Whether to show the formatting toolbar.

### `toolbarItems`

Comma-separated list of toolbar items to show. If omitted, all items are shown.

## Events

### `didChange`

This event is triggered when value of TiptapEditor has changed.

**Signature**: `didChange(newValue: any): void`

- `newValue`: The new value of the component.

## Exposed Methods

### `focus`

Sets focus on the editor.

**Signature**: `focus(): void`

### `getHTML`

Gets the current editor content as HTML.

**Signature**: `getHTML(): string`

### `getMarkdown`

Gets the current editor content as markdown.

**Signature**: `getMarkdown(): string`

### `setValue`

Sets the editor content (markdown string).

**Signature**: `setValue(value: string): void`

- `value`: The new markdown content.

## Styling

This component does not have any styles.
