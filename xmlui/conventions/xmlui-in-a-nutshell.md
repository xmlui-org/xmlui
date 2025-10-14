# XMLUI in a Nutshell

A comprehensive guide to understanding the XMLUI framework, its architecture, core concepts, and key features.

## Overview

**XMLUI** is a declarative UI framework for building web applications using XML markup with minimal JavaScript. It emphasizes simplicity, allowing developers to create modern web applications with little to no knowledge of React or CSS while leveraging the power of reactive data binding.

### Core Philosophy
- **Declarative approach**: Build UIs by describing what you want, not how to achieve it
- **Minimal scripting**: Most functionality achieved through markup and expressions
- **Reactive by default**: Automatic data binding and UI updates
- **Theme-driven**: Comprehensive theming system for consistent, professional appearance
- **Component-based**: Modular architecture with reusable custom components

## Project Structure

### Typical XMLUI Application Structure
```
app-root/
├── index.html              # Entry point HTML file
├── Main.xmlui              # Main application component
├── config.json             # Application configuration
├── components/             # Custom components directory
│   ├── ClientDetails.xmlui
│   ├── CustomForm.xmlui
│   └── ...
├── resources/             # Static assets
│   ├── favicon.ico
│   ├── images/
│   └── ...
├── themes/               # Custom themes
│   └── custom.json
├── xmlui/               # XMLUI framework files
│   ├── 0.9.23.js        # Core framework (versioned)
│   └── charts-0.1.21.js # Extensions
└── start.sh/bat         # Development server scripts
```

### Key Files
- **`index.html`**: Contains the HTML scaffold and loads the XMLUI engine
- **`Main.xmlui`**: The application's root component defining navigation and pages
- **`config.json`**: Application configuration including routing settings and global variables
- **`components/`**: Directory containing custom reusable components
- **`themes/`**: Custom theme definitions for styling

## Core Concepts

### 1. Components and Markup

XMLUI uses XML markup where tags represent components and attributes set properties:

```xml
<Text value="Hello World" />
<Text value="Dynamic: {6 * 7}" />
<Button label="Click me" onClick="handleClick()" />
```

#### Built-in Component Categories
- **Data**: `AppState`, `DataSource`, `APICall`
- **Display**: `Avatar`, `Card`, `Heading`, `Image`, `Icon`, `Markdown`, `Text`, `Table`
- **Input**: `Checkbox`, `DatePicker`, `Form`, `FormItem`, `NumberBox`, `Select`, `TextBox`
- **Layout**: `FlowLayout`, `HStack`, `VStack`, `Stack`
- **Navigation**: `DropdownMenu`, `MenuItem`, `NavLink`, `NavPanel`, `Tabs`

### 2. Reactive Data Binding

XMLUI implements automatic reactive data binding similar to spreadsheets or React:

```xml
<Select id="lines" initialValue="bakerloo">
  <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
    <Option value="{$item.id}" label="{$item.name}" />
  </Items>
</Select>

<DataSource
  id="tubeStations"
  when="{lines.value}"
  url="https://api.tfl.gov.uk/Line/{lines.value}/StopPoints"
/>

<Table data="{tubeStations}">
  <Column bindTo="name" />
  <Column bindTo="zone" />
</Table>
```

When `lines.value` changes, the DataSource automatically refetches, and the Table updates.

### 3. Context Variables

XMLUI provides several context variables for different scopes:

| Variable | Scope | Description |
|----------|-------|-------------|
| `myComponentId` | General | Reference to component instance |
| `var.myVar` | General | Scoped variables |
| `$item` | Iterators | Current item in loops |
| `$itemIndex` | Iterators | Current index in loops |
| `$param` | Event handlers | Event payload data |
| `$data` | Forms | Complete form data object |
| `$value` | FormItem | Current field value |
| `$pathname` | Page | Current route path |
| `$routeParams` | Page | Route parameter values |
| `$queryParams` | Page | Query string parameters |

### 4. Variables and Expressions

Variables can be declared using `var.` prefix or `<variable>` tags:

```xml
<App var.count="{0}">
  <Button onClick="count++" label="Increment" />
  <Text>Count: {count}</Text>
</App>

<!-- Alternative syntax -->
<App>
  <variable name="stations" value="{['Central', 'Bakerloo']}" />
  <Items data="{stations}">
    <Text>{$item}</Text>
  </Items>
</App>
```

Expressions use JavaScript syntax within curly braces:
- Simple expressions: `{6 * 7}`
- Object literals: `{{name: 'John', age: 30}}`
- Function calls: `{myFunction(param)}`
- Arrow functions: `{() => console.log('clicked')}`

## Data Management

### DataSource Component
Central to XMLUI's data handling, supports:
- REST API calls with automatic reactive updates
- Data transformation via `transformResult`
- Conditional loading with `when` attribute
- Result selection with `resultSelector`

