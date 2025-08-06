# xmlui

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
