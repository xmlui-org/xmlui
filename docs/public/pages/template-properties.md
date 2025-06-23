# Template Properties

Template properties enable you to define custom markup for specific parts of components using the `<property name="templateName">` syntax.


## App Components

| Component | Template | Description |
|-----------|----------|-------------|
| [App](/components/App) | [`logoTemplate`](/components/App#logotemplate) | Optional template for the app logo |
| [AppHeader](/components/AppHeader) | [`logoTemplate`](/components/AppHeader#logotemplate) | Template for the header logo |
| [AppHeader](/components/AppHeader) | [`profileMenuTemplate`](/components/AppHeader#profilemenutemplate) | Template for the profile menu area |
| [AppHeader](/components/AppHeader) | [`titleTemplate`](/components/AppHeader#titletemplate) | Template for the header title |
| [NavPanel](/components/NavPanel) | [`logoTemplate`](/components/NavPanel#logotemplate) | Template for the navigation panel logo (in vertical layouts) |

## Form Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Form](/components/Form) | [`buttonRowTemplate`](/components/Form#buttonrowtemplate) | Template for the form's button row/actions area |
| [FormItem](/components/FormItem) | [`inputTemplate`](/components/FormItem#inputtemplate) | Template for custom form input components |
| [Checkbox](/components/Checkbox) | [`inputTemplate`](/components/Checkbox#inputtemplate) | Template for custom checkbox input display |

## Data Display Components

| Component | Template | Description |
|-----------|----------|-------------|
| [List](/components/List) | [`itemTemplate`](/components/List#itemtemplate) | Template for individual list items |
| [List](/components/List) | [`groupHeaderTemplate`](/components/List#groupheadertemplate) | Template for group headers in grouped lists |
| [List](/components/List) | [`groupFooterTemplate`](/components/List#groupfootertemplate) | Template for group footers in grouped lists |
| [List](/components/List) | [`emptyListTemplate`](/components/List#emptylisttemplate) | Template displayed when list is empty |
| [Items](/components/Items) | [`itemTemplate`](/components/Items#itemtemplate) | Template for displaying each data item |
| [Table](/components/Table) | [`noDataTemplate`](/components/Table#nodatatemplate) | Template displayed when table has no data |

## Selection Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Select](/components/Select) | [`optionTemplate`](/components/Select#optiontemplate) | Template for dropdown option display |
| [Select](/components/Select) | [`optionLabelTemplate`](/components/Select#optionlabeltemplate) | Template for option labels |
| [Select](/components/Select) | [`valueTemplate`](/components/Select#valuetemplate) | Template for selected value display |
| [Select](/components/Select) | [`emptyListTemplate`](/components/Select#emptylisttemplate) | Template displayed when no options available |
| [AutoComplete](/components/AutoComplete) | [`optionTemplate`](/components/AutoComplete#optiontemplate) | Template for autocomplete option display |
| [AutoComplete](/components/AutoComplete) | [`emptyListTemplate`](/components/AutoComplete#emptylisttemplate) | Template displayed when no suggestions available |
| [Option](/components/Option) | [`optionTemplate`](/components/Option#optiontemplate) | Template for custom option content |

## Interactive Components

| Component | Template | Description |
|-----------|----------|-------------|
| [DropdownMenu](/components/DropdownMenu) | [`triggerTemplate`](/components/DropdownMenu#triggertemplate) | Template for the dropdown trigger element |
| [SubMenuItem](/components/SubMenuItem) | [`triggerTemplate`](/components/SubMenuItem#triggertemplate) | Template for submenu trigger appearance |
| [Tabs](/components/Tabs) | [`tabTemplate`](/components/Tabs#tabtemplate) | Template for the clickable tab area |

## Layout Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Splitter](/components/Splitter) | [`splitterTemplate`](/components/Splitter#splittertemplate) | Template for the splitter handle/divider |
| [Backdrop](/components/Backdrop) | [`overlayTemplate`](/components/Backdrop#overlaytemplate) | Template for optional overlay content |

## Utility Components

| Component | Template | Description |
|-----------|----------|-------------|
| [Queue](/components/Queue) | [`progressFeedback`](/components/Queue#progressfeedback) | Template for progress reporting UI |
| [Queue](/components/Queue) | [`resultFeedback`](/components/Queue#resultfeedback) | Template for result summary when queue completes |

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