```xml
<DataSource
  id="users"
  url="/api/users"
  transformResult="{window.processUsers}"
  when="{shouldLoadUsers}"
  resultSelector="data"
/>
```

### API Integration
XMLUI provides comprehensive API integration:
- `APICall` component for imperative calls
- `Actions.callApi()` for programmatic API calls
- Built-in loading states and error handling
- Optimistic updates and caching

### Form Handling
Sophisticated form management without manual state handling:

```xml
<Form data="{{name: '', email: ''}}" onSubmit="handleSubmit">
  <FormItem bindTo="name" label="Name" />
  <FormItem bindTo="email" label="Email" type="email" />
</Form>
```

#### FormItem Types
- `text` (default), `email`, `password`, `number`, `integer`
- `checkbox`, `radio`, `select`, `multiselect`
- `textarea`, `date`, `time`, `datetime`
- `file`, `color`, `range`

## Layout System

### Layout Components
- **`HStack`**: Horizontal layout (flex-row)
- **`VStack`**: Vertical layout (flex-column) 
- **`FlowLayout`**: Responsive wrapping layout
- **`Stack`**: Basic container

### Sizing System
- **Pixel values**: `width="200px"`
- **Percentages**: `width="50%"`
- **Star sizing**: `width="*"` (flexible proportional)
- **Combined**: `width="2*"` (takes 2 parts of available space)

### Layout Properties
- **Alignment**: `horizontalAlignment`, `verticalAlignment`
- **Spacing**: `gap`, `padding`, `margin`
- **Direction**: `direction="rtl"` for right-to-left layouts
- **Overflow**: Automatic scrollbars when content exceeds viewport

## Routing and Navigation

### Route Configuration
XMLUI supports both hash-based (default) and standard routing:

```xml
<App>
  <NavPanel>
    <NavLink label="Home" to="/home" />
    <NavLink label="Users" to="/users" />
  </NavPanel>
  
  <Pages>
    <Page url="/home">
      <Home />
    </Page>
    <Page url="/users/:id?">
      <UserDetail />
    </Page>
  </Pages>
</App>
```

### Navigation Context
- `$pathname`: Current route path
- `$routeParams`: URL parameters (e.g., `:id`)
- `$queryParams`: Query string parameters
- `$linkInfo`: Navigation context with previous/next

### Route Configuration Options
```json
{
  "appGlobals": {
    "useHashBasedRouting": false
  }
}
```

## Custom Components

### Component Definition
Custom components live in the `components/` directory:

```xml
<!-- components/TubeStops.xmlui -->
<Component name="TubeStops">
  <DataSource
    id="stops"
    when="{$props.line}"
    url="https://api.tfl.gov.uk/Line/{$props.line}/StopPoints"
  />
  
  <Text variant="strong">{$props.line}</Text>
  <Table data="{stops}">
    <Column bindTo="name" />
    <Column bindTo="zone" />
  </Table>
</Component>
```

### Component Usage
```xml
<TubeStops line="bakerloo" />
<TubeStops line="central" />
```

### Component Benefits
- **Property handling**: Receive data via `$props`
- **Data transformation**: Clean up complex API responses
- **Encapsulation**: Self-contained functionality
- **Reusability**: Use across multiple pages/contexts

## Theming and Styling

### Theme System
XMLUI uses comprehensive JSON-based theming:

```json
{
  "name": "Custom Theme",
  "colors": {
    "primary": "#007acc",
    "secondary": "#6c757d",
    "success": "#28a745"
  },
  "typography": {
    "fontFamily": "Segoe UI, sans-serif",
    "fontSize": "14px"
  },
  "spacing": {
    "small": "8px",
    "medium": "16px",
    "large": "24px"
  }
}
```

### Style Properties
Components support styling through attributes:
- `backgroundColor`, `color`, `border`
- `padding`, `margin`, `gap`
- `fontSize`, `fontWeight`, `textAlign`
- `width`, `height`, `minWidth`, `maxHeight`

### Variants
Many components support semantic variants:
```xml
<Text variant="strong">Bold text</Text>
<Button variant="primary">Primary action</Button>
<Card variant="outlined">Bordered card</Card>
```

## Advanced Features

### Modal Dialogs
Support both declarative and imperative usage:

```xml
<!-- Declarative -->
<ModalDialog when="{showDialog}" onClose="showDialog = false">
  Content here
</ModalDialog>

<!-- Imperative -->
<ModalDialog id="dialog">
  Content here
</ModalDialog>
<Button onClick="dialog.open()" label="Open" />
```

### Global Functions and Actions
XMLUI provides global utilities:

