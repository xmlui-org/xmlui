# Search [#search]

The `Search` component provides a full-featured site search with fuzzy matching, category filters, sorting, spell correction, and paginated results.

## Basic usage

```xmlui
<Search data="{appGlobals.staticSearchData}" placeholder="Search on site..." />
```

The `data` prop accepts an array of `SearchItemData` objects:

```ts
type SearchItemData = {
  path: string;       // URL to navigate to on click
  title: string;      // Result headline
  content: string;    // Searchable body text
  category?: string;  // Optional group label (e.g. "docs", "blog")
  date?: string;      // Optional ISO date for date-based sorting
};
```

---

## Step 1 — Collapsible mode

Use `collapsible="true"` to render the search as an icon button in the header. Clicking the icon expands the input with an animation; blurring an empty field collapses it again.

```xmlui
<Search
  collapsible="true"
  data="{appGlobals.staticSearchData}"
  placeholder="Search on site..."
/>
```

> Best suited for space-constrained headers. On mobile (inside a `NavPanel`) leave `collapsible` off so the field is always visible.

---

## Step 2 — Zero-results UX

When a query returns no results, the panel shows a friendly message and optional suggested queries. Clicking a suggestion pre-fills the input.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  noResultsMessage="No results found on this site."
  suggestedQueries="{['components', 'tutorial', 'themes', 'scripting', 'forms']}"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `noResultsMessage` | `string` | `"No results found"` | Text shown when there are no hits |
| `suggestedQueries` | `string[]` | — | Clickable chips below the message |

---

## Step 3 — Did you mean?

When a query returns zero results but a close match exists in the data, the component suggests the most likely correction. Clicking the suggestion replaces the current query.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  enableSpellCorrection="true"
/>
```

The suggestion uses a second, more relaxed Fuse.js pass (`threshold: 0.6`) that only runs on zero-result queries of 3+ characters. Set `enableSpellCorrection="false"` to disable.

> The "Did you mean" banner renders above the zero-results panel, so both features work together.

---

## Step 4 — Enhanced result previews

Each result can display a **category badge** and a **path breadcrumb** beneath the title to give users more context at a glance.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  showPreviewMetadata="true"
/>
```

- The badge shows `item.category` (e.g. `docs`, `blog`).
- The breadcrumb parses `item.path` into URL segments separated by `/`.

Set `showPreviewMetadata="false"` to hide both. Recommended on mobile where space is tight.

---

## Step 5 — Faceted category filters

When results span more than one category, a filter bar appears automatically above the results list. Users can narrow results to one or more categories; clicking **All** resets the filter.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  defaultSelectedCategories="{['docs']}"
/>
```

- The filter bar only appears when two or more distinct categories are present in the current result set.
- The filter resets automatically when the query changes.
- `defaultSelectedCategories` sets the initially active filters (empty array = All).

---

## Step 6 — Sorting controls

A sort toggle (`Relevance` / `Date`) is shown in the panel header alongside the category filter bar.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  defaultSortOrder="relevance"
/>
```

| Value | Behaviour |
|---|---|
| `"relevance"` | Preserves Fuse.js score order (best match first) |
| `"date"` | Sorts by `item.date` descending; items without a date fall to the end |

To enable date sorting for blog posts, populate the `date` field in your search data:

```ts
// website/utils/index.ts
return {
  path: key,
  title,
  content: value,
  category: "blog",
  date: blogFrontmatter[key]?.date,   // ISO string, e.g. "2025-03-01"
};
```

---

## Step 7 — Pagination / Load more

By default the component shows up to `limit` results (default: 10). When more results exist, a **Load more** button and a result count (`Showing X of Y`) appear below the list.

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  limit="10"
  pageSize="10"
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `limit` | `number` | `10` | Initial page size and the increment per "Load more" click |
| `pageSize` | `number` | same as `limit` | Override the per-page increment independently of the initial limit |

Internally the component fetches up to `min(limit × 10, 200)` results from Fuse.js, so all pages are available client-side without extra requests.

---

## Full example

This is how the website's header search is configured:

```xmlui
<Search
  collapsible="true"
  data="{appGlobals.staticSearchData}"
  placeholder="Search on site..."
  suggestedQueries="{['components', 'tutorial', 'themes', 'scripting', 'forms']}"
  noResultsMessage="No results found on this site."
  showPreviewMetadata="true"
  defaultSortOrder="relevance"
  pageSize="10"
  enableSpellCorrection="true"
/>
```

And the mobile version inside the `NavPanel` (metadata hidden to save space):

```xmlui
<Search
  data="{appGlobals.staticSearchData}"
  placeholder="Search on site..."
  suggestedQueries="{['components', 'tutorial', 'themes', 'scripting', 'forms']}"
  noResultsMessage="No results found on this site."
  showPreviewMetadata="false"
  pageSize="8"
  enableSpellCorrection="true"
/>
```

---

## All props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `SearchItemData[]` | — | **Required.** Array of searchable items |
| `placeholder` | `string` | `"Type to search"` | Input placeholder text |
| `limit` | `number` | `10` | Max results per page |
| `maxContentMatchNumber` | `number` | `3` | Max content snippets shown per result |
| `collapsible` | `boolean` | `false` | Render as icon button that expands on click |
| `suggestedQueries` | `string[]` | — | Query chips shown on zero results |
| `noResultsMessage` | `string` | `"No results found"` | Zero-results message text |
| `showPreviewMetadata` | `boolean` | `true` | Show category badge and path breadcrumb |
| `defaultSelectedCategories` | `string[]` | `[]` | Pre-selected category filters |
| `defaultSortOrder` | `"relevance" \| "date"` | `"relevance"` | Initial sort order |
| `pageSize` | `number` | same as `limit` | Per-page increment for Load more |
| `enableSpellCorrection` | `boolean` | `true` | Show "Did you mean?" on zero results |
