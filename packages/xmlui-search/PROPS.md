# Search component — props reference

## `data` *(required)*

**Típus:** `{ path: string; title: string; content: string; category?: string; date?: string | number }[]`

A keresési adatbázis. Minden elem egy oldalt/dokumentumot reprezentál.
A komponens ezen felül automatikusan felolvassa a `useSearchContextContent()` hook által nyújtott dinamikus tartalmat is (pl. az aktuálisan megnyitott oldal szövege), és a kettőt deduplikálva egyesíti.

**Releváns kód:** `Search.tsx` → `useSearch` → `mergedData` useMemo

---

## `mode`

**Típus:** `"overlay" | "inline" | "drawer"`
**Alapértelmezett:** `"overlay"`

Meghatározza a search megjelenési módját:

- **`overlay`** – A search gombra kattintva egy teljes képernyős, középre igazított overlay nyílik. Portálon keresztül rendereli a találatokat.
- **`inline`** – Az input helyben táguló animációval jelenik meg a navbarban. A találatok egy Popover panelben jelennek meg az input alatt.
- **`drawer`** – Mobilos módhoz tervezve. A trigger mindig a DOM-ban marad (hogy a Sheet ne záródjon be), a találatok portálon keresztül töltődnek be. Kiválasztáskor sem a search, sem a mobil menü nem záródik be.

**Releváns kód:** `Search.tsx` → `useOverlay`, `useDrawer` konstansok → három különálló `return` ág a komponens alján

---

## `collapsible`

**Típus:** `boolean`
**Alapértelmezett:** `false`

Ha `true`, a search mező alapállapotban egy ikon-gombra zsugorodik, és kattintásra tárul ki animációval. Inline módban az `onBlur` esemény ismét bezárja, ha az input üres.

**Releváns kód:** `Search.tsx` → `isExpanded`, `animationDirection` state; `onSearchButtonClick`, `onInputBlur` callback-ek; `.expanding` / `.collapsing` CSS osztályok

---

## `placeholder`

**Típus:** `string`
**Alapértelmezett:** `"Type to search"` / `"Type to search…"` (módtól függően)

Az input mező placeholder szövege.

---

## `limit`

**Típus:** `number`
**Alapértelmezett:** `10`

A Fuse.js-nek átadott maximális találatszám felső korlátja. A tényleges lekérés `limit * 10`-ig (max 200) fut, hogy a lapozás (`pageSize`) és a kategória-szűrő legyen miből dolgozni.

**Releváns kód:** `Search.tsx` → `useSearch` → `fetchLimit = Math.min(limit * 10, 200)`

---

## `pageSize`

**Típus:** `number`
**Alapértelmezett:** megegyezik a `limit` értékével

Hány találatot mutasson egyszerre. A „Load more" gomb eggyel növeli az aktuális lapot. Az állapotsáv megjeleníti a `Showing X of Y` szöveget.

**Releváns kód:** `Search.tsx` → `effectivePageSize`, `page` state, `results` useMemo (`.slice`), `loadMoreJsx`

---

## `maxContentMatchNumber`

**Típus:** `number`
**Alapértelmezett:** `3`

Egy találaton belül legfeljebb hány tartalmi snippet jelenjen meg (a cikk szövegéből kiemelve). Minden snippet ~50 karakter kontextust kap a találat körül.

**Releváns kód:** `Search.tsx` → `SearchItemContent` → `formatContentSnippet(item.content, matches.content.indices, maxContentMatchNumber)`

---

## `suggestedQueries`

**Típus:** `string[]`

Ha nincs találat, ezek a keresési javaslatok chip-szerű gombokként jelennek meg a „Nincs találat" panel alatt. Kattintásra az input értékét behelyettesítik.

**Releváns kód:** `Search.tsx` → `NoResultsPanel` komponens

---

## `noResultsMessage`

**Típus:** `string`
**Alapértelmezett:** `"No results found"`

Az üres találati állapot fő szövege.

**Releváns kód:** `Search.tsx` → `NoResultsPanel` → `message` prop

---

## `showPreviewMetadata`

**Típus:** `boolean`
**Alapértelmezett:** `true`

Ha `true`, minden találat alatt megjelenik a kategória-badge és az útvonal (breadcrumb) az item path-ja alapján.

**Releváns kód:** `Search.tsx` → `SearchItemContent` → `.previewMetadata` blokk; `parsePathBreadcrumb` utility

---

## `defaultSelectedCategories`

**Típus:** `string[]`

Alapértelmezetten aktív kategória-szűrők. A query változásakor visszaáll erre az értékre.

**Releváns kód:** `Search.tsx` → `selectedCategories` state (init), `useEffect` a `debouncedValue` változásra

---

## `defaultSortOrder`

**Típus:** `"relevance" | "date"`
**Alapértelmezett:** `"relevance"`

- **`relevance`** – A Fuse.js score szerinti sorrend (0 = tökéletes egyezés).
- **`date`** – Az item `date` mezője szerint csökkenő sorrendben. Dátum nélküli elemek a lista végére kerülnek.

**Releváns kód:** `Search.tsx` → `sortOrder` state, `sortedResults` useMemo, `SortControl` komponens

---

## `enableSpellCorrection`

**Típus:** `boolean`
**Alapértelmezett:** `true`

Ha nincs találat és a lekérdezés legalább 3 karakter hosszú, a komponens egy lazább threshold-dal (`0.6`) futtat egy másodlagos Fuse.js keresést, és a legjobb találat címét „Did you mean: …?" formában ajánlja fel.

**Releváns kód:** `Search.tsx` → `FUSE_RELAXED_OPTIONS`, `relaxedFuseRef`, `DidYouMeanBanner` komponens