```javascript
// API calls
Actions.callApi({method: 'post', url: '/api/users', body: userData});

// File operations  
Actions.download({url: '/api/report', fileName: 'report.pdf'});
Actions.upload({file: selectedFile, url: '/api/upload'});

// Navigation
navigate('/users/123');
goBack();

// Notifications
toast.success('Operation completed');
toast.error('Something went wrong');
```

### Validation
Built-in form validation with customizable messages:

```xml
<FormItem
  bindTo="email"
  type="email"
  required="true"
  requiredMessage="Email is required"
  invalidMessage="Please enter a valid email"
/>
```

### Conditional Rendering
Multiple approaches for conditional display:

```xml
<!-- Fragment with when attribute -->
<Fragment when="{user.isAdmin}">
  <Button label="Admin Panel" />
</Fragment>

<!-- Component-level when -->
<Text when="{items.length > 0}" value="Found {items.length} items" />

<!-- Ternary in expressions -->
<Text value="{user.isOnline ? 'Online' : 'Offline'}" />
```

## Scripting and JavaScript Integration

### Expression Types
- **Inline expressions**: `{count + 1}`
- **Event handlers**: `onClick="handleClick()"`
- **Object literals**: `data="{{name: 'John'}}"`
- **Function definitions**: Arrow functions in attributes

### Script Blocks
For complex logic, use script blocks in components:

```xml
<Component name="MyComponent">
  <script>
    function processData(items) {
      return items.filter(item => item.active)
        .map(item => ({...item, displayName: item.firstName + ' ' + item.lastName}));
    }
  </script>
  
  <!-- Use the function in markup -->
  <DataSource url="/api/users" transformResult="{processData}" />
</Component>
```

### Global Integration
Access global browser APIs and XMLUI utilities:
- `window` object for browser APIs
- `console` for debugging
- `fetch` for custom HTTP calls
- XMLUI globals like `Actions`, `toast`, `navigate`

## Development and Debugging

### Development Server
XMLUI includes a test server for development:
```bash
# Start development server
./start.sh    # Mac/Linux
start.bat     # Windows
```

### Debugging Techniques
```xml
<!-- Display data structures -->
<Text preserveLinebreaks="true">
  {JSON.stringify(userData, null, 2)}
</Text>

<!-- Console logging in handlers -->
<Button onClick="console.log('Debug:', userData)" />

<!-- Script-based debugging -->
<script>
  function debug(msg, data) {
    console.log(msg, data);
  }
</script>
```

### Error Handling
- Built-in validation display in forms
- API error handling via `onError` callbacks
- Loading states automatically managed
- Network failure graceful degradation

## Deployment

### Static Deployment
XMLUI applications deploy as static files:
1. Copy all files to web server
2. Configure server to serve `index.html` for all routes (SPA)
3. Set appropriate cache headers for static assets

### Server Configuration Example (nginx)
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Production Considerations
- Use versioned XMLUI files (e.g., `0.9.23.js`)
- Configure CDN for static assets
- Enable compression for `.js` and `.json` files
- Set appropriate cache headers

## Extension Packages

XMLUI supports extension packages for additional functionality:
- **xmlui-charts**: Charting components (LineChart, BarChart, PieChart)
- **xmlui-pdf**: PDF generation and display
- **xmlui-spreadsheet**: Spreadsheet components
- **xmlui-animations**: Animation utilities
- **xmlui-search**: Advanced search components

### Using Extensions
```html
<script src="xmlui/0.9.23.js"></script>
<script src="xmlui/charts-0.1.21.js"></script>
```

```xml
<LineChart data="{salesData}" xField="month" yField="revenue" />
```

## Best Practices

### Component Design
1. **Single responsibility**: Each component should have one clear purpose
2. **Property-driven**: Accept configuration via props rather than hardcoding
3. **Data transformation**: Handle complex API responses in components
4. **Reusable**: Design for use across different contexts

### Data Management
1. **Centralize data sources**: Use DataSource components for shared data
2. **Transform at source**: Clean up data in `transformResult` functions
3. **Leverage reactivity**: Let XMLUI handle data flow automatically
4. **Cache appropriately**: Use DataSource caching for expensive operations

### Performance
1. **Conditional loading**: Use `when` attributes to avoid unnecessary requests
2. **Efficient expressions**: Keep expressions simple and fast
3. **Minimize re-renders**: Structure data to minimize cascading updates
4. **Optimize images**: Use appropriate formats and sizes in resources

### Code Organization
1. **Consistent naming**: Use clear, descriptive names for components and variables
2. **Logical structure**: Organize components by feature or domain
3. **Documentation**: Comment complex expressions and transformations
4. **Version management**: Use versioned XMLUI files for stability

This comprehensive guide covers the essential aspects of XMLUI framework architecture, core concepts, and practical usage patterns that developers need to understand when working with XMLUI applications.