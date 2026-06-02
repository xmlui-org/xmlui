# Component Metadata Prop Type Audit

This note records places where component metadata appears to omit a `valueType`
even though the prop or event shape looks typeable from the metadata text,
available values, default value, or renderer extraction path.

The audit used the type-contract guidance in
`xmlui/dev-docs/guide/27-type-contracts.md`: `availableValues` is checked before
`valueType`, and `valueType` is what lets both static and runtime checks detect
wrong literal or expression-valued props.

`hash` means a plain object record matching TypeScript's `Record<string, any>`.

## Common Metadata Helpers

These helpers produce reusable metadata without a `valueType`. Adding the type
at the helper level would cover several component props at once.

| Helper | Suspected `valueType` | Affected props |
| --- | --- | --- |
| `dIndeterminate()` ✅ | `boolean` | `Checkbox.indeterminate` |
| `dLabelPosition()` ✅ | `string` | `FormItem.labelPosition` and any component/behavior using this helper |
| `dLabelWidth()` ✅ | `length` | `FormItem.labelWidth` and label-bearing component behavior that reuses this helper |
| `dValidationStatus()` ✅ | `string` | `Checkbox.validationStatus`, `ColorPicker.validationStatus`, `DateInput.validationStatus`, `DatePicker.validationStatus`, `FileInput.validationStatus`, `FormItem.validationStatus`, `NumberBox.validationStatus`, `RadioGroup.validationStatus`, `RatingInput.validationStatus`, `Select.validationStatus`, `Slider.validationStatus`, `Switch.validationStatus`, `TextArea.validationStatus`, `TextBox.validationStatus`, `TimeInput.validationStatus` |
| `dInitialValue()` | component-specific | See component-specific candidates below. Some should stay broad or use `any`, but several input components have a clear scalar type. |

## Component Prop Candidates

