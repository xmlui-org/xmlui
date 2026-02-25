# Template Properties

Template properties enable you to define custom markup for specific parts of components using the `<property name="templateName">` syntax.


## App Components

| Component | Template | Description |
|-----------|----------|-------------|
| [App](/docs/reference/components/App) | [`logoTemplate`](/docs/reference/components/App#logotemplate) | Optional template for the app logo |
| [AppHeader](/docs/reference/components/AppHeader) | [`logoTemplate`](/docs/reference/components/AppHeader#logotemplate) | Template for the header logo |
| [AppHeader](/docs/reference/components/AppHeader) | [`profileMenuTemplate`](/docs/reference/components/AppHeader#profilemenutemplate) | Template for the profile menu area |
| [AppHeader](/docs/reference/components/AppHeader) | [`titleTemplate`](/docs/reference/components/AppHeader#titletemplate) | Template for the header title |
| [NavPanel](/docs/reference/components/NavPanel) | [`logoTemplate`](/docs/reference/components/NavPanel#logotemplate) | Template for the navigation panel logo (in vertical layouts) |

## Form Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Form](/docs/reference/components/Form) | [`buttonRowTemplate`](/docs/reference/components/Form#buttonrowtemplate) | Template for the form's button row/actions area |
| [FormItem](/docs/reference/components/FormItem) | [`inputTemplate`](/docs/reference/components/FormItem#inputtemplate) | Template for custom form input components |
| [Checkbox](/docs/reference/components/Checkbox) | [`inputTemplate`](/docs/reference/components/Checkbox#inputtemplate) | Template for custom checkbox input display |

## Data Display Components

| Component | Template | Description |
|-----------|----------|-------------|
| [List](/docs/reference/components/List) | [`itemTemplate`](/docs/reference/components/List#itemtemplate) | Template for individual list items |
| [List](/docs/reference/components/List) | [`groupHeaderTemplate`](/docs/reference/components/List#groupheadertemplate) | Template for group headers in grouped lists |
| [List](/docs/reference/components/List) | [`groupFooterTemplate`](/docs/reference/components/List#groupfootertemplate) | Template for group footers in grouped lists |
| [List](/docs/reference/components/List) | [`emptyListTemplate`](/docs/reference/components/List#emptylisttemplate) | Template displayed when list is empty |
| [Items](/docs/reference/components/Items) | [`itemTemplate`](/docs/reference/components/Items#itemtemplate) | Template for displaying each data item |
| [Table](/docs/reference/components/Table) | [`noDataTemplate`](/docs/reference/components/Table#nodatatemplate) | Template displayed when table has no data |
| [BarChart](/docs/reference/components/Charts/BarChart) | [`tooltipTemplate`](/docs/reference/components/Charts/BarChart#tooltiptemplate) | Template for custom tooltip content |
| [LineChart](/docs/reference/components/Charts/LineChart) | [`tooltipTemplate`](/docs/reference/components/Charts/LineChart#tooltiptemplate) | Template for custom tooltip content |

## Selection Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Select](/docs/reference/components/Select) | [`optionTemplate`](/docs/reference/components/Select#optiontemplate) | Template for dropdown option display |
| [Select](/docs/reference/components/Select) | [`optionLabelTemplate`](/docs/reference/components/Select#optionlabeltemplate) | Template for option labels |
| [Select](/docs/reference/components/Select) | [`valueTemplate`](/docs/reference/components/Select#valuetemplate) | Template for selected value display |
| [Select](/docs/reference/components/Select) | [`emptyListTemplate`](/docs/reference/components/Select#emptylisttemplate) | Template displayed when no options available |
| [AutoComplete](/docs/reference/components/AutoComplete) | [`optionTemplate`](/docs/reference/components/AutoComplete#optiontemplate) | Template for autocomplete option display |
| [AutoComplete](/docs/reference/components/AutoComplete) | [`emptyListTemplate`](/docs/reference/components/AutoComplete#emptylisttemplate) | Template displayed when no suggestions available |
| [Option](/docs/reference/components/Option) | [`optionTemplate`](/docs/reference/components/Option#optiontemplate) | Template for custom option content |

## Interactive Components

| Component | Template | Description |
|-----------|----------|-------------|
| [DropdownMenu](/docs/reference/components/DropdownMenu) | [`triggerTemplate`](/docs/reference/components/DropdownMenu#triggertemplate) | Template for the dropdown trigger element |
| [SubMenuItem](/docs/reference/components/SubMenuItem) | [`triggerTemplate`](/docs/reference/components/SubMenuItem#triggertemplate) | Template for submenu trigger appearance |
| [Tabs](/docs/reference/components/Tabs) | [`tabTemplate`](/docs/reference/components/Tabs#tabtemplate) | Template for the clickable tab area |

## Layout Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Splitter](/docs/reference/components/Splitter) | [`splitterTemplate`](/docs/reference/components/Splitter#splittertemplate) | Template for the splitter handle/divider |
| [Backdrop](/docs/reference/components/Backdrop) | [`overlayTemplate`](/docs/reference/components/Backdrop#overlaytemplate) | Template for optional overlay content |

## Utility Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Queue](/docs/reference/components/Queue) | [`progressFeedback`](/docs/reference/components/Queue#progressfeedback) | Template for progress reporting UI |
| [Queue](/docs/reference/components/Queue) | [`resultFeedback`](/docs/reference/components/Queue#resultfeedback) | Template for result summary when queue completes |

## Usage Patterns

### Basic
```xmlui
<List data="{items}">
  <property name="itemTemplate">
    <Text>{$item.name}</Text>
  </property>
</List>
```

### Multiple
```xmlui
<List data="{groupedItems}">
  <property name="groupHeaderTemplate">
    <H3>{$item.group}</H3>
  </property>
  <property name="itemTemplate">
    <Text>{$item.name}</Text>
  </property>
  <property name="emptyListTemplate">
    <Text color="muted">No items found</Text>
  </property>
</List>
```

### Alternative children syntax
Some components allow using children as templates instead of explicit template properties:
```xmlui
<!-- Using template property -->
<List data="{items}">
  <property name="itemTemplate">
    <Text>{$item}</Text>
  </property>
</List>

<!-- Using children as template -->
<List data="{items}">
  <Text>{$item}</Text>
</List>
```

