# Runtime style injection: Calendar

When the third-party library doesn't expose CSS custom properties, you bridge at runtime. The render component resolves XMLUI design tokens via `useTheme()` and injects scoped styles.

## The bridge

react-big-calendar uses class-based CSS -- `.rbc-event`, `.rbc-toolbar button`, `.rbc-today`. There are no CSS custom properties to assign. The render component in `CalendarRender.tsx` resolves XMLUI tokens to actual color values and generates a scoped stylesheet:

```typescript
const { getThemeVar, root } = useTheme();

const themeStyles = useMemo(() => {
  const eventBg = resolve("color-primary-500", "#3174ad");
  const todayBg = resolve("color-primary-50", "#eaf6ff");
  const textColor = resolve("textColor-primary", "#333");
  const borderColor = resolve("color-surface-200", "#ddd");
  // ...
  return `
    .${scopeId} .rbc-event { background-color: ${eventBg}; }
    .${scopeId} .rbc-today { background-color: ${todayBg}; }
    .${scopeId} .rbc-toolbar button { color: ${textColor}; }
    // ...
  `;
}, [resolve, scopeId]);
```

The `scopeId` ensures styles don't leak to other calendar instances. The `resolve()` helper handles CSS `var()` references -- it calls `getComputedStyle` to get the actual color value, because class-based CSS can't consume `var()` references the way CSS custom properties can.

## Demo

This is the same calendar from the [native events](/docs/guides/wrap-component/bigcalendar) page. The calendar's event backgrounds, toolbar buttons, borders, and "today" highlight all come from XMLUI design tokens.

```xmlui-pg id="demo-b767"
---app display
<App>
  <BigCalendar
    aria-label="Themed calendar"
    height="500px"
    events='{[
      {"title": "Team Standup", "start": "2026-03-10T09:00:00", "end": "2026-03-10T09:30:00"},
      {"title": "Design Review", "start": "2026-03-11T14:00:00", "end": "2026-03-11T15:00:00"},
      {"title": "Sprint Planning", "start": "2026-03-12T10:00:00", "end": "2026-03-12T11:30:00"}
    ]}' />
</App>
```

## When this pattern is needed

Runtime style injection is needed when the library uses class-based CSS with no custom property API. You resolve theme tokens at runtime and generate scoped CSS. It's more work than the SCSS bridge -- you're writing CSS-in-JS -- but it handles any library.

Libraries like react-big-calendar, FullCalendar, and many older React component libraries fall into this category. Newer libraries (Radix, Shoelace, Smart UI) increasingly expose CSS custom properties, making the simpler SCSS bridge possible.

## Not orthogonal to wrapping

Unlike the Gauge's SCSS bridge, the calendar's runtime bridge lives in the render component -- it imports `useTheme()` from XMLUI and calls `getThemeVar()`. This is unavoidable: the bridge needs runtime access to computed styles. But the wrapper config still doesn't mention theming. The division of labor holds: the wrapper handles props, events, and tracing. The render component handles the library-specific bridge.

## Two strategies, same goal

Both the [Gauge](/docs/guides/wrap-component/gauge-theme) (SCSS) and Calendar (runtime) bridges achieve the same outcome: the component respects XMLUI's design tokens. The choice between them depends on the library, not on the component or the wrapping technique.
