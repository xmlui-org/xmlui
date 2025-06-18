# Components Overview [#components-overview]

| Num | Component | Description |
| :---: | :---: | --- |
| 1 | [APICall](./components/APICall) | `APICall` is used to mutate (create, update or delete) some data on the backend. It is similar in nature to the `DataSource` component which retrieves data from the backend. |
| 2 | [App](./components/App) | The `App` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates, `App` allows you to display your preferred layout. |
| 3 | [AppHeader](./components/AppHeader) | `AppHeader` is a placeholder within `App` to define a custom application header. |
| 4 | [AppState](./components/AppState) | AppState is a functional component (without a visible user interface) that helps store and manage the app's state. |
| 5 | [AutoComplete](./components/AutoComplete) | This component is a dropdown with a list of options. According to the `multi` property, the user can select one or more items. |
| 6 | [Avatar](./components/Avatar) | The `Avatar` component represents a user, group (or other entity's) avatar with a small image or initials. |
| 7 | [Backdrop](./components/Backdrop) | The `Backdrop` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it. |
| 8 | [Badge](./components/Badge) | The `Badge` is a text label that accepts a color map to define its background color and, optionally, its label color. |
| 9 | [BarChart](./components/BarChart) | The `BarChart` component represents a bar chart.Accepts a `LabelLst` component as a child to parametrize display labels. |
| 10 | [Bookmark](./components/Bookmark) | As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location. |
| 11 | [Breakout](./components/Breakout) | The `Breakout` component creates a breakout section. It allows its child to occupy the entire width of the UI even if the app or the parent container constrains the maximum content width. |
| 12 | [Button](./components/Button) | Button is an interactive element that triggers an action when clicked. |
| 13 | [Card](./components/Card) | The `Card` component is a container for cohesive elements, often rendered visually as a card. |
| 14 | [ChangeListener](./components/ChangeListener) | `ChangeListener` is a functional component (it renders no UI) to trigger an action when a particular value (component property, state, etc.) changes. |
| 15 | [Checkbox](./components/Checkbox) | The `Checkbox` component allows users to make binary choices, typically between checked or unchecked. It consists of a small box that can be toggled on or off by clicking on it. |
| 16 | [CHStack](./components/CHStack) | This component represents a stack that renders its contents horizontally and aligns that in the center along both axes. |
| 17 | [ColorPicker](./components/ColorPicker) | This component allows the user to select a color with the browser's default color picker control. |
| 18 | [Column](./components/Column) | The `Column` component can be used within a `Table` to define a particular table column's visual properties and data bindings. |
| 19 | [ContentSeparator](./components/ContentSeparator) | A `ContentSeparator` is a component that divides or separates content visually within a layout. It serves as a visual cue to distinguish between different sections or groups of content, helping to improve readability and organization. |
| 20 | [CVStack](./components/CVStack) | This component represents a stack that renders its contents vertically and aligns that in the center along both axes. |
| 21 | [DataSource](./components/DataSource) | The `DataSource` component manages fetching data from an API endpoint. This component automatically manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the [`APICall`](./APICall.mdx) component. |
| 22 | [DatePicker](./components/DatePicker) | A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display. |
| 23 | [DonutChart](./components/DonutChart) | Represents a derivative of the pie chart that is a donut chart. |
| 24 | [DropdownMenu](./components/DropdownMenu) | This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items. |
| 25 | [EmojiSelector](./components/EmojiSelector) | The `EmojiSelector` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication. |
| 26 | [FileInput](./components/FileInput) | The `FileInput` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise). |
| 27 | [FileUploadDropZone](./components/FileUploadDropZone) | The `FileUploadDropZone` component allows users to upload files to a web application by dragging and dropping files from their local file system onto a designated area within the UI. |
| 28 | [FlowLayout](./components/FlowLayout) | This layout component is used to position content in rows with an auto wrapping feature: if the length of the items exceed the available space the layout will wrap into a new line. |
| 29 | [Footer](./components/Footer) | The `Footer` is a component that acts as a placeholder within `App`. |
| 30 | [Form](./components/Form) | A `Form` is a fundamental component that displays user interfaces that allow users to input (or change) data and submit it to the app (a server) for further processing. |
| 31 | [FormItem](./components/FormItem) | A `FormItem` component represents a single input element within a `Form`. The value within the `FormItem` may be associated with a particular property within the encapsulating `Form` component's data. |
| 32 | [FormSection](./components/FormSection) | The `FormSection` is a component that groups cohesive elements together within a `Form`. This grouping is indicated visually: the child components of the `FormSection` are placed in a [`FlowLayout`](./FlowLayout.mdx) component. |
| 33 | [Fragment](./components/Fragment) | The `Fragment` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed. |
| 34 | [H1](./components/H1) | Represents a heading level 1 text |
| 35 | [H2](./components/H2) | Represents a heading level 2 text |
| 36 | [H3](./components/H3) | Represents a heading level 3 text |
| 37 | [H4](./components/H4) | Represents a heading level 4 text |
| 38 | [H5](./components/H5) | Represents a heading level 5 text |
| 39 | [H6](./components/H6) | Represents a heading level 6 text |
| 40 | [Heading](./components/Heading) | Represents a heading text |
| 41 | [HSplitter](./components/HSplitter) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. |
| 42 | [HStack](./components/HStack) | This component represents a stack rendering its contents horizontally. |
| 43 | [Icon](./components/Icon) | This component is the representation of an icon. |
| 44 | [Image](./components/Image) | The `Image` component represents or depicts an object, scene, idea, or other concept with a picture. |
| 45 | [Items](./components/Items) | The `Items` component maps sequential data items into component instances, representing each data item as a particular component. |
| 46 | [LabelList](./components/LabelList) | Label list component for a chart component. |
| 47 | [Legend](./components/Legend) | Legend component to be displayed in a chart component. |
| 48 | [LineChart](./components/LineChart) | Represents a line chart component. |
| 49 | [Link](./components/Link) | A `Link` component represents a navigation target within the app or a reference to an external web URL. |
| 50 | [List](./components/List) | The `List` component is a robust layout container that renders associated data items as a list of components. `List` is virtualized; it renders only items that are visible in the viewport. |
| 51 | [Logo](./components/Logo) | The `Logo` component represents a logo or a brand symbol. Usually, you use this component in the [`AppHeader`](./AppHeader.mdx#logotemplate). |
| 52 | [Markdown](./components/Markdown) | `Markdown` displays plain text styled using markdown syntax. |
| 53 | [MenuItem](./components/MenuItem) | This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action. |
| 54 | [MenuSeparator](./components/MenuSeparator) | This component displays a separator line between menu items. |
| 55 | [ModalDialog](./components/ModalDialog) | The `ModalDialog` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action. |
| 56 | [NavGroup](./components/NavGroup) | The `NavGroup` component is a container for grouping related navigation targets (`NavLink` components). It can be displayed as a submenu in the App's UI. |
| 57 | [NavLink](./components/NavLink) | The `NavLink` component defines a navigation target (app navigation menu item) within the app; it is associated with a particular in-app navigation target (or an external link). |
| 58 | [NavPanel](./components/NavPanel) | `NavPanel` is a placeholder within `App` to define the app's navigation (menu) structure. |
| 59 | [NoResult](./components/NoResult) | `NoResult` is a component that displays a visual indication that some data query (search) resulted in no (zero) items. |
| 60 | [NumberBox](./components/NumberBox) | A `NumberBox` component allows users to input numeric values: either integer or floating point numbers. It also accepts empty values, where the stored value will be of type `null`. |
| 61 | [Option](./components/Option) | `Option` is a non-visual component describing a selection option. Other components (such as `Select`, `AutoComplete`, and others) may use nested `Option` instances from which the user can select. |
| 62 | [Page](./components/Page) | The `Page` component defines what content is displayed when the user navigates to a particular URL that is associated with the page. |
| 63 | [PageMetaTitle](./components/PageMetaTitle) | A PageMetaTitle component allows setting up (or changing) the app title to display with the current browser tab. |
| 64 | [Pages](./components/Pages) | The `Pages` component is used as a container for [`Page`](/components/Page) components within an [`App`](/components/App). |
| 65 | [PasswordInput](./components/PasswordInput) | The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords. |
| 66 | [PieChart](./components/PieChart) | Represents a pie chart component. |
| 67 | [ProgressBar](./components/ProgressBar) | A `ProgressBar` component visually represents the progress of a task or process. |
| 68 | [Queue](./components/Queue) | The `Queue` component provides an API to enqueue elements and defines events to process queued elements in a FIFO order. |
| 69 | [RadioGroup](./components/RadioGroup) | The `RadioGroup` input component is a group of radio buttons ([`RadioGroupOption`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time. |
| 70 | [RealTimeAdapter](./components/RealTimeAdapter) | `RealTimeAdapter` is a non-visual component that listens to real-time events through long-polling. |
| 71 | [Redirect](./components/Redirect) | `Redirect` is a component that immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). The redirection works only within the app. |
| 72 | [Select](./components/Select) | Provides a dropdown with a list of options to choose from. |
| 73 | [Slider](./components/Slider) | The `Slider` component allows you to select a numeric value between a range specified by minimum and maximum values. |
| 74 | [SpaceFiller](./components/SpaceFiller) | The `SpaceFiller` is a component that works well in layout containers to fill the remaining (unused) space. Its behavior depends on the layout container in which it is used. |
| 75 | [Spinner](./components/Spinner) | The `Spinner` component is an animated indicator that represents a particular action in progress without a deterministic progress value. |
| 76 | [Splitter](./components/Splitter) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. |
| 77 | [Stack](./components/Stack) | `Stack` is a layout container displaying children in a horizontal or vertical stack. |
| 78 | [StickyBox](./components/StickyBox) | The `StickyBox` is a component that "sticks" or remains fixed at the top or bottom position on the screen as the user scrolls. |
| 79 | [SubMenuItem](./components/SubMenuItem) | This component represents a nested menu item within another menu or menu item. |
| 80 | [Switch](./components/Switch) | The `Switch` component is a user interface element that allows users to toggle between two states: on and off. It consists of a small rectangular or circular button that can be moved left or right to change its state. |
| 81 | [TabItem](./components/TabItem) | `TabItem` is a non-visual component describing a tab. Tabs component may use nested TabItem instances from which the user can select. |
| 82 | [Table](./components/Table) | `Table` is a component that displays cells organized into rows and columns. The `Table` component is virtualized so it only renders visible cells. |
| 83 | [TableOfContents](./components/TableOfContents) | The `TableOfContents` component collects headings and bookmarks within the current page and displays them in a tree representing their hierarchy. When you select an item in this tree, the component navigates the page to the selected position. |
| 84 | [Tabs](./components/Tabs) | The `Tabs` component provides a tabbed layout where each tab has a clickable label and content. |
| 85 | [Text](./components/Text) | The `Text` component displays textual information in a number of optional styles and variants. |
| 86 | [TextArea](./components/TextArea) | `TextArea` is a component that provides a multiline text input area. |
| 87 | [TextBox](./components/TextBox) | The `TextBox` is an input component that allows users to input and edit textual data. |
| 88 | [Theme](./components/Theme) | The `Theme` component provides a way to define a particular theming context for its nested components. The XMLUI framework uses `Theme` to define the default theming context for all of its child components. Theme variables and theme settings only work in this context. |
| 89 | [ToneChangerButton](./components/ToneChangerButton) | The `ToneChangerButton` component is a component that allows the user to change the tone of the app. |
| 90 | [VSplitter](./components/VSplitter) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. |
| 91 | [VStack](./components/VStack) | This component represents a stack rendering its contents vertically. |

