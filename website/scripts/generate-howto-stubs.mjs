import fs from "fs";
import path from "path";

const dir = "/Users/dotneteer/source/xmlui/website/content/docs/pages/howto";

const articles = [
  // Group 1: Forms & Validation
  ["validate-dependent-fields-together", "Validate dependent fields together", "Cross-field validation (e.g. confirm password must match password) using willSubmit or custom validation logic."],
  ["build-a-multi-step-wizard-form", "Build a multi-step wizard form", "Split a long form across steps using Tabs or conditional rendering, collect data across steps, submit once."],
  ["reset-a-form-after-submission", "Reset a form after submission", "Use dataAfterSubmit to clear, reset, or keep data and give visual feedback after a successful submit."],
  ["persist-form-drafts-across-sessions", "Persist form drafts across sessions", "Use persist on Form to save in-progress input to localStorage and restore on revisit."],
  ["prefill-a-form-from-an-api-response", "Prefill a form from an API response", "Load data with DataSource, feed it into Form's data prop so fields start pre-populated for editing."],
  ["make-a-form-read-only-conditionally", "Make a form read-only conditionally", "Toggle all inputs to read-only based on a permission flag or user role."],
  ["show-validation-on-blur-not-on-type", "Show validation on blur, not on type", "Configure customValidationsDebounce and patterns so errors appear only after the user leaves the field."],
  ["add-an-async-uniqueness-check", "Add an async uniqueness check", "Call an API inside a custom FormItem validator with debounce to check if a username or email is already taken."],
  ["submit-a-form-with-file-uploads", "Submit a form with file uploads", "Combine FileInput or FileUploadDropZone inside a Form and handle multipart submission."],

  // Group 2: Data Loading & API Communication
  ["poll-an-api-at-regular-intervals", "Poll an API at regular intervals", "Use pollIntervalInSeconds on DataSource to refresh data periodically without user interaction."],
  ["retry-a-failed-api-call", "Retry a failed API call", "Detect an error on APICall, show a retry button, and call execute() again."],
  ["send-custom-headers-per-request", "Send custom headers per request", "Set headers on a single DataSource or APICall to add auth tokens or custom metadata."],
  ["use-mock-data-during-development", "Use mock data during development", "Set mockData on DataSource to work on the UI without a running backend."],
  ["download-a-file-from-an-api", "Download a file from an API", "Use the FileDownload action to fetch and save a file triggered by a button click."],
  ["cancel-a-deferred-api-operation", "Cancel a deferred API operation", "Use cancel() and stopPolling() on APICall to let users abort a long-running server task."],

  // Group 3: Tables & Data Display
  ["pin-columns-in-a-wide-table", "Pin columns in a wide table", "Use pinTo left or right on Column to freeze key columns during horizontal scroll."],
  ["add-row-actions-with-a-context-menu", "Add row actions with a context menu", "Attach a ContextMenu to table rows and pass $item context to perform edit or delete per row."],
  ["render-a-custom-cell-with-components", "Render a custom cell with components", "Use Column children as a cell template with Badge, Icon, Link, or Button for rich cell content."],
  ["enable-multi-row-selection-in-a-table", "Enable multi-row selection in a table", "Turn on rowsSelectable and enableMultiRowSelection, read the selection, and act on it."],
  ["sort-a-table-by-a-computed-value", "Sort a table by a computed value", "Use sortValue or sortBy with a derived expression to sort rows by something not directly in the data."],
  ["highlight-rows-conditionally", "Highlight rows conditionally", "Apply per-row styling based on data values using Column templates and expressions."],
  ["build-a-master-detail-layout", "Build a master\u2013detail layout", "Click a table row to show details in an adjacent panel or ModalDialog, passing the selected row data."],
  ["auto-size-column-widths-with-star", "Auto-size column widths with star", "Mix fixed-pixel, percentage, and star widths to divide remaining space proportionally."],

  // Group 4: Lists, Trees & Iteration
  ["lazy-load-tree-children-on-expand", "Lazy-load tree children on expand", "Set dynamic on Tree and use onLoadChildren to fetch child nodes from an API on demand."],
  ["pre-select-a-tree-node-on-load", "Pre-select a tree node on load", "Set selectedValue on Tree to a data-driven value so the correct node is highlighted immediately."],
  ["render-a-flat-list-with-custom-cards", "Render a flat list with custom cards", "Use List itemTemplate to replace default rows with Card-based, richly styled list items."],
  ["add-drag-and-drop-reordering-to-a-list", "Add drag-and-drop reordering to a list", "Combine List with keyboard or pointer events to let users reorder items."],
  ["iterate-without-a-container-element", "Iterate without a container element", "Use Items instead of List when you need to stamp out children inline without extra wrapper markup."],
  ["display-an-empty-state-illustration", "Display an empty-state illustration", "Use emptyListTemplate on List or Select to show a friendly message or graphic when there is no data."],

  // Group 5: Navigation & Routing
  ["add-breadcrumb-navigation", "Add breadcrumb navigation", "Combine Link components with $pathname and $routeParams to build a breadcrumb bar."],
  ["deep-link-to-a-tab-or-section", "Deep-link to a tab or section", "Read $queryParams or $routeParams on load to select the right Tab or scroll to a Bookmark."],
  ["build-nested-page-routes", "Build nested page routes", "Use Pages inside Pages to create a multi-level URL hierarchy."],
  ["switch-between-hash-and-history-routing", "Switch between hash and history routing", "Set useHashBasedRouting in appGlobals and configure server-side rewrites for history mode."],
  ["navigate-programmatically", "Navigate programmatically", "Use the navigate() global function from a script block or event handler instead of a Link."],
  ["highlight-the-active-nav-link", "Highlight the active nav link", "Use NavLink's built-in active state to style the current route in a sidebar or header menu."],
  ["collapse-the-nav-panel-on-mobile", "Collapse the nav panel on mobile", "Combine NavPanel with NavPanelCollapseButton and responsive when-* attributes."],

  // Group 6: Layout & Responsive Design
  ["build-a-holy-grail-layout", "Build a holy-grail layout", "Use App layout modes, NavPanel, Footer, and content area to create header + sidebar + content + footer."],
  ["center-content-on-the-page", "Center content on the page", "Use CVStack or CHStack, or horizontalAlignment and verticalAlignment on Stack."],
  ["create-a-resizable-split-view", "Create a resizable split view", "Use Splitter, HSplitter, or VSplitter with min and max constraints for an IDE-style panel layout."],
  ["make-a-sticky-header-in-a-scroll-area", "Make a sticky header in a scroll area", "Use StickyBox or StickySection inside a scrollable VStack to keep a banner visible while scrolling."],
  ["build-a-responsive-card-grid", "Build a responsive card grid", "Use TileGrid or HStack with wrapContent and responsive width to reflow cards on different screens."],
  ["show-different-content-per-breakpoint", "Show different content per breakpoint", "Use responsive when-xs, when-md, when-lg attributes to swap components at breakpoints."],
  ["push-a-footer-to-the-bottom", "Push a footer to the bottom", "Use SpaceFiller between main content and Footer so the footer stays at the viewport bottom."],
  ["dock-elements-to-panel-edges", "Dock elements to panel edges", "Use dock on Stack children to pin items to top, bottom, left, or right of a container."],
  ["limit-content-width-on-large-screens", "Limit content width on large screens", "Wrap content in a Stack with maxWidth and center it, so ultrawide monitors stay readable."],

  // Group 7: Modals, Drawers & Overlays
  ["open-a-confirmation-before-delete", "Open a confirmation before delete", "Use the global confirm() function or APICall's confirmTitle and confirmMessage to gate destructive actions."],
  ["build-a-fullscreen-modal-dialog", "Build a fullscreen modal dialog", "Set fullScreen on ModalDialog for a takeover experience such as an image gallery or multi-step flow."],
  ["show-a-slide-in-settings-drawer", "Show a slide-in settings drawer", "Use Drawer with position right and a headerTemplate for a non-blocking side panel."],
  ["open-a-context-menu-on-right-click", "Open a context menu on right-click", "Bind onContextMenu on a Stack or Table row, call ContextMenu.openAt to show per-item actions."],

  // Group 8: Theming & Styling
  ["create-a-custom-color-theme", "Create a custom color theme", "Define a new theme JSON, register it, and set it as default or let the user switch to it."],
  ["override-a-components-theme-vars", "Override a component's theme vars", "Use Theme with component-scoped variables to restyle one subtree."],
  ["implement-a-dark-mode-toggle", "Implement a dark-mode toggle", "Add ToneSwitch or ToneChangerButton, persist the choice with persistTheme, and handle tone-aware images."],
  ["style-text-with-custom-variants", "Style text with custom variants", "Define Text or Heading variants in theme variables to reuse branded typography across the app."],
  ["scope-a-theme-to-a-card-or-section", "Scope a theme to a card or section", "Wrap a part of the UI in a Theme tag to apply a different tone or colors locally."],
  ["adjust-spacing-globally", "Adjust spacing globally", "Override gap, padding, and margin theme variables at the app root to tighten or loosen spacing everywhere."],

  // Group 9: User-Defined Components
  ["create-a-reusable-component", "Create a reusable component", "Extract repeated markup into a .xmlui file with properties and slots."],
  ["pass-a-template-slot-to-a-component", "Pass a template slot to a component", "Use named Slot elements (ending in Template) to let callers inject custom markup."],
  ["emit-a-custom-event-from-a-component", "Emit a custom event from a component", "Define an event property in a user-defined component and fire it from an inner handler."],
  ["set-default-property-values", "Set default property values", "Declare defaults in the component definition so callers only override what they need."],
  ["compose-components-with-nesting", "Compose components with nesting", "Build higher-order components that wrap others while forwarding props and slots."],

  // Group 10: Scripting & Reactivity
  ["derive-a-value-from-multiple-sources", "Derive a value from multiple sources", "Bind an expression that combines two or more variables; it auto-updates when any input changes."],
  ["run-a-one-time-action-on-page-load", "Run a one-time action on page load", "Use Timer with once=true or a DataSource loaded event to trigger initialization logic."],
  ["communicate-between-sibling-components", "Communicate between sibling components", "Use a shared variable or ChangeListener to pass data between components that are not parent\u2013child."],
  ["throttle-rapid-value-updates", "Throttle rapid value updates", "Use ChangeListener with throttleWaitInMs to emit at most one update per interval."],

  // Group 11: Menus & Toolbars
  ["build-a-toolbar-with-overflow-menu", "Build a toolbar with overflow menu", "Use ResponsiveBar so items that don't fit collapse into a More dropdown automatically."],
  ["add-a-dropdown-menu-to-a-button", "Add a dropdown menu to a button", "Use DropdownMenu with MenuItem and SubMenuItem for hierarchical actions."],
  ["disable-menu-items-conditionally", "Disable menu items conditionally", "Bind enabled on MenuItem to a reactive expression so disabled state reflects the current selection."],
  ["create-a-multi-level-submenu", "Create a multi-level submenu", "Nest SubMenuItem inside DropdownMenu for two or more levels of menu hierarchy."],

  // Group 12: Media & Rich Content
  ["render-a-markdown-file-as-a-page", "Render a Markdown file as a page", "Load a .md file via DataSource and display it with the Markdown component."],
  ["embed-an-external-site-in-an-iframe", "Embed an external site in an IFrame", "Use IFrame with sandbox and allow for secure third-party embeds."],
  ["lazy-load-images-for-performance", "Lazy-load images for performance", "Set lazyLoad on Image to defer offscreen images and improve initial load time."],
  ["generate-a-qr-code-from-user-input", "Generate a QR code from user input", "Bind QRCode value to a TextBox so the code updates live as the user types."],
  ["display-a-pdf-document-inline", "Display a PDF document inline", "Use the xmlui-pdf Pdf component to embed a viewer for uploaded or server-hosted PDFs."],
  ["add-entrance-animations-to-content", "Add entrance animations to content", "Use xmlui-animations FadeInAnimation or SlideInAnimation to reveal sections on scroll or mount."],

  // Group 13: Miscellaneous Patterns
  ["show-toast-notifications-from-code", "Show toast notifications from code", "Call the global toast() function from event handlers or scripts to display success or error messages."],
  ["set-the-page-title-dynamically", "Set the page title dynamically", "Use PageMetaTitle with a bound value expression to update the browser tab per route."],
  ["receive-postmessage-from-an-iframe", "Receive postMessage from an iframe", "Use MessageListener to react to messages sent from embedded content or a parent window."],
  ["build-a-batch-processing-queue", "Build a batch-processing queue", "Use Queue to enqueue items, process them sequentially with progress feedback, and handle errors."],
  ["generate-a-table-of-contents", "Generate a table of contents", "Place TableOfContents alongside Markdown or Heading content to auto-build a navigable outline."],
  ["use-local-storage-for-user-prefs", "Use local storage for user prefs", "Assign storageKey on a global variable to persist a user preference across sessions."],
  ["redirect-users-after-login", "Redirect users after login", "Combine an auth state variable with Redirect to send users to the original target page post-authentication."],

  // Group 14: Advanced Theming
  ["theme-button-variant-color-combos", "Theme Button variant\u00d7color combos", "Override Button theme vars for solid, outlined, and ghost variants crossed with primary, secondary, and attention colors."],
  ["style-per-level-heading-sizes", "Style per-level Heading sizes", "Configure per-level theme vars (h1\u2013h6) for font-size, weight, line-height, and margin."],
  ["theme-tableofcontents-by-depth", "Theme TableOfContents by depth", "Customize active, hover, and default styles per nesting level (items 1\u20136, 200+ vars)."],
  ["customize-select-and-autocomplete-menus", "Customize Select & AutoComplete menus", "Style menu, badges, items, and disabled states via component-specific theme vars."],
  ["theme-form-inputs-for-all-states", "Theme form inputs for all states", "Set TextBox, NumberBox, and TextArea vars for error, warning, success, disabled, focus, and hover states."],
  ["style-markdown-admonition-variants", "Style Markdown admonition variants", "Override colors and borders for note, tip, warning, and danger admonition blocks and blockquote styling."],
  ["customize-tooltip-appearance", "Customize Tooltip appearance", "Adjust animation, arrow, typography, and background via Tooltip theme vars."],
  ["theme-expandableitem-transitions", "Theme ExpandableItem transitions", "Control content and summary styles and expand/collapse animation with ExpandableItem theme vars."],
  ["style-navpanel-for-horizontal-mode", "Style NavPanel for horizontal mode", "Override NavPanel theme vars for vertical vs horizontal layouts, logo, footer, and content parts."],
  ["theme-multi-level-navgroup-nesting", "Theme multi-level NavGroup nesting", "Customize styles for up to 4 nesting levels and dropdown overlays in NavGroup."],
  ["style-modaldialog-overlay-and-parts", "Style ModalDialog overlay and parts", "Control content, title bar, close button, and backdrop overlay styles via theme vars."],
  ["customize-link-focus-and-decoration", "Customize Link focus & decoration", "Set icon gap, padding, border, focus outline, and text decoration vars for Link."],
  ["theme-datepicker-calendar-items", "Theme DatePicker calendar items", "Style calendar grid, selected day, disabled dates, range highlights, and menu via DatePicker vars."],
  ["style-slider-track-thumb-and-range", "Style Slider track, thumb, and range", "Override track color, thumb size, and range fill for normal, hover, and disabled states."],
  ["define-custom-text-variants-in-a-theme", "Define custom Text variants in a theme", "Use the cssProperty-Text-variantName pattern to create reusable branded text styles."],
  ["theme-badge-colors-and-sizes", "Theme Badge colors and sizes", "Customize background, text, border-radius, and padding per Badge variant."],
  ["style-card-appearance", "Style Card appearance", "Override Card theme vars for elevation, hover state, padding, and section spacing."],
  ["style-noresult-placeholder", "Style NoResult placeholder", "Override NoResult theme vars for icon size, gap, background, and padding."],

  // Group 15: Complex Property Patterns
  ["configure-tree-data-format-and-mapping", "Configure Tree data format and mapping", "Choose between flat vs hierarchy dataFormat, map fields with idField, labelField, parentField, and more."],
  ["parse-uploaded-files-as-csv-or-json", "Parse uploaded files as CSV or JSON", "Use FileInput parseAs to auto-parse files, configure csvOptions (Papa Parse), and handle parseError."],
  ["disable-specific-dates-in-datepicker", "Disable specific dates in DatePicker", "Use disabledDates with weekday, range, before/after, array, and mixed patterns."],
  ["handle-form-willsubmit-return-values", "Handle Form willSubmit return values", "Return false, a modified object, or undefined from willSubmit to cancel, transform, or proceed."],
  ["use-regex-validation-in-formitem", "Use regex validation in FormItem", "Write regex patterns with curly-brace quantifiers and control severity per validation type."],
  ["use-negative-maxprimarysize-in-splitter", "Use negative maxPrimarySize in Splitter", "Set negative values on maxPrimarySize to calculate from the opposite edge."],
  ["switch-tabs-to-accordion-view", "Switch Tabs to accordion view", "Override tab layout with accordionView, interact with headerTemplate and $header context."],
  ["sync-tilegrid-selection-across-grids", "Sync TileGrid selection across grids", "Use syncWithVar for cross-grid selection, leverage keyboard shortcuts."],
  ["configure-tooltip-with-string-syntax", "Configure Tooltip with string syntax", "Use tooltipOptions semicolon-delimited syntax with boolean prefix notation for inline config."],
  ["control-debounce-vs-throttle-priority", "Control debounce vs throttle priority", "Understand ChangeListener precedence rules when both debounceWaitInMs and throttleWaitInMs are set."],
  ["dock-children-in-a-stack-panel", "Dock children in a Stack panel", "Use the dock property with top, bottom, left, right, and stretch semantics for DockPanel layouts."],
  ["communicate-with-iframe-content", "Communicate with IFrame content", "Use postMessage(), getContentDocument(), and getContentWindow() with cross-origin restrictions."],
  ["handle-contentseparator-orientation", "Handle ContentSeparator orientation", "Set explicit parent height for vertical ContentSeparator display."],
  ["load-remote-markup-with-includemarkup", "Load remote markup with IncludeMarkup", "Handle CORS requirements, didFail error events, and know that script sections are silently ignored."],
  ["stack-stickysection-elements", "Stack StickySection elements", "Understand stacking behavior where only the closest sticky section remains visible."],
  ["auto-scroll-navpanel-to-active-item", "Auto-scroll NavPanel to active item", "Use syncWithContent to auto-scroll the current nav item into the visible area."],
  ["handle-checkbox-value-coercion", "Handle Checkbox value coercion", "Understand how null, false strings, empty arrays, and empty objects are coerced to boolean."],

  // Group 16: Charts & Data Visualization
  ["build-a-stacked-bar-chart", "Build a stacked bar chart", "Use BarChart with stacked and multiple yKeys to compare cumulative totals per category."],
  ["format-chart-axis-ticks", "Format chart axis ticks", "Use tickFormatterX and tickFormatterY functions on line, bar, or area charts for custom labels."],
  ["add-custom-tooltips-to-a-chart", "Add custom tooltips to a chart", "Replace default tooltip rendering with tooltipTemplate for rich hover content."],
  ["create-an-area-chart-with-stacking", "Create an area chart with stacking", "Use AreaChart with stacked and curved for layered time-series visualization."],
  ["position-labels-on-a-pie-chart", "Position labels on a pie chart", "Configure labelListPosition with 20+ placement options on PieChart or use the LabelList component."],
  ["overlay-a-radar-chart-comparison", "Overlay a radar chart comparison", "Plot multiple data series on RadarChart with filled, fillOpacity, and strokeWidth tweaks."],
  ["use-echarts-for-advanced-charting", "Use ECharts for advanced charting", "Pass a full ECharts option config to EChart and access the native instance with getEchartsInstance()."],
  ["create-a-gauge-dashboard-widget", "Create a gauge dashboard widget", "Configure Gauge analogDisplayType (needle, fill, line), scale positioning, and digital display."],

  // Group 17: PDF Viewer
  ["embed-and-navigate-a-pdf", "Embed and navigate a PDF", "Use Pdf src or data, page navigation methods, zoom controls, and scrollStyle options."],
  ["add-annotations-to-a-pdf", "Add annotations to a PDF", "Switch to edit mode, create, update, and delete annotations, and export with exportAnnotations()."],
  ["capture-and-apply-pdf-signatures", "Capture and apply PDF signatures", "Use openSignatureModal(), applySignature(), saveSignature(), and signatureData round-trip."],
  ["export-a-modified-pdf", "Export a modified PDF", "Use exportToPdf() to flatten annotations into a real PDF Uint8Array for download or upload."],

  // Group 18: Rich Text & Masonry
  ["configure-a-tiptapeditor-toolbar", "Configure a TiptapEditor toolbar", "Use toolbarItems to selectively show formatting options; retrieve content as HTML or Markdown."],
  ["build-a-responsive-masonry-layout", "Build a responsive masonry layout", "Use Masonry with columns, minColumnWidth, and gap for a Pinterest-style auto-reflowing grid."],

  // Group 19: Animation & Carousel
  ["chain-animations-on-scroll-into-view", "Chain animations on scroll into view", "Combine FadeInAnimation or SlideInAnimation with animateWhenInView and delay for staggered reveals."],
  ["build-an-auto-playing-carousel", "Build an auto-playing carousel", "Configure Carousel autoplay, autoplayInterval, loop, and stopAutoplayOnInteraction."],
  ["customize-carousel-controls-and-indicators", "Customize carousel controls & indicators", "Override Carousel theme vars for control and indicator active, hover, disabled states and sizing."],
];

let created = 0;
let skipped = 0;

for (const [slug, title, desc] of articles) {
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) {
    const content = `# ${title}\n\n${desc}\n\n*This article is coming soon.*\n`;
    fs.writeFileSync(file, content, "utf8");
    created++;
  } else {
    skipped++;
  }
}

console.log(`Created ${created} new article stubs, skipped ${skipped} existing files.`);
