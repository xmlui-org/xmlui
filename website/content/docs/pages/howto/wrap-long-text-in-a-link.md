# Wrap long text in a Link

A `Link`'s own text **wraps by default** in a width-constrained container — you
usually don't need to do anything. Two situations break that: a long **unbroken
token** (like a URL) with no place to wrap, and a **nested `Text` child**. This
how-to covers both.

## Prose wraps; long URLs need `breakMode`

Plain wrapping happens at spaces and hyphens, so ordinary prose wraps on its own.
A long URL breaks only at its hyphens by default — not at `/` or `.` — so a long
slash-delimited segment still overflows its container. Set `breakMode="anywhere"`
(or `"word"`) to break mid-segment:

```xmlui-pg copy display name="Prose wraps; a URL needs breakMode" height="420px"
---app display
<App>
  <VStack width="260px" gap="$space-4" padding="$space-3" borderWidth="1px" borderColor="$color-surface-300">
    <VStack gap="$space-1">
      <Text variant="strong">Prose — wraps on its own</Text>
      <Link to="/">Read the full incident report and postmortem for last night's outage</Link>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">Long URL — overflows (breaks only at hyphens)</Text>
      <Link to="/">https://status.example.com/incidents/2026-07-28-database-failover-postmortem</Link>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">Long URL — breakMode="anywhere"</Text>
      <Link to="/" breakMode="anywhere">https://status.example.com/incidents/2026-07-28-database-failover-postmortem</Link>
    </VStack>
  </VStack>
</App>
```

`breakMode` values: `normal` (default, break at word boundaries only), `word`
(break long words when needed), `anywhere` (break at any character), `keep` (never
break within words), `hyphenate` (add hyphens). Use `word` or `anywhere` for URLs
and other long unbroken strings.

## The nested-`Text` trap

The wrapping above applies to the Link's **own** text. A nested `<Text>`
*component* child does not inherit it — the Link is an inline-flex row and the
nested `Text` keeps `min-width: auto`, so it can't shrink and silently overflows
instead of wrapping. Put the copy directly in the Link instead:

```xmlui-pg copy display name="Nested Text vs the Link's own text" height="380px"
---app display
<App>
  <VStack width="260px" gap="$space-4" padding="$space-3" borderWidth="1px" borderColor="$color-surface-300">
    <VStack gap="$space-1">
      <Text variant="strong">Nested Text child</Text>
      <Link to="/">
        <Text>This copy is a nested Text component inside the Link, so it does not share the Link's wrapping</Text>
      </Link>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">Link's own text</Text>
      <Link to="/">This copy is the Link's own content, so it wraps like ordinary link text</Link>
    </VStack>
  </VStack>
</App>
```

If you need a nested component for styling, don't put the wrapping copy inside the
Link. Render the paragraph as a plain `Text` and use a separate, compact `Link`
(or `Button`) as the click target beside or below it.

## Key points

**Link prose wraps by default.** A width-constrained `Link` wraps its own text at
word boundaries with no extra props — `overflowMode="flow"` is not required for
ordinary wrapping.

**Long slugs need `breakMode`.** URLs and paths break only at hyphens by default,
not within a long slash-delimited segment; pair them with `breakMode="anywhere"`
(or `"word"`) so they break to fit.

**A nested `<Text>` child bypasses the Link's wrapping.** Put the copy directly in
the Link, or separate the wrapping text from a compact click target.

**If you explicitly set a non-wrapping `overflowMode`, wrapping stops.**
`overflowMode="ellipsis"`, `"none"`, and `"scroll"` all force a single line; switch
to `overflowMode="flow"` to restore multi-line wrapping.

---

## See also

- [Customize link focus and decoration](/docs/howto/customize-link-focus-and-decoration) — style Link states without affecting layout
- [Wrap items across multiple rows](/docs/howto/wrap-items-across-multiple-rows) — flow *items* (not text) onto multiple lines in an `HStack`
- [Link component](/docs/reference/components/Link) — `overflowMode`, `breakMode`, `maxLines`, `preserveLinebreaks`
