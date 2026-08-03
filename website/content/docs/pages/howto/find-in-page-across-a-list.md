# Find in page across a List

Give a `List` a find box that highlights every match across its rows, steps through **each occurrence** with ▲/▼ and an "N of M" counter, and scrolls the active match into view.

[Highlight matching text inside Markdown](/docs/howto/highlight-inside-markdown) covers find-and-step *within one* `Markdown` block. This is the List-level composite: many rows, a single global cursor that runs over every occurrence in every row, and the active match emphasized wherever it lives.

The whole trick is a **find plan** — a pure function of `(rows, needle, cursor)` that counts occurrences per row, maps the global cursor to a specific `(row, local occurrence)`, and decorates each row with the active occurrence to feed `Markdown`'s `highlightActiveIndex`.

```xmlui-pg copy display name="Find in page across a List" height="480px"
<App var.needle="scan" var.cursor="{0}">
  <script>
    var rows = [
      { id: 1, text: "The scan step forwards to this subkind; the scan then defers to the next scan." },
      { id: 2, text: "A quiet entry with nothing to match here at all." },
      { id: 3, text: "Scan the ring buffer, scan the tail, and scan once more before the flush." },
      { id: 4, text: "The final line mentions a single scan and nothing else of note." }
    ];

    // The find plan: count occurrences per row, map the global cursor to a
    // (row, local occurrence), and decorate every row with its active index.
    function buildPlan(data, q, cur) {
      const needle = (q || "").toLowerCase();
      if (!needle) {
        const passthrough = data.map((r) => ({
          id: r.id, text: r.text, needle: "", activeOcc: -1, key: "" + r.id
        }));
        return { rows: passthrough, total: 0, cursor: 0, activeRow: -1 };
      }
      // Count marks, not rows — a row can hold several.
      const counts = [];
      let total = 0;
      for (let i = 0; i < data.length; i++) {
        const c = data[i].text.toLowerCase().split(needle).length - 1;
        counts.push(c);
        total = total + c;
      }
      const wrapped = total > 0 ? (((cur % total) + total) % total) : 0;
      // Walk the counts to find which row holds the cursor, and where in it.
      let acc = 0;
      let activeRow = -1;
      let activeOcc = -1;
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0 && wrapped >= acc && wrapped < acc + counts[i]) {
          activeRow = i;
          activeOcc = wrapped - acc;
          break;
        }
        acc = acc + counts[i];
      }
      const decorated = data.map((r, i) => ({
        id: r.id,
        text: r.text,
        needle: counts[i] > 0 ? q : "",
        activeOcc: (i === activeRow) ? activeOcc : -1,
        // Cursor-stable key EXCEPT the active row, so only it re-renders per step.
        key: "" + r.id + ((i === activeRow) ? (":a" + activeOcc) : "")
      }));
      return { rows: decorated, total: total, cursor: wrapped, activeRow: activeRow };
    }
  </script>

  <variable name="plan" value="{buildPlan(rows, needle, cursor)}" />

  <VStack gap="$space-2" height="100%">
    <HStack gap="$space-2" verticalAlignment="center">
      <TextBox placeholder="Find…" width="220px" value="{needle}"
        onDidChange="(v) => { needle = v; cursor = 0 }" />
      <Button label="Prev" variant="outlined" enabled="{plan.total > 0}"
        onClick="cursor = (cursor - 1 + plan.total) % plan.total" />
      <Button label="Next" variant="outlined" enabled="{plan.total > 0}"
        onClick="cursor = (cursor + 1) % plan.total" />
      <Text>{plan.total > 0 ? (plan.cursor + 1) + ' of ' + plan.total : '0 of 0'}</Text>
    </HStack>

    <!-- Active ROW changed → scroll it into view. Stepping between marks inside
         one row leaves activeRow unchanged, so the view stays put. -->
    <ChangeListener listenTo="{plan.activeRow}"
      onDidChange="() => plan.activeRow >= 0 ? matchList.scrollToIndex(plan.activeRow) : null" />

    <List id="matchList" data="{plan.rows}" idKey="key" height="320px">
      <Card>
        <Markdown content="{$item.text}"
          highlightText="{$item.needle}"
          highlightActiveIndex="{$item.activeOcc}" />
      </Card>
    </List>
  </VStack>
</App>
```

