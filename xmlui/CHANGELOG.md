# xmlui

## 0.11.19

### Patch Changes

- c649cd5: fix: portal issue - AutoComplete, DatePicker
- d9d98d3: test: add nested DropdownMenu and Select/AutoComplete component interaction tests
- 60399c6: Fix the showHeadingAnchors issue with numbered markdown headings

## 0.11.18

### Patch Changes

- 0eaa966: consolidate radix dependency versions, fix ModalDialog, Select, DropdownMenu nesting

## 0.11.17

### Patch Changes

- f11267b: fix: dropdownmenu issue in a dialog

## 0.11.16

### Patch Changes

- 212c7ad: Fix StateContainer issue with updateState

## 0.11.15

### Patch Changes

- 8b1f851: Fix inaccurate ResponsiveBar e2e test

## 0.11.14

### Patch Changes

- d4e05af: Review ResponsiveBar and ContentSeparator
- 7276755: The return value of the Form willSubmit event can set the data to submit

## 0.11.13

### Patch Changes

- 225a580: Review NavLink theme varaible defaults
- 5e9bd24: Fix null value handling in TextBox

## 0.11.12

### Patch Changes

- cef5d43: fix: DropdownMenu - portal issue
- a9e3115: Modify behaviors to use extractValue on attached properties
- 72d968e: Fix clearable issue with DateInput (and TimeInput)

## 0.11.11

### Patch Changes

- d32fef2: New themes created: xmlui-docs, xmlui-blog, xmlui-web
- c882b72: The "contextVars" warning with inspect="true" is fixed

## 0.11.10

### Patch Changes

- 741f760: refactor: rename size prop to thickness and add length prop in ContentSeparator

## 0.11.9

### Patch Changes

- 9c42826: Add noIndicator property to NavLink and NavGroup

## 0.11.8

### Patch Changes

- e25ea5b: Add nonSticky property to Footer
- 6f11265: feat: formatter puts ">", "/>" on a newline for long tag.
- 53c383c: Remove the experimental Choose component

## 0.11.7

### Patch Changes

- de17ae1: Add the Choose component to xmlui
- dc3d889: Fix long text handling in markdown and dialogs

## 0.11.6

### Patch Changes

- f9ac95e: Fix the variant behavior. It uses a React component now.
- 097783b: Fixed Table row deselection if multiple row selections are disabled.
- 0bace0a: Add clearable property to Select
- 07b1a3d: Add a new layout, "desktop", to App
- 0bace0a: Add padding theme vars to ContentSeparator
- 0bace0a: Review Select fontSize and minHeight theme variables

## 0.11.5

### Patch Changes

- 10d755e: refactor: xmlui-playground - design update
- b3a4194: Fixed a case where if the data provided to a Table did not have 'id' attributes, the row selection would not work correctly.

## 0.11.4

### Patch Changes

- e384c59: Change validation status signature from having one dash to two dashes to better reflect that they are status modifiers. Ex. -default -> --default, -error -> --error
- f296904: Splitter now responds the visibility changes of its children
- f296904: Temporarily disable the "variant" behavior on Button
- be73336: fix: Select - use extractValue for controlled component value prop

## 0.11.3

### Patch Changes

- 4a311e2: improve: charts - better domain configuration
- f8a75ce: Tiny Splitter updates
- bbc421b: Text strong variant style fixed

## 0.11.2

### Patch Changes

- c1f306f: update package dependencies for tsx usage

## 0.11.1

### Patch Changes

- 7bbbb1d: Add the debounce function to globals

## 0.11.0

### Minor Changes

- 19145d2: xmlui builds with ESM
- 5109dce: Migrate from CommonJs to ESM internally. Lays the groundwork for exporting testing capabilities.

### Patch Changes

- fe503eb: Add enableSubmit to Form
- 06bb966: Fix TableOfContents styling
- e6b5810: fix: playground - app reset
- db94656: improve: bar/line chart spacing
- fe503eb: Queue now passes $queuedItems and $completedItems context variables to its event handlers
- 82ddbe7: Fix codefence first line indent style issue
- 75b701b: Extend form with hideButtonRow and FormItem with noSubmit

## 0.10.26

### Patch Changes

