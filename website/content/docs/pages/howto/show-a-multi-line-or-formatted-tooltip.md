# Show a multi-line or formatted tooltip

Use `tooltipMarkdown` instead of `tooltip`, and separate each line from the next
with a blank line (`\n\n`). A single newline is not a line break: Markdown
joins it to the line before, and the result is one long line.

## `tooltip` is plain text; `tooltipMarkdown` renders Markdown

Every visual component accepts both properties. `tooltip` shows its value as
text, exactly as written. `tooltipMarkdown` parses its value as Markdown, so
emphasis, inline code, paragraphs and lists all work. Hover each button:

```xmlui-pg copy display name="tooltip versus tooltipMarkdown" height="160px"
<App>
  <HStack padding="$space-12" gap="$space-4">
    <Button
      label="tooltip"
      tooltip="Deletes **every** file in `dist`" />
    <Button
      label="tooltipMarkdown"
      tooltipMarkdown="Deletes **every** file in `dist`" />
  </HStack>
</App>
```

The first tooltip shows the asterisks and backticks. The second renders them as
bold text and code. Neither property turns a newline into a line break, so
choosing `tooltipMarkdown` is the first step, not the whole fix.

## Separate lines with a blank line

Markdown treats a single newline inside a paragraph as a space. To start a new
line in the tooltip, start a new paragraph: put a blank line, `\n\n`, between
the lines.

```xmlui-pg copy display name="One newline is a space, a blank line is a break" height="220px"
<App>
  <HStack padding="$space-16" gap="$space-4">
    <Button
      label="One newline"
      tooltipMarkdown="{'Applies to:\nitem-one\nitem-two'}" />
    <Button
      label="Blank lines"
      tooltipMarkdown="{'Applies to:\n\nitem-one\n\nitem-two'}" />
    <Button
      label="Blank lines in the attribute"
      tooltipMarkdown="Applies to:

item-one

item-two" />
  </HStack>
</App>
```

**One newline** shows `Applies to: item-one item-two` on one line. **Blank
lines** shows three lines. The third button proves the same thing without an
expression: blank lines typed directly into the attribute value also reach the
Markdown renderer as paragraph breaks.

Note the curly braces in the first two buttons. `\n` is an escape sequence only
inside a quoted string in an expression (`"{'…\n\n…'}"`). In a plain attribute,
`tooltipMarkdown="a\n\nb"` shows the backslashes as literal text.

## Why a long tooltip runs off the edge

A tooltip is as wide as its longest line. One long sentence is one long line,
and it is not wrapped to a comfortable width:

```xmlui-pg copy display name="A long single line does not wrap" height="220px"
<App>
  <HStack padding="$space-16" gap="$space-4">
    <Button
      label="One long line"
      tooltipMarkdown="{'Applies to item-one, item-two, item-three and item-four, all of which will be rebuilt'}" />
    <Button
      label="Split into lines"
      tooltipMarkdown="{'Applies to:\n\nitem-one, item-two\n\nitem-three, item-four\n\nAll of these will be rebuilt.'}" />
  </HStack>
</App>
```

So the fix is structure, not width. Decide where the lines should break and put
a blank line there.

## Paragraphs or a list

Blank lines are not the only way to get separate lines. A Markdown list works in
a tooltip too. The two buttons below carry the same content, once as paragraphs
and once as a list, so you can hover each and compare:

```xmlui-pg copy display name="Paragraphs and a list" height="260px"
<App>
  <HStack padding="$space-16" gap="$space-4">
    <Button
      label="As paragraphs"
      tooltipMarkdown="{'Applies to:\n\n`item-one`\n\n`item-two`'}" />
    <Button
      label="As a list"
      tooltipMarkdown="{'Applies to:\n\n- `item-one`\n- `item-two`'}" />
  </HStack>
</App>
```

List items need only a single newline between them (`\n- `), but the list itself
needs a blank line before it, to separate it from the lead-in paragraph.

## Build computed tooltips in a function

When the tooltip depends on data, assemble the lines in an array and join them
with `'\n\n'` in a function, rather than concatenating Markdown inside the
attribute. The attribute stays readable and the blank lines can't be forgotten
for one case:

```xmlui-pg copy display name="Build the tooltip in a function" height="260px"
<App>
  <script>
    function describeChange(change) {
      const lines = ['**' + change.title + '**', 'Applies to:'];
      const files = change.files.map(file => '`' + file + '`');
      return lines.concat(files).join('\n\n');
    }
  </script>
  <HStack padding="$space-16" gap="$space-4">
    <Items data="{[
      { title: 'Rename the worklist route', files: ['app/Main.xmlui', 'server/routes/worklist.ts'] },
      { title: 'Fix the tooltip', files: ['app/components/Toolbar.xmlui'] }
    ]}">
      <Button label="{$item.title}" tooltipMarkdown="{describeChange($item)}" />
    </Items>
  </HStack>
</App>
```

The backticks around each file path do more than change the font. A long
identifier set in code style reads as a name rather than as a run of words,
and it can't be misread as Markdown: underscores and asterisks inside the
backticks stay literal.

## Placement and appearance

- To change where the tooltip opens, use `tooltipOptions`, for example
  `tooltipOptions="bottom; start"`. See
  [Tooltip](/docs/reference/components/Tooltip) for the options.
- Tooltip lines are set with `lineHeight-Tooltip`, which defaults to `1`. If
  multi-line content feels tight, loosen it with a theme variable, as described
  in [Customize Tooltip appearance](/docs/howto/customize-tooltip-appearance).

## See also

- [Tooltip](/docs/reference/components/Tooltip): the `tooltip`,
  `tooltipMarkdown` and `tooltipOptions` properties, and the `Tooltip` component
  for templated content
- [Customize Tooltip appearance](/docs/howto/customize-tooltip-appearance):
  theme variables for padding, colours, line height and the arrow
- [Render Markdown content as a page](/docs/howto/render-markdown-content-as-a-page):
  the same Markdown rules, applied to a whole page