## Key points

**Count occurrences, not rows.** A row can contain several matches, so the counter and the cursor must range over *marks*, not matching rows. `buildPlan` sums per-row occurrence counts into a total, and a single global `cursor` (0-based) addresses one specific mark. Stepping `▼` past the last mark in a row moves to the first mark of the next matching row — no occurrences are skipped.

**The invariant: count the surface you highlight.** `highlightActiveIndex` is an index into `highlightText`'s occurrences *in the same rendered text*. So the string you count in `buildPlan` (`$item.text`) must be exactly the string the row's `Markdown` highlights. If a row displays a *different* surface than the one you counted (a truncated preview, a summary), count and highlight that same surface — otherwise the active mark lands on the wrong occurrence.

**`idKey` moves the active highlight.** Each row's `key` is stable *except* the active row, which carries an `:a<occ>` suffix. A step changes at most two keys — the row losing the active mark and the row gaining it — so only those re-render and pick up their new `activeOcc`. A fully-stable key can leave the active emphasis stuck on the old mark; baking the cursor into *every* key re-renders the whole list on every keystroke (see the scaling note below).

**`scrollToIndex` follows the active row.** A `ChangeListener` on `plan.activeRow` scrolls the List to the active block. It is keyed to the *row*, not the cursor, so stepping between several marks within one row doesn't yank the view.

## Package it as a reusable component

Once you have wired this once, the spine — the find box, the cursor, the plan, the List, the scroll — is identical for every list. Move it into a [user-defined component](/docs/user-defined-components) and each consumer supplies only its `data` and how to render a row. The component decorates every row with `__needle` / `__activeOcc` and re-exposes it to your markup through a named [`Slot`](/docs/reference/components/Slot), so the whole find machinery becomes one tag:

```xmlui-pg copy display name="The same find, packaged as a reusable component" height="600px"
<App>
  <FindableList
    query="scan"
    listHeight="320px"
    data="{[
      { id: 1, text: 'The scan step forwards to this subkind; the scan then defers to the next scan.' },
      { id: 2, text: 'A quiet entry with nothing to match here at all.' },
      { id: 3, text: 'Scan the ring buffer, scan the tail, and scan once more before the flush.' },
      { id: 4, text: 'The final line mentions a single scan and nothing else of note.' }
    ]}">
    <property name="rowTemplate">
      <Card>
        <Markdown
          content="{$item.text}"
          highlightText="{$item.__needle}"
          highlightActiveIndex="{$item.__activeOcc}" />
      </Card>
    </property>
  </FindableList>
</App>
<Component name="FindableList">
  <variable name="needle" value="{$props.query || ''}" />
  <variable name="cursor" value="{0}" />
  <script>
    // The find plan from above, now owned by the component.
    function buildPlan(data, q, cur) {
      const rows = data || [];
      const needle = (q || '').toLowerCase();
      if (!needle) {
        const pass = rows.map((r) => ({ id: r.id, text: r.text, __needle: '', __activeOcc: -1, __key: '' + r.id }));
        return { rows: pass, total: 0, cursor: 0, activeRow: -1 };
      }
      const counts = [];
      let total = 0;
      for (let i = 0; i < rows.length; i++) {
        const c = ('' + (rows[i].text || '')).toLowerCase().split(needle).length - 1;
        counts.push(c);
        total = total + c;
      }
      const wrapped = total > 0 ? (((cur % total) + total) % total) : 0;
      let acc = 0, activeRow = -1, activeOcc = -1;
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0 && wrapped >= acc && wrapped < acc + counts[i]) { activeRow = i; activeOcc = wrapped - acc; break; }
        acc = acc + counts[i];
      }
      const decorated = rows.map((r, i) => ({
        id: r.id,
        text: r.text,
        __needle: counts[i] > 0 ? q : '',
        __activeOcc: (i === activeRow) ? activeOcc : -1,
        __key: '' + r.id + ((i === activeRow) ? (':a' + activeOcc) : '')
      }));
      return { rows: decorated, total: total, cursor: wrapped, activeRow: activeRow };
    }
  </script>
  <variable name="plan" value="{buildPlan($props.data, needle, cursor)}" />

  <VStack gap="$space-2" height="{$props.listHeight || '*'}">
    <HStack gap="$space-2" verticalAlignment="center">
      <TextBox placeholder="Find…" width="220px" initialValue="{needle}"
        onDidChange="(v) => needle = v" />
      <Button label="Prev" variant="outlined" enabled="{plan.total > 0}"
        onClick="cursor = (cursor - 1 + plan.total) % plan.total" />
      <Button label="Next" variant="outlined" enabled="{plan.total > 0}"
        onClick="cursor = (cursor + 1) % plan.total" />
      <Text>{plan.total > 0 ? (plan.cursor + 1) + ' of ' + plan.total : '0 of 0'}</Text>
    </HStack>
    <ChangeListener listenTo="{needle}" onDidChange="() => cursor = 0" />
    <ChangeListener listenTo="{plan.activeRow}"
      onDidChange="() => plan.activeRow >= 0 ? innerList.scrollToIndex(plan.activeRow) : null" />
    <List id="innerList" data="{plan.rows}" idKey="__key" height="{$props.listHeight || '320px'}">
      <property name="itemTemplate">
        <Slot name="rowTemplate" item="{$item}" />
      </property>
    </List>
  </VStack>
</Component>
```

