
## Components Overview

| Num | Component | Description | Status |
| :---: | :---: | --- | :---: |
| 1 | [APICall](./components/APICall.md) | `APICall` is used to mutate (create, update or delete) some data on the backend. It is similar in nature to the `DataSource` component which retrieves data from the backend. | stable |
| 2 | [App](./components/App.md) | The `App` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates, `App` allows you to display your preferred layout. | stable |
| 3 | [AppHeader](./components/AppHeader.md) | `AppHeader` is a placeholder within `App` to define a custom application header. | experimental |
| 4 | [AppState](./components/AppState.md) | AppState is a functional component (without a visible user interface) that helps store and manage the app's state. | stable |
| 5 | [AutoComplete](./components/AutoComplete.md) | This component is a dropdown with a list of options. According to the `multi` property, the user can select one or more items. | experimental |
| 6 | [Avatar](./components/Avatar.md) | The `Avatar` component represents a user, group (or other entity's) avatar with a small image or initials. | stable |
| 7 | [Backdrop](./components/Backdrop.md) | The `Backdrop` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it. | stable |
| 8 | [Badge](./components/Badge.md) | The `Badge` is a text label that accepts a color map to define its background color and, optionally, its label color. | stable |
| 9 | [Bookmark](./components/Bookmark.md) | As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location. | stable |
| 10 | [Breakout](./components/Breakout.md) | The `Breakout` component creates a breakout section. It allows its child to occupy the entire width of the UI even if the app or the parent container constrains the maximum content width. | stable |
| 11 | [Button](./components/Button.md) | Button is an interactive element that triggers an action when clicked. | stable |
| 12 | [Card](./components/Card.md) | The `Card` component is a container for cohesive elements, often rendered visually as a card. | stable |
| 13 | [ChangeListener](./components/ChangeListener.md) | `ChangeListener` is a functional component (it renders no UI) to trigger an action when a particular value (component property, state, etc.) changes. | stable |
| 14 | [Checkbox](./components/Checkbox.md) | The `Checkbox` component allows users to make binary choices, typically between checked or unchecked. It consists of a small box that can be toggled on or off by clicking on it. | stable |
| 15 | [CHStack](./components/CHStack.md) | This component represents a stack that renders its contents horizontally and aligns that in the center along both axes. | stable |
| 16 | [ColorPicker](./components/ColorPicker.md) | This component allows the user to select a color with the browser's default color picker control. | stable |
| 17 | [Column](./components/Column.md) | The `Column` component can be used within a `Table` to define a particular table column's visual properties and data bindings. | stable |
| 18 | [ContentSeparator](./components/ContentSeparator.md) | A `ContentSeparator` is a component that divides or separates content visually within a layout. It serves as a visual cue to distinguish between different sections or groups of content, helping to improve readability and organization. | stable |
| 19 | [CVStack](./components/CVStack.md) | This component represents a stack that renders its contents vertically and aligns that in the center along both axes. | stable |
| 20 | [DataSource](./components/DataSource.md) | The `DataSource` component manages fetching data from an API endpoint. This component automatically manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the [`APICall`](./APICall.mdx) component. | stable |
| 21 | [DatePicker](./components/DatePicker.md) | A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display. | experimental |
| 22 | [DropdownMenu](./components/DropdownMenu.md) | This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items. | stable |
| 23 | [EmojiSelector](./components/EmojiSelector.md) | The `EmojiSelector` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication. | experimental |
| 24 | [FileInput](./components/FileInput.md) | The `FileInput` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise). | experimental |
| 25 | [FileUploadDropZone](./components/FileUploadDropZone.md) | The `FileUploadDropZone` component allows users to upload files to a web application by dragging and dropping files from their local file system onto a designated area within the UI. | stable |
| 26 | [FlowLayout](./components/FlowLayout.md) | This layout component is used to position content in rows with an auto wrapping feature: if the length of the items exceed the available space the layout will wrap into a new line. | stable |
| 27 | [Footer](./components/Footer.md) | The `Footer` is a component that acts as a placeholder within `App`. | stable |
| 28 | [Form](./components/Form.md) | A `Form` is a fundamental component that displays user interfaces that allow users to input (or change) data and submit it to the app (a server) for further processing. | experimental |
| 29 | [FormItem](./components/FormItem.md) | A `FormItem` component represents a single input element within a `Form`. The value within the `FormItem` may be associated with a particular property within the encapsulating `Form` component's data. | experimental |
| 30 | [FormSection](./components/FormSection.md) | The `FormSection` is a component that groups cohesive elements together within a `Form`. This grouping is indicated visually: the child components of the `FormSection` are placed in a [`FlowLayout`](./FlowLayout.mdx) component. | experimental |
| 31 | [Fragment](./components/Fragment.md) | The `Fragment` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed. | stable |
| 32 | [H1](./components/H1.md) | Represents a heading level 1 text | stable |
| 33 | [H2](./components/H2.md) | Represents a heading level 2 text | stable |
| 34 | [H3](./components/H3.md) | Represents a heading level 3 text | stable |
| 35 | [H4](./components/H4.md) | Represents a heading level 4 text | stable |
| 36 | [H5](./components/H5.md) | Represents a heading level 5 text | stable |
| 37 | [H6](./components/H6.md) | Represents a heading level 6 text | stable |
| 38 | [Heading](./components/Heading.md) | Represents a heading text | stable |
| 39 | [HSplitter](./components/HSplitter.md) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. | stable |
| 40 | [HStack](./components/HStack.md) | This component represents a stack rendering its contents horizontally. | stable |
| 41 | [Icon](./components/Icon.md) | This component is the representation of an icon. | experimental |
| 42 | [Image](./components/Image.md) | The `Image` component represents or depicts an object, scene, idea, or other concept with a picture. | stable |
| 43 | [Items](./components/Items.md) | The `Items` component maps sequential data items into component instances, representing each data item as a particular component. | stable |
| 44 | [Link](./components/Link.md) | A `Link` component represents a navigation target within the app or a reference to an external web URL. | stable |
| 45 | [List](./components/List.md) | The `List` component is a robust layout container that renders associated data items as a list of components. `List` is virtualized; it renders only items that are visible in the viewport. | experimental |
| 46 | [Logo](./components/Logo.md) | The `Logo` component represents a logo or a brand symbol. Usually, you use this component in the [`AppHeader`](./AppHeader.mdx#logotemplate). | experimental |
| 47 | [Markdown](./components/Markdown.md) | `Markdown` displays plain text styled using markdown syntax. | stable |
| 48 | [MenuItem](./components/MenuItem.md) | This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action. | stable |
| 49 | [MenuSeparator](./components/MenuSeparator.md) | This component displays a separator line between menu items. | stable |
| 50 | [ModalDialog](./components/ModalDialog.md) | The `ModalDialog` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action. | stable |
| 51 | [NavGroup](./components/NavGroup.md) | The `NavGroup` component is a container for grouping related navigation targets (`NavLink` components). It can be displayed as a submenu in the App's UI. | stable |
| 52 | [NavLink](./components/NavLink.md) | The `NavLink` component defines a navigation target (app navigation menu item) within the app; it is associated with a particular in-app navigation target (or an external link). | stable |
| 53 | [NavPanel](./components/NavPanel.md) | `NavPanel` is a placeholder within `App` to define the app's navigation (menu) structure. | stable |
| 54 | [NoResult](./components/NoResult.md) | `NoResult` is a component that displays a visual indication that some data query (search) resulted in no (zero) items. | stable |
| 55 | [NumberBox](./components/NumberBox.md) | A `NumberBox` component allows users to input numeric values: either integer or floating point numbers. It also accepts empty values, where the stored value will be of type `null`. | experimental |
| 56 | [Option](./components/Option.md) | `Option` is a non-visual component describing a selection option. Other components (such as `Select`, `AutoComplete`, and others) may use nested `Option` instances from which the user can select. | stable |
| 57 | [Page](./components/Page.md) | The `Page` component defines what content is displayed when the user navigates to a particular URL that is associated with the page. | stable |
| 58 | [PageMetaTitle](./components/PageMetaTitle.md) | A PageMetaTitle component allows setting up (or changing) the app title to display with the current browser tab. | stable |
| 59 | [Pages](./components/Pages.md) | The `Pages` component is used as a container for [`Page`](./Page.mdx) components within an [`App`](./App.mdx). | stable |
| 60 | [PasswordInput](./components/PasswordInput.md) | The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords. | experimental |
| 61 | [ProgressBar](./components/ProgressBar.md) | A `ProgressBar` component visually represents the progress of a task or process. | stable |
| 62 | [Queue](./components/Queue.md) | The `Queue` component provides an API to enqueue elements and defines events to process queued elements in a FIFO order. | stable |
| 63 | [RadioGroup](./components/RadioGroup.md) | The `RadioGroup` input component is a group of radio buttons ([`RadioGroupOption`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time. | stable |
| 64 | [RealTimeAdapter](./components/RealTimeAdapter.md) | `RealTimeAdapter` is a non-visual component that listens to real-time events through long-polling. | experimental |
| 65 | [Redirect](./components/Redirect.md) | `Redirect` is a component that immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). The redirection works only within the app. | stable |
| 66 | [Select](./components/Select.md) | Provides a dropdown with a list of options to choose from. | experimental |
| 67 | [Slider](./components/Slider.md) | The `Slider` component allows you to select a numeric value between a range specified by minimum and maximum values. | experimental |
| 68 | [SpaceFiller](./components/SpaceFiller.md) | The `SpaceFiller` is a component that works well in layout containers to fill the remaining (unused) space. Its behavior depends on the layout container in which it is used. | stable |
| 69 | [Spinner](./components/Spinner.md) | The `Spinner` component is an animated indicator that represents a particular action in progress without a deterministic progress value. | stable |
| 70 | [Splitter](./components/Splitter.md) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. | stable |
| 71 | [Stack](./components/Stack.md) | `Stack` is a layout container displaying children in a horizontal or vertical stack. | stable |
| 72 | [StickyBox](./components/StickyBox.md) | The `StickyBox` is a component that "sticks" or remains fixed at the top or bottom position on the screen as the user scrolls. | experimental |
| 73 | [SubMenuItem](./components/SubMenuItem.md) | This component represents a nested menu item within another menu or menu item. | stable |
| 74 | [Switch](./components/Switch.md) | The `Switch` component is a user interface element that allows users to toggle between two states: on and off. It consists of a small rectangular or circular button that can be moved left or right to change its state. | stable |
| 75 | [TabItem](./components/TabItem.md) | `TabItem` is a non-visual component describing a tab. Tabs component may use nested TabItem instances from which the user can select. | stable |
| 76 | [Table](./components/Table.md) | `Table` is a component that displays cells organized into rows and columns. The `Table` component is virtualized so it only renders visible cells. | stable |
| 77 | [TableOfContents](./components/TableOfContents.md) | The `TableOfContents` component collects headings and bookmarks within the current page and displays them in a tree representing their hierarchy. When you select an item in this tree, the component navigates the page to the selected position. | experimental |
| 78 | [Tabs](./components/Tabs.md) | The `Tabs` component provides a tabbed layout where each tab has a clickable label and content. | experimental |
| 79 | [Text](./components/Text.md) | The `Text` component displays textual information in a number of optional styles and variants. | stable |
| 80 | [TextArea](./components/TextArea.md) | `TextArea` is a component that provides a multiline text input area. | experimental |
| 81 | [TextBox](./components/TextBox.md) | The `TextBox` is an input component that allows users to input and edit textual data. | experimental |
| 82 | [Theme](./components/Theme.md) | The `Theme` component provides a way to define a particular theming context for its nested components. The XMLUI framework uses `Theme` to define the default theming context for all of its child components. Theme variables and theme settings only work in this context. | stable |
| 83 | [ToneChangerButton](./components/ToneChangerButton.md) | The `ToneChangerButton` component is a component that allows the user to change the tone of the app. | experimental |
| 84 | [VSplitter](./components/VSplitter.md) | The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections. | stable |
| 85 | [VStack](./components/VStack.md) | This component represents a stack rendering its contents vertically. | stable |
