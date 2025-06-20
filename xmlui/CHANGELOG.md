# xmlui

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