**The contract, not just the plumbing.** Packaging hides the spine, but the *invariant survives*: your `rowTemplate` must still route `highlightText` + `highlightActiveIndex` to the surface the component counted — here, `$item.text`. The component decorates each row and hands it back through the `Slot`; you decide which `Markdown` renders (and highlights) the counted text. A component can own the counting, the cursor, and the keying; it cannot own *what a row's searchable surface is* — that stays with the consumer.

**Why this is the payoff.** This component came out of a real app (Bram) that reuses one `FindableList` across its issue, commit, worklist-history, and session views — each supplying only a flat row array and a row template. Extracting it is what retired the duplicated find code across all of them; documenting the composition here (xmlui-org/xmlui#3713) is what makes it reproducible. The demo counts each row's `text`; a fully general component takes the searchable field (or an accessor) as a prop, so heterogeneous rows can each declare their own marked surface.

## Scaling to large or virtualized lists

The example rebuilds the plan on every keystroke and every step, which is fine for a bounded list. Two things change when the List is long enough to virtualize:

- **Minimal-remount keying matters.** The cursor-stable-except-active `key` above is already the right discipline — it keeps per-step remounts to ≤2 even when thousands of rows are mounted. Baking the cursor into every key instead would remount every visible row per keystroke, each re-parsing its Markdown. See [Keep per-item state in an Items or List loop](/docs/howto/keep-per-item-state-in-a-loop) for the identity substrate.
- **Memoize the plan.** Recomputing occurrence counts for every row on every cursor *step* is wasted work — counts only change when the needle or the data changes. Cache the per-row counts keyed on the needle, and let a pure cursor step reuse them, cloning only the active row. A memo cache is non-reactive state, so it lives in an imperative helper (a `window.*` function loaded from `index.html`, per [Scripting](/docs/scripting)) rather than a reactive variable — which is also the natural point to package the whole spine into a reusable component.

## See also

- [Highlight matching text inside Markdown](/docs/howto/highlight-inside-markdown) — the single-block foundation (`highlightText`, `highlightActive`, `highlightActiveIndex`)
- [Keep per-item state in an Items or List loop](/docs/howto/keep-per-item-state-in-a-loop) — `idKey` and virtualization
- [Paginate a list](/docs/howto/paginate-a-list) — the other way to move through a large dataset
- [List component reference](/docs/reference/components/List) — `idKey`, `scrollToIndex`
- [Markdown component reference](/docs/reference/components/Markdown) — `highlightText`, `highlightActiveIndex`
