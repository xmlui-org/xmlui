---
"xmlui": patch
---

Render a `MenuItem`'s `to` as a real link instead of a click handler on a `<div>`.

`MenuItem` documented `to` as the menu item's URL, but never produced a URL anywhere in the DOM: the item rendered as a `<div role="menuitem">` whose click handler called the navigate action. Everything a browser gives a link was therefore missing — ctrl/cmd-click and middle-click could not open the target in a new tab, the destination never appeared in the status bar on hover, "Copy link address" was absent from the context menu, and assistive technology had no destination to report. A menu item declaring `to` now renders as an `<a>` carrying an `href`, and `ContextMenu`, which builds on the same component, gets this too.

The navigation itself deliberately still runs in-app rather than being left to the anchor: a plain left click is cancelled and handed to the application's own navigation entry point, so the `willNavigate` guard can still stop a menu-driven navigation, `didNavigate` still fires, and the `kind:"navigate"` trace entry is still recorded. Modifier and non-primary clicks are passed through to the browser untouched, and neither the item's `to` navigation nor its `click` handler runs for them, so a single gesture never acts twice.

Three navigation bugs surfaced while making the `href` agree with where a click actually lands, and are fixed as part of this:

- `to` did not navigate at all when event handlers were compiled. The menu item resolved the navigation by looking up an action named "navigate", which routes the name through the scripting engine; with compiled handlers that lookup yields nothing and the click did nothing at all. Navigation now calls the application's navigate entry point directly and no longer depends on script evaluation. This went unnoticed because `to` had no test coverage.
- A relative `to` went to the wrong page. `<MenuItem to="details">` on `/parent` navigated to `/` because the path was resolved against the router root instead of the current location. The `href` and the navigation now share one resolution, made against the current location, so `to="details"` on `/parent` reaches `/parent/details`.
- An absolute `to` such as `https://example.com/docs` navigated to the app root, because relative-path resolution reduced it to `/`. Such a destination is now left to the anchor's own navigation and reaches the real URL.

`MenuItem` also gains a `target` property (mirroring `Link`), sets `aria-current="page"` when `active`, and no longer emits a stray `to` attribute into the DOM. Menu items no longer hard-code `tabIndex={0}`, which used to override Radix's roving focus and make every item its own tab stop; an open menu is now the single tab stop that the ARIA menu pattern calls for, which matters more now that items are natively focusable anchors. A disabled item renders without an `href`, so it is neither focusable nor followable. Menu items without a `to` are untouched and still render as before, which keeps `ResponsiveBar` and `ProfileMenu` — both of which wrap arbitrary children, often links, in a plain `MenuItem` — free of nested anchors. Writing such a nesting by hand (a `Link`, `NavLink`, or `Button` inside a `MenuItem` that declares `to`) now logs a development-time warning.

Where `to` and a `click` handler are both defined, `click` keeps its documented precedence: a plain click runs the handler and does not navigate. The `href` is still rendered, so a deliberate ctrl/cmd-click follows the link instead. This precedence now also outranks `target`, so a plain click on an item with `to`, `target="_blank"` and a `click` handler runs the handler rather than opening a tab.