| Component | Prop | Suspected `valueType` | Why it looks typeable |
| --- | --- | --- | --- |
| `APICall` ✅ | `headers`, `queryParams` | `hash` | Request headers and query parameters are key-value records. |
| `APICall` ✅ | `cancelBody` | `hash` or `any` | Optional request body is often object-shaped, but may need to allow non-record payloads. |
| `App` ✅ | `layout` | `string` | Metadata declares finite layout names in `availableValues`. |
| `AppWithCodeView` ✅ | `activeTheme`, `activeTone`, `app`, `height`, `title` | `string` | Descriptions and renderer props treat these as scalar strings. |
| `AppWithCodeView` ✅ | `api`, `config` | `hash` | Nested app API/config props are object records. |
| `NestedApp` ✅ | `activeTheme`, `activeTone`, `app`, `height` | `string` | Same shape as `AppWithCodeView`. |
| `NestedApp` ✅ | `api`, `config` | `hash` | Nested app API/config props are object records. |
| `AutoComplete` ✅ | `dropdownHeight` | `length` | Description says dropdown height; renderer treats it as CSS height. |
| `Badge` ✅ | `colorMap` | `hash` | Object mapping of values to colors. |
| `Checkbox` ✅ | `initialValue` | `boolean` | Checkbox value is boolean. |
| `ColorPicker` ✅ | `initialValue` | `color` | Initial value is a color-like value. |
| `DateInput` ✅ | `initialValue` | `string` | Date input values are strings. |
| `DatePicker` ✅ | `initialValue` | `string` | Date picker values are strings. |
| `FileInput` ✅ | `acceptsFileType` | `any` | Description says string array; current vocabulary has no array type. |
| `FileInput` ✅ | `buttonIcon` | `icon` | Renderer resolves an icon name and passes it to `Icon`. |
| `FileInput` ✅ | `buttonLabel` | `string` | Description says optional string label. |
| `FileInput` ✅ | `buttonPosition` | `string` | Metadata lists `start`/`end` values. |
| `FileInput` ✅ | `buttonSize`, `buttonVariant` | `string` | Metadata supplies finite option lists. |
| `FileInput` ✅ | `directory`, `multiple` | `boolean` | Descriptions and renderer use `asOptionalBoolean`. |
| `FileUploadDropZone` ✅ | `acceptedFileTypes` | `string` | Description says MIME-type list as comma-separated text. |
| `FileUploadDropZone` ✅ | `maxFiles` | `number` or `integer` | Description says maximum file count. |
| `FlowLayout` ✅ | `columnGap`, `rowGap` | `length` | Props override CSS gap values. |
| `Form` ✅ | `completedNotificationMessage`, `errorNotificationMessage`, `inProgressNotificationMessage` | `string` | Notification messages are text. |
| `Form` ✅ | `data` | `hash` | Initial form data is object-shaped. |
| `Form` ✅ | `doNotPersistFields` | `any` | Description says field-name list; current vocabulary has no string-array type. |
| `Form` ✅ | `submitMethod` | `string` | HTTP method string, likely finite values. |
| `Form` ✅ | `submitUrl` | `url` | Description says URL. |
| `FormItem` ✅ | `bindTo` | `string` | Field binding name. |
| `FormItem` ✅ | `initialValue` | `any` | Can mirror arbitrary field value; explicit `any` would document the opt-out. |
| `FormItem` ✅ | `validationMode` | `string` | Metadata declares finite validation modes. |
| `FormSegment` | `fields` | `string` | Description says comma-separated field names. |
| `Heading`, `H1`...`H6` | `value` | `string` | Heading text. |
| `Heading`, `H1`...`H6` | `maxLines` | `number` or `integer` | Maximum line count. |
| `Heading` | `level` | `string` | Metadata declares accepted string forms in `availableValues`. |
| `List` | `loading` | `boolean` | Description says rendering waits until it is false. |
| `List` | `limit` | `number` or `integer` | Maximum item count. |
| `List` | `groupBy`, `orderBy`, `syncWithVar` | `string` | Field/global variable names. |
| `List` | `rowsSelectable` | `boolean` | Description says true/false. |
| `List` | `initiallySelected`, `availableGroups`, `defaultGroups` | `any` | Array-like values; current vocabulary has no array type. |
| `List` | `rowUnselectablePredicate` | `any` | Predicate/function value; current vocabulary has no function type. |
| `Markdown` | `content` | `string` | Markdown source text. |
| `ModalDialog` | `title` | `string` | Prestyled heading text. |
| `ModalDialog` | `titleTemplate` | `ComponentDef` | Custom template prop. |
| `NavGroup` | `initiallyExpanded` | `boolean` | Description says expanded/collapsed state. |
| `NavLink` | `icon` | `icon` | Icon name. |
| `NavLink` | `to` | `url` | Link target URL. |
| `NumberBox` | `gap` | `length` | Gap between adornments and input area. |
| `NumberBox` | `initialValue` | `number` | Numeric input value. |
| `NumberBox` | `spinnerUpIcon`, `spinnerDownIcon` | `icon` | Icon names rendered by `Icon`. |
| `Option` | `label` | `string` | Display text. |
| `Option` | `keywords` | `any` | Array-like search keywords; current vocabulary has no array type. |
| `Page` | `url` | `url` | Route URL. |
| `PageMetaTitle` | `value` | `string` | Browser tab title text. |
| `Pages` | `fallbackPath` | `url` | Fallback route path. |
| `Pagination` | `pageSizeOptions` | `any` | Number array; current vocabulary has no array type. |
| `RadioGroup` | `initialValue` | `string` or `any` | Depends on `RadioItem.value`; likely should be explicit if broad. |
| `RatingInput` | `initialValue` | `number` | Rating value. |
| `Select` | `dropdownHeight` | `length` | CSS height, including intrinsic height keywords. |
| `Select` | `data` | `any` | Option data array; current vocabulary has no array type. |
| `Select` | `value` | `any` | Internal current value can be scalar or array. |
| `Slider` | `initialValue` | `number` or `any` | Numeric slider value, but range sliders may need array support. |
| `Slider` | `rangeStyle`, `thumbStyle` | `hash` | Style objects. |
| `Slot` | `name` | `string` | Slot name. |
| `StepperForm` | `completedNotificationMessage`, `errorNotificationMessage`, `inProgressNotificationMessage` | `string` | Notification messages are text. |
| `StepperForm` | `doNotPersistFields` | `any` | Metadata has `type: "string[]"`, but not `valueType`; current vocabulary has no array type. |
| `StepperForm` | `submitMethod` | `string` | HTTP method string, likely finite values. |
| `StepperForm` | `submitUrl` | `url` | Description says URL. |
| `Switch` | `initialValue` | `boolean` | Switch value is boolean. |
| `Table` | `data` | `any` | Row data array; current vocabulary has no array type. |
| `Table` | `headerHeight` | `length` | Header height. |
| `Table` | `iconNoSort`, `iconSortAsc`, `iconSortDesc` | `icon` | Icon names for sort state. |
| `Table` | `initiallySelected`, `pageSizeOptions` | `any` | Array-like values; current vocabulary has no array type. |
| `Table` | `loading`, `rowsSelectable` | `boolean` | Descriptions say boolean. |
| `Table` | `pageSize` | `number` or `integer` | Page row count. |
| `Table` | `pageInfoPosition`, `pageSizeSelectorPosition` | `string` | Pagination positions; metadata likely has finite values. |
| `Table` | `rowDisabledPredicate`, `rowUnselectablePredicate` | `any` | Predicate/function values; current vocabulary has no function type. |
| `Table` | `sortBy`, `sortDirection`, `syncWithVar` | `string` | Field, enum, and global variable names. |
| `Table` | `syncWithAppState` | `id-ref` or `string` | Description points at an `AppState` instance. |
| `Tabs` | `activeTab` | `number` or `integer` | Description says zero-based tab index. |
| `Tabs` | `headerTemplate` | `ComponentDef` | Template prop. |
| `TabsForm` | `completedNotificationMessage`, `errorNotificationMessage`, `inProgressNotificationMessage` | `string` | Notification messages are text. |
| `TabsForm` | `doNotPersistFields` | `any` | Metadata has `type: "string[]"`, but not `valueType`; current vocabulary has no array type. |
| `TabsForm` | `submitMethod` | `string` | HTTP method string, likely finite values. |
| `TabsForm` | `submitUrl` | `url` | Description says URL. |
| `Text` | `value` | `string` | Text content. |
| `Text` | `maxLines` | `number` or `integer` | Maximum line count. |
| `Text` | `variant` | `string` | Metadata declares finite variant values. |
| `TextArea` | `initialValue` | `string` | Text area value. |
| `TextArea` | `maxRows`, `minRows` | `number` or `integer` | Row counts. |
| `TextArea` | `resize` | `string` | Metadata declares finite resize values. |
| `TextArea` | `validationIconError`, `validationIconSuccess` | `icon` | Metadata currently has `type: "string"` instead of `valueType`; these are icon names. |
| `TextArea` | `verboseValidationFeedback` | `boolean` | Metadata currently has `type: "boolean"` instead of `valueType`. |
| `TextBox` | `gap` | `length` | Gap between adornments and input area. |
| `TextBox` | `initialValue` | `string` | Text input value. |
| `Theme` | `themeId` | `string` | Theme identifier. |
| `TileGrid` | `data` | `any` | Tile data array; current vocabulary has no array type. |
| `TileGrid` | `syncWithVar` | `string` | Global variable name. |
| `TimeInput` | `initialValue` | `string` | Time input value. |
| `Tree` | `data` | `any` | Tree data shape depends on `dataFormat`; explicit `any` would document the opt-out. |
| `Tree` | `selectedId`, `selectedValue` | `string` | Selected tree item ID/value. |