- e1b8d58: Heading now accepts "H1"..."H6", "1"..."6", too. Invalid values fall back to "h1".
- 1ad832c: Remove the showNavPanelIf property from AppHeader (fix NavPanel's "when" usage)

## 0.10.25

### Patch Changes

- e7c503e: refactor: Select - remove radix select
- 5fe3052: Fix the NavGroup click behavior in responsive view
- 5fe3052: Fix the $item access issue within a ModalDialog inside a Column
- 250647b: Fix the APICall becomes non-functional after first error when used with DataSource + Items + $item context issue

## 0.10.24

### Patch Changes

- 3e361c4: The xmlui-pg codefence now accepts emojies
- 3e361c4: Exend the formatDate, formatDateTime, and formatTime functions with optional format strings

## 0.10.23

### Patch Changes

- bf18444: Experiment with the "variant" behavior
- 6d3bb89: Form now has a willSubmit event (it can cancel the submit event)
- 89c69af: Fix the boolean conversion issue with showAnchor in Heading
- 4cfebf0: Fix loading code-behind files in standalone mode
- 145cd68: fix: pointer-events:none when using sibling Dialog

## 0.10.22

### Patch Changes

- 501f60a: The behavior infrastructure now uses ComponentProvider and allows adding custom behaviors
- 1020f1c: Extend Tab with the tabAlignment and accordionView properties

## 0.10.21

### Patch Changes

- 6fd4d62: Add custom Text variant styling

## 0.10.20

### Patch Changes

- 26eac90: fix: Autocomplete handles animations correctly
- f53edff: Add margin-related theme variables to ContentSeparator
- 1840916: Add applyIf property to Theme
- c6be7a3: fix: external animation is now correctly applied to ModalDialogs as well
- 6aaefaf: Added better error text when rendering FormItem outside of a Form.
- 28d2585: refactor: Select and AutoComplete components
- e29a231: The itemLabelWidth value of Form now supports theme variables ($space-\* values).
- 22162c0: AppState now uses a merge operation to set initialValue
- e90232b: fix: itemWithLabel - layout issue

## 0.10.19

### Patch Changes

- facb257: Add checkboxTolerance property to Table
- 6084c14: test: review onFocus, onBlur e2e tests
- e1fa9d7: Renamed the following properties in DatePicker: minValue -> startDate, maxValue -> endDate. Also updated component documentation.

## 0.10.18

### Patch Changes

- 202f2b2: refactor: use labelBehavior instead of ItemWithLabel
- 6650ee8: Add back removed RadioItem
- da98994: Fixed FormItem validation indicators to use a relaxed validation indication strategy.
- 8394663: fix: labelBehavior, input components - styling issue

## 0.10.17

### Patch Changes

- 07dae0b: fix: AccordionItem produces the right error outside of Accordion component

## 0.10.16

### Patch Changes

- 0ba6612: Undust and improve the Tree component
- 7b78052: Fixed Slider ranged version where only the first thumb is interactable.
- 314b429: improve: remove cmdk from autocomple, add keywords prop to option
- a1dea8f: fix: NumberBox initialValue ignores non-convertible string values, minValue and maxValue now applies to typed-in input as well as to increments / decrements with spinner buttons.
- cff754c: refactor: move behavior application earlier in ComponentAdapter render flow

## 0.10.15

### Patch Changes

- 3c8ad14: Add the data property to the Pdf component
- 5502fea: Add the "transform" layout property
- e08f0ba: Add syncWithAppState and initiallySelected properties to Table
- 5502fea: Fix MenuSeparator and SubMenuitem (forwardRef)
- db618b5: fix: NavGroup componenet's iconVertical{Expanded,Collapsed} properties now apply based on it's 'open' state. Only the Expanded one was present before the fix.
- a795b3d: Allow event handlers to use nested action components recursively
- 5851c02: feat: introducing behaviors - tooltip, animation, label

## 0.10.14

### Patch Changes

- 618049b: fix: Modal dialog scrolling issue
- 215a142: Allow image to accept binary data (and use it instead of src)
- 65b52e1: Allow user-defined components in extension packages
- 0cc2178: Fixed Slider input type, label focus, readOnly property, as well as min & max value issues.
- 53d4ed9: Fixed feature to add custom icons for the Carousel prev/next page buttons.

## 0.10.13

### Patch Changes

- 9401ee0: Added short debounce to ColorPicker to make changing color values with slider a bit smoother.
- eb62858: fix: assigning new properties to objects in xmlui script
- eb62858: fix: stricter empty body detection in RestApiProxy
- eb62858: fix: TextArea autofocus
- eb62858: fix: dropdownMenu overflow
- eb62858: fix: ability to use user defined components in triggerTemplate (dropdownMenu)
- eb62858: select: use focus-visible instead of focus for outline
- 243b7fa: fix: modal dialog/toast issue
- eb62858: form: hideButtonRowUntilDirty

## 0.10.12

### Patch Changes

- f12a042: fix: report errors in script tag
- 8731eb8: Avatar does not issue a resource URL warning when "url" is not specified
- eb6454f: refactor: change LineChart/BarChart property names
- 1210852: Fix the layout property usage of ModalDialog

## 0.10.11

### Patch Changes

- 8c76c8d: feat: style the error report colors and spaces in the browser for xmlui syntax errors
- d56c3e5: RadioGroup now correctly handles different types of initialValue property values, applies readOnly property, and places necessary ARIA tags if the required property is set. Clarified component reference description on how RadioGroup and Option handles value types.
- e42d367: Add FancyButton to xmlui-website-blocks
- f539526: feat: BarChart - add tooltip position tracking
- 19ce234: Review Option handling in Select and RadioGroup
- 455b6c0: feat: add animation support to all relevant components via animation and animationOptions props
- e90dc73: feat: add support for 'uses' property
- 819b563: Update fontSize and lineHeight themes and style (may break existing xmlui code)
- b57dfa2: Add the autoDetectTone property to App
- 9dd0f97: Update Checkbox and Switch with click event metadata
- 19ce234: Select accepts null as an option value; it converts a value to a string no longer
- 898346d: Extend Text and Heading APIs with hasOverflow
- 705dd04: Fix RestApiProxy to deliver response status when no error body specified

## 0.10.10

### Patch Changes

- fff80c5: Bump package version

## 0.10.9

### Patch Changes

- 879c09d: Component part handling and testing refactored
- 3ad8514: Added tooltip value display to Slider thumbs. Removed value display from Slider label.
- 0c69245: fix: virtualized list/table in ModalDialog
- 4ad31fc: refactor: rename dataKeys/nameKey to xKeys/yKey and layout to orientation in chart components - BarChart, LineChart
- c99f184: Fix ExpandableItem focus issue
- 5032e4a: Experimenting with HeroSection
- 2394f36: Enhance DateInput and TimeInput

## 0.10.8

### Patch Changes

- a4d62c4: Add experimental Timer component
- 7ed2918: Add the appendBlob function to the ApiInterceptor backend

## 0.10.7

### Patch Changes

- 664ea4f: Fixed BarChart hideTickY property to not remove the Y axis when set to true.
- a739a26: Fixed Checkbox and Switch visual issue. Fixed Line- and BarChart visual glitch in Table.
- bdb54dd: Small fixes for tiny bugs found during MyWorkDrive update
- 81724c6: Fixed BarChart tick labels not appearing.

## 0.10.6

### Patch Changes

- 6464ec8: fix ssr

## 0.10.5

### Patch Changes

- d38351d: fix missing dependency

## 0.10.4

### Patch Changes

- 43fd8c5: small fixes: Avatar, FileUploadDropzone, auto xsrf token handling
- 1df8e5d: Autocomplete: initiallyOpen prop
- 0d5d9d1: Reworked Pagination layout strategy. Provided props to better control layout: pageSizeSelectorPosition, pageInfoPosition, buttonRowPosition. These props are available in Table pagination as well.
- 3def673: DropdownMenu doesn't cooperate with Fragment triggerTemplate
- 428ebea: include themes.scss file in lib dist
- a12ce66: FileUploadDropZone fixes (dropPlaceholder disappeared)

## 0.10.3

### Patch Changes

- 2e512bb: Add solid overflow handling modes to Text
- 46d1d18: Remove the "codefence" Text variant
- 6bc9ed1: feat: support aligning cells in a Table row vertically
- 0b1f983: Add new, compound layout property name parsing
- a2637f3: Text is displayed as inline (you can nest Text into Text)
- eb4d592: Adding the "part" concept to native components

## 0.10.2

### Patch Changes

- ff14e15: fix: LineChart - sizing issue
- 1451a94: feat: make input padding configurable via theme variables

## 0.10.1

### Patch Changes

- 442416b: Refactor visual components to allow tooltip
- a018431: feat: add custom tooltip template support for Bar and Line charts
- 33cb547: Pagination component now handles itemCount being undefined/null. Introduced hasPrevPage and hasNextPage props to toggle button disabled state.
- b5d7537: Enhance the disabledDates property of DatePicker

## 0.10.0

### Minor Changes

- 000a311: Add tooltip behavior to visible components
- eb8b958: Rework inline styling system, prepare for responsive styling

### Patch Changes

- 6d0ce52: Added features to the Pagination component: page size selector dropdown control. Also added the following props: layout orientation and layout order reversal.
- 8c98f33: feat: add theme variable support for LineChart stroke width
- ef86593: feat: add didChange event handler to Tabs component
- da5f4e7: test: create e2e tests for chart components
- 47c7a2d: Integrated the new Pagination component with Table.
- 740f904: Add "activated" event to TabItem
- 5009c52: Add "parts" to component metadata
- 2f5ec32: Remove "from" from the list or reserved script keywords, as no longer used

## 0.9.101

### Patch Changes

- 791b0be: Experimenting with issuing release on larger GitHub machines

## 0.9.100

### Patch Changes

- 2dbf6d2: Added accessibility features, enabled prop and defaultThemeVars to Pagination. Also created E2E test cases for Pagination

## 0.9.99

### Patch Changes

- e5a09fb: Added a separate Pagination component with events and API methods for custom pagination.
- 36360f6: improve: add tickFormatterY to LineChart, create e2e tests

## 0.9.98

### Patch Changes

- ff781f3: new internal react component for integrating into existing react applications (StandaloneComponent)
- 377f0f2: Fix image animation issue in Carousel
- ce0ff76: Added hover & active styles for Slider on thumb. FileInput opens file browser on label focus.
- 208768a: Fixed input adornments not changing color on setting their respective theme variable. Spinbox buttons in NumberBox now have role=spinbutton.

## 0.9.97

### Patch Changes

- f7e8019: Implement simple IFrame APIs

## 0.9.96

### Patch Changes

- 3196156: Add IFrame component (first prototype)
- cfee78a: NumberBox tweaks: fixed missing padding theme var, fixed incorrect label association.
- f51002a: fix: Tabs - descendant button warning
- 3fa52d9: fix: Table sortBy now works as expected

## 0.9.95

### Patch Changes

- af6a7a0: fix: Tabs - fixed the inconsistency in the headerTemplate.
- 69a2a8f: Fix the useEventHaddler hook
- 29c68fe: fix: H1 ... H6 now ignores the level property

## 0.9.94

### Patch Changes

- 1d9365c: feat: Tabs component - use headerTemplate instead of labelTemplate/tabTemplate

## 0.9.93

### Patch Changes

- af17117: feat:add labelTemplate prop to TabItem component
- 44da3d9: The transformation of Checkbox and Switch values (to Booleans) are now documented and tested
- b7a6b9a: Fix formatHumanElapsedTime unit tests, make the local-independent
- bc95844: improve: Select and AutoComplete components
- 52d94a2: Fix the ComponentWrapper childrenAsTemplate issue
- 6629ce5: New end-to-end tests reviewed
- 0254471: Fixed the initialValue issue with TextArea
- 3318cfb: feat: provide context in browser error reports

## 0.9.92

### Patch Changes

- 347cda1: Review component e2e tests

## 0.9.91

### Patch Changes

- 6a7d779: Review Slot implementation

## 0.9.90

### Patch Changes

- 4b57f7e: Remove Spinner tests

## 0.9.89

### Patch Changes

- 2968eb9: fix initialValue handling in selects in forms
- 94f4eb5: safari regexp error workaround for optimized build, revert select inside form fix
- 8364c03: add new TextBox and TextArea test cases

## 0.9.88

### Patch Changes

- b79d7d8: Fix flaky Checkbox e2e tests

## 0.9.87

### Patch Changes

- 33846c2: Fix ios regex failure

## 0.9.86

### Patch Changes

- 48af60d: Temporarily suspend new checkbox e2e tests

## 0.9.85

### Patch Changes

- ee8d6ad: Fix "required" validation issue with "integer" and "number" FormItem
- 9ca7572: Extend the component API metadata with method signature and parameter descriptions
- 6944d2f: Add a scrollIntoView method to Heading
- c0c10e7: Added missing autoFocus feature and aria labels to Checkbox
- cbe1ef2: Use grammar and syntax highlight files straight form the xmlui package, instead of duplicating them in every app.

## 0.9.84

### Patch Changes

- c54abf3: update deps

## 0.9.83

### Patch Changes

- 8e3d6a3: Prevent the xmlui-optimizer to raise error on ShadowRoot
- 8644010: Add a scrollIntoView api to Bookmark

## 0.9.82

### Patch Changes

- 3bc29ae: fix: account for events with components inside them (like APICall) in a way that more syntax highlighters understand. VSCode worked fine, Shiki did not.
- 1101bf5: Fix a React warning in MarkdownNative (headingRef)
- cd8db58: Fixed ModalDialog overlay and fullScreen in nested apps. Now dialogs defined in nested apps stay inside them.
- 13beb58: Fixed ModalDialog context error when dialog is called from ApiCall or components using "confirm" in XMLUI code.
- 79c1d8a: fix: allow the playground to use the same tone as its source

## 0.9.81

### Patch Changes

- 59680b7: Allow configuring the initiallyShowCode flag in ComponentViewer

## 0.9.80

### Patch Changes

- 4598566: NumberBox and FromItem type="number" accepts numeric string as initialValue
- 14e6a7d: feat: add splitView to code inspection
- cf05bd2: Fix non-fatal StandaloneApp.tsx issue

## 0.9.79

### Patch Changes

- ad21a31: enhance treeshaking

## 0.9.78

### Patch Changes

- 94a68f0: Toggle password visibility in PasswordInput
- 94a68f0: Extend markdown to render compound headings with code spans and anchors
- 163a45c: Add ToneSwitch with icon customization
- 7ce528b: fix: BarChart - size management
- c6eb9a8: Fixed scrolling to specific Bookmarks inside nested apps.

## 0.9.77

### Patch Changes

- c867f38: Change split view startup animation

## 0.9.76

### Patch Changes

- aa08a8c: introducing ApiInterceptor->useWorker: true/false
- 15bf622: fix: add escaped \{ to textmate syntax, eliminate double extraction of props in FormItem causing bugs with escaped open curly brace being parsed as start of binding expression.
- 5761868: improve: BarChart - add tick formatter for X and Y axes

## 0.9.75

### Patch Changes

- c876be8: Turn docs deploy to standard routing

## 0.9.74

### Patch Changes

- 0043c5d: NestedApp new prop: withSplashScreen

## 0.9.73

### Patch Changes

- 88bf4f6: extend formatHumanElapsedTime with a short format flag
- fef53db: Allow specifying href targets with the markdown link tag
- 6167648: Fix the useMouseEventHandlers hook
- b2f4483: Fix missing code fence display
- e9040c6: Make the nested app's header smaller

## 0.9.72

### Patch Changes

- 4ab3b8a: add omitH1 to TableOfContents
- ac4a283: remove the AppWithCodeView component
- 38454c9: fix ApiInterceptor race conditions (inside NestedApps)

## 0.9.71

### Patch Changes

- 5774c53: fix ssr issues with Theme components

## 0.9.70

### Patch Changes

- 1da7847: Adjust CodeBlock theme variables for dark tone

## 0.9.69

### Patch Changes

- 9b36621: fix flaky Checkbox tests

## 0.9.68

### Patch Changes

- 9b1f718: change: add back the logo and the buttons to the xmlui-pg split view
- c79ced7: fix ssr hydration warn in AppWithCodeView
- d030ac2: A few theme variable defaults updated
- 21c4fd6: fix: mocked apis should work with multiple NestedApps

## 0.9.67

### Patch Changes

- 51a5b05: Small changes in a few component's metadata representation
- 9048af1: Remove the header logo and buttons from the AppWithCodeViewNative component
- 94f0e66: Accounted for some bad inputs in code fences when highlighting rows & substrings
- 3f0e6b0: fix memoization for tabs, pageInfo

## 0.9.66

### Patch Changes

- eae8145: Fixed Switch indicator positioning
- b6c64de: improve: charts - improved tick rendering
- 459bd3c: improve: Logo - add inline, alt props
- 96be435: feat: CodeBlock - add new themeVariables

## 0.9.65

### Patch Changes

- c17fc0d: fix the NestedAppNative.tsx issue introduced in #1547

## 0.9.64

### Patch Changes

- 5ad3ffc: Refactored the usage of theme variables in RadioGroup
- da3c8bc: Add a "noHeader" option to the xmlui-pg codefence
- 301cb39: Allow YAML (.yml) theme files in standalone apps
- d5d3f4d: Fixed Bar- & LineChart sizing in the Table component

## 0.9.63

### Patch Changes

- b9c0881: Fix: add a workaround to ListNative to avoid issues coming from undefined row values

## 0.9.62

### Patch Changes

- 832f31d: fix: nestedApp fills the available space in AppWithCode component
- 4f9ff06: Fix the build issue with FormSection

## 0.9.61

### Patch Changes

- 4ef5f3f: This version does not contain any real changes; it's just for bumping the version number.

## 0.9.60

### Patch Changes

- f37ed8c: Fine tune AppWithCodeView header
- 736dbc8: improve: AppWithCode - center the XML/UI buttons
- e2a6e1a: Add a popOutUrl="<url>" option to xmlui-pg to allow pop out to a custom playground location

## 0.9.59

### Patch Changes

- 2a07157: Rename Pages property 'defaultRoute' to 'fallbackPath'
- 97b3241: improve: expanding the styles of the components responsible for code display with new theme variables.
- c4abb20: Fixed RadioGroup disabled and validation indicator states. Also fixed an issue where the checked indicator was not aligned to center if the RadioGroup Option was resized in some way.
- f19720c: Added 0 min width to PieChart, Fixed focus error when one checkbox's state change depended on another
- 66c2288: Fixed NavLink indentation in horizontal App layout, if in a nested NavGroup in the NavPanel
- 2d27204: Fixed a number of color & visual state representations of the components: DatePicker, Switch, Select, TextBox, TextArea, NumberBox, AutoComplete

## 0.9.58

### Patch Changes

- dc43275: Fixed Pie- & DonutChart height property.
- f9562b5: make flowLayout auto-responsive behavior a bit smarter
- 1af11af: fix: eliminating the duplication of toast messages
- de570c2: Fixed number of small issues: Colorpicker now gets correct initial value, Options in Select now get correct keys, removed Tabs tabTemplate prop because of a bigger bug.
- 7d255a9: Changed open in new window button tooltip label for all occurrences.
- 69a7a1f: Fixed NavLink label break if overflowing available space.
- 873348c: new form properties: onSuccess, inProgressNotificationMessage, completedNotificationMessage, errorNotificationMessage
- 46bfe72: default style tweaks

## 0.9.57

### Patch Changes

- 93a1e70: fix: NavPanel - use layoutCss

## 0.9.56

### Patch Changes

- 9a3c3b6: feat: xmlui-devtools - start dialog animation from the click, use exit animation as well

## 0.9.55

### Patch Changes

- d507ea8: Add AppWithCodeView component to display code and running app side-by-side

## 0.9.54

### Patch Changes

- 2688a95: Change TreeDisplay theme variable defaults

## 0.9.53

### Patch Changes

- c64fa25: Allow turning on/off heading anchors in appGlobals
- 73c2c21: wip: code inspector buttons - label change, devtools - animation update

## 0.9.52

### Patch Changes

- d079208: The Footer component no provides a themeable gap between its children.
- 2a461d8: feat: NestedApp works with ApiInterceptor
- ad6d81e: fix NestedApp apiUrl overwrite
- f5b9f15: feat: xmlui-devtools - use it in a modal dialog
- 88e4741: fix: Table columns do not allow (and indicate) sorting when bindTo is not set
- 7af4b4e: change default borderColor
- 851ae21: fix table styling
- 7872ed0: Default theme variables changed for App, NestedApp, TableOfContents, and Text
- bf00dce: enhance xmlui parser error tolerance, recovering from unclosed tags
- 38180ce: merge xmlui-charts into core

## 0.9.51

### Patch Changes

- ef7add9: Added theme variable for setting the horizontal alignment of the logo in the NavPanel.
- ba2b5cd: Moved Drawer logo position to left.
- 96273bf: fix: Slider - min/max value validation
- 1a81bcf: fix: Markdown renders inline/block images correclty

## 0.9.50

### Patch Changes

- e6c3b39: standalone usage: explicit codeBehind reference
- 85031c8: Make the "marked" Text variant have lighter background color in dark mode.
- d349036: Tweaked Search dropdown panel styles. Corrected Link component text and decoration hover and active colors

## 0.9.49

### Patch Changes

- 9afd588: fix: XmluiCodeHighlighter - update token colorizing (light/dark tone)
- Updated dependencies [3b5e820]
  - xmlui-charts@0.1.23

## 0.9.48

### Patch Changes

- b5104b0: feat: Icon component now handles the click event
- 30d5c58: feat: Badge supports theme variable names in colormap
- 2e7f51f: change: the canSort property of Column defaults to true
- 4dd6d7f: feat: chart extension included by default
- f7f0571: fix theme component

## 0.9.47

### Patch Changes

- a5bef5d: feat: add "inherit" variant to Text
- ecc52d1: XMLUIExtensions namespace is optional
- 4322e1b: fix: search context scope
- 391927c: feat: add xmlui-tree codefence (displays a tree) to Markdown

## 0.9.46

### Patch Changes

- e20e867: improve: DatePicker - change chevrons, Slider - design updates, change drawer icon's padding
- 1f83bb2: Tables in Markdown scroll horizontally if there's not enough space.
- c433512: Removed close button from TextBox if type="search". Move the Search package from internal, add arrow key selection in search results and add use it in navigation drawer on small screens.
- bc68330: tweak search indexer
- ef3d208: improve: DatePicker - update chevrons

## 0.9.45

### Patch Changes

- de8d63c: Fixed small issues in CodeBlocks: adjusted row highlight length, substring highlight now works with '=' signs, corrected minor vertical positioning of code without syntax highlight, temporarily removed row numbering.
- bd6d1b4: experimental: runtime search indexing
- db5a5f4: fix: Allow APICall as an event handler
- 69b4402: improve: docs - footer logo, FormItem - labelBreak

## 0.9.44

### Patch Changes

- 3eab4a3: improve: design updates - devtools, playground, docs
- 411cd34: fix: inbound links to headers in markdown (anchor scroll slightly off)
- cdf96bb: fix: table inside flowlayout, horizontal scrollbar
- 121c55c: Changed the background color of the `marked` Text variant.
- f1092fe: Added emphasized substring highlights to CodeBlocks. Use it in markdown the following way: ```xmlui !/substr/

## 0.9.43

### Patch Changes

- e2324bb: fix prefetchedContent handling
- cacbf26: improve: AutoComplete - updating the selection logic, improved handling of readOnly and multi states, and removing unused or redundant code, improving tests
- 05c8dfe: test: DatePicker - fix e2e "disabled state prevents interaction"
- 42571db: test: create tests for the AutoComplete component, fix bugs
- 05205c7: Add diagnostics to language server
- 0a3d059: fix initial offset calculation for virtualized table/list

## 0.9.42

### Patch Changes

- 1ab3881: ssr fixes, experimental prefetchedContent
- 3d9729d: test: add tests for the DatePicker component

## 0.9.41

### Patch Changes

- 42416ba: test change for CI #2

## 0.9.40

### Patch Changes

- 34282f0: chage to test CI

## 0.9.39

### Patch Changes

- b79ca46: improve: DatePicker - design update, XmluiCodeHighlighter - use layoutCss
- bbec7a9: Added implicit code highlighter identification by Markdown if one is exposed under the name "codeHighlighter" in the appGlobals in config.
- e67762b: Replaced Admonition emojis with icons

## 0.9.38

### Patch Changes

- d314bad: msw update

## 0.9.37

### Patch Changes

- 1c33896: ssr fixes
- 8d662f3: Added anchor links for headings in markdown. Showing anchors is disabled by default, use the showHeadingAnchors prop on a Markdown component to use it.

## 0.9.36

### Patch Changes

- 6b0f2c1: fix: itemWithLabel fills the available width if no other value is specified

## 0.9.35

### Patch Changes

- ef3cd6e: Reworked NavLink & NavGroup styling: added disabled, hover & active states to button version

## 0.9.34

### Patch Changes

- bae8280: export NestedApp component
- 415aa66: Added color palette colors for CodeBlock, vertical NavPanel now has fixed scrollbar gutter, fixed vertical collapsed icon for NavGroup.

## 0.9.33

### Patch Changes

- dabeb53: Fixed NavPanel background color

## 0.9.32

### Patch Changes

- 4019d82: xmlui-playground, new exports from xmlui
- 450e1ee: feat: add aria-placeholder to Select component

## 0.9.31

### Patch Changes

- ed53215: test release
- ed53215: another testing

## 0.9.30

### Patch Changes

- b0ae113: testing

## 0.9.29

### Patch Changes

- f15c018: another testing
- f15c018: testing

## 0.9.28

### Patch Changes

- 421968b: testing

## 0.9.27

### Patch Changes

- 99bba69: testing

## 0.9.26

### Patch Changes

- bcf162c: testing changesets
