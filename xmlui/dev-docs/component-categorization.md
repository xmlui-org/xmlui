# XMLUI Component Categorization

This document categorizes the components in the XMLUI framework by their primary purpose and functionality.

> **Note:** This is a rough categorization to aid in future work around metadata and other LLM-based operations. Categories can be modified, components moved around, etc.

> **Note #2:** Plugin components are excluded (e.g., `xmlui-animations`, `xmlui-pdf`, `xmlui-spreadsheet`, `xmlui-website-blocks`).

> **Note #3:** Components may span multiple roles and can be miscategorized.

## Layout

Structural containers that position or group children; they set flow, spacing, and alignment without adding data behavior.

- **Stack / HStack / VStack / CHStack / CVStack** - Stack-based layout with orientation and alignment variants
- **FlowLayout** - Flow/wrap layout
- **Column** - Columnar layout
- **Splitter / HSplitter / VSplitter** - Resizable layout dividers
- **SpaceFiller** - Spacer/flex filler
- **StickyBox** - Sticky-position wrapper
- **Breakout** - Layout break helper
- **Card** - Bounded container with optional chrome
- **Fragment** - Grouping without extra DOM
- **App**
- **AppHeader**
- **Pages**
- **Page**
- **ContentSeparator**
- **Footer**
- **SpaceFiller** (as feedback spacer)

## Inputs

Direct user-entry controls that capture values (text, numeric, temporal, choice, file, sliders, toggles).

- **TextBox**
- **PasswordInput**
- **TextArea**
- **NumberBox**
- **Slider**
- **DateInput**
- **DatePicker**
- **TimeInput**
- **Select**
- **AutoComplete**
- **EmojiSelector**
- **RadioGroup**
- **Checkbox**
- **Switch**
- **Option**
- **ColorPicker**
- **FileInput**
- **FileUploadDropZone**

### Closely Related: Form

This is not a separate category because how tight forms and inputs are in essence.
Form scaffolding that binds controls, handles validation, grouping, and submission flow.

- **Form**
- **FormItem**
- **FormSection**
- **ValidationSummary**

## Logic

Non-visual or headless components that fetch/mutate data, manage app state, react to changes, or orchestrate work.

- **DataSource** (fetch) / **APICall** (mutate)
- **AppState**
- **ChangeListener**
- **Queue**
- **RealTimeAdapter**
- **SelectionStore**
- **SearchIndexCollector**
- **Theme**
- **Timer**
- **Bookmark**
- **Redirect**

## Actions

Components that move users between views or initiate actions; includes menus, tabs, pagination, and CTA surfaces.

- **Button**
- **ToneChangerButton**
- **ToneSwitch**
- **Link**
- **NavLink**
- **NavGroup**
- **NavPanel**
- **MenuItem**
- **SubMenuItem**
- **MenuSeparator**
- **DropdownMenu**
- **Pagination**
- **PageMetaTitle**

## Display

Visual renderers and feedback surfaces (text/media, data views, charts, overlays, and transient UI).

- **Text**
- **Heading / H1–H6**
- **Markdown**
- **CodeBlock**
- **Badge**
- **Avatar**
- **Icon**
- **Image**
- **Logo**
- **List**
- **Items**
- **Table**
- **TabItem**
- **Tabs**
- **TableOfContents**
- **LabelList**
- **Legend**
- **BarChart**
- **DonutChart**
- **LineChart**
- **PieChart**
- **ResponsiveBar**
- **ProgressBar**
- **Spinner**
- **NoResult**
- **Tooltip**
- **ModalDialog**
- **Backdrop**
- **Carousel**
- **ExpandableItem**
- **IFrame**
- **Slot**