## Event Metadata Candidates

Event metadata does not use `valueType`; however, missing `signature` metadata
has the same contract-documentation problem for handlers. These events appear
typeable and currently lack signatures.

| Component | Event | Suggested signature direction |
| --- | --- | --- |
| `Drawer` | `open`, `close` | `open(): void`, `close(): void` |
| `Icon` | `click` | Reuse `dClick("icon")` or add `click(event: MouseEvent): void`. |
| `TileGrid` | `contextMenu` | Include tile item and index parameters, plus mouse event if provided. |
| `TileGrid` | `itemDoubleClick` | Include tile item and index parameters. |
| `TileGrid` | `selectionDidChange` | Include selected items and selected IDs. |
| `TileGrid` | `selectAllAction`, `cutAction`, `copyAction`, `pasteAction`, `deleteAction` | The descriptions already name `(focusedItem, selectedItems, selectedIds)` style parameters; add signatures to match `List` selection/action events. |

`APICall.progress` is internal and was not included as a user-facing candidate,
though it also lacks a signature.

## Deprecated HTML Tag Components

`HtmlTags.tsx` is marked deprecated, so these may be lower priority. If these
wrappers remain while type contracts are active, many native attributes can be
typed:

| Component(s) | Props | Suspected `valueType` |
| --- | --- | --- |
| `HtmlA`, `HtmlArea`, `HtmlAudio`, `HtmlBlockquote`, `HtmlButton`, `HtmlDel`, `HtmlEmbed`, `HtmlForm`, `HtmlIFrame`, `HtmlImg`, `HtmlIns`, `HtmlInput`, `HtmlLink`, `HtmlObject`, `HtmlQ`, `HtmlScript`, `HtmlSource`, `HtmlTrack`, `HtmlVideo` | URL-like props such as `href`, `src`, `action`, `cite`, `formAction`, `poster`, `data` | `url` |
| `HtmlA`, `HtmlAudio`, `HtmlButton`, `HtmlDetails`, `HtmlDialog`, `HtmlFieldset`, `HtmlForm`, `HtmlIFrame`, `HtmlImg`, `HtmlInput`, `HtmlOption`, `HtmlProgress`, `HtmlScript`, `HtmlSelect`, `HtmlVideo` | Boolean props such as `disabled`, `download`, `autoPlay`, `controls`, `loop`, `muted`, `autoFocus`, `formNoValidate`, `open`, `noValidate`, `allowFullScreen`, `checked`, `readOnly`, `required`, `multiple`, `selected`, `defer`, `async` | `boolean` |
| `HtmlCanvas`, `HtmlCol`, `HtmlColgroup`, `HtmlInput`, `HtmlLi`, `HtmlMeter`, `HtmlProgress`, `HtmlSelect`, `HtmlTextarea`, `HtmlTd`, `HtmlTh` | Numeric props such as `width`, `height`, `span`, `maxLength`, `minLength`, `size`, `value`, `min`, `max`, `low`, `high`, `optimum`, `cols`, `rows`, `rowSpan`, `colSpan` | `number` or `integer` |
| Most `Html*` wrappers | Textual props such as `alt`, `type`, `rel`, `target`, `media`, `name`, `placeholder`, `title`, `lang`, `dir`, `scope`, `kind`, `label` | `string` |
