# Per-component: BigCalendar

When events are domain-specific, the generic wrapper can't know what a meaningful trace looks like. A calendar has `selectEvent`, `navigate`, and `viewChange` -- none of these are standard XMLUI events. The wrapper provides the plumbing; the render component provides the semantics.

## The plumbing: `captureNativeEvents`

In `CalendarWrapped.tsx`, the wrapper config includes:

```typescript
{
  captureNativeEvents: true,
}
```

This tells `wrapComponent` to inject an `onNativeEvent` callback into the render component's props. The render component calls this callback whenever a library-native event fires, and the wrapper traces it automatically with a `native:` prefix.

## The semantics: structured native events

In `CalendarRender.tsx`, the render component maps react-big-calendar's callbacks to `onNativeEvent` calls with structured fields:

```typescript
onNativeEvent?.({
  type: "selectEvent",
  displayLabel: event.title || "event selected",
  title: event.title,
  start: event.start,
  end: event.end,
});
```

```typescript
onNativeEvent?.({
  type: "navigate",
  displayLabel: dayjs(date).format("MMMM YYYY"),
  date: date.toISOString(),
});
```

```typescript
onNativeEvent?.({
  type: "viewChange",
  displayLabel: view,
  view,
});
```

The `displayLabel` field is what appears in the inspector and in trace-tools output. "Team Standup" is more useful than "selectEvent". "March 2026" is more useful than "navigate". The wrapper doesn't need to know what a calendar event is -- the render component provides that context.

Notice that the trace also includes the `aria-label` from the XMLUI markup -- `BigCalendar [Demo calendar]`. That's Level 1's prop forwarding at work: `wrapComponent` forwards `aria-label` to the render component automatically, and the trace system picks it up as the component's accessible name. If a page had two calendars, the trace would distinguish them by label. The levels build on each other.

## Demo

Interact with the calendar below -- click an event, navigate between months, switch between Month/Week/Day/Agenda views.

```xmlui-pg id="demo-b8b7"
---app display
<App>
  <BigCalendar
    aria-label="Demo calendar"
    height="500px"
    events='{[
      {"title": "Team Standup", "start": "2026-03-10T09:00:00", "end": "2026-03-10T09:30:00"},
      {"title": "Design Review", "start": "2026-03-11T14:00:00", "end": "2026-03-11T15:00:00"},
      {"title": "Sprint Planning", "start": "2026-03-12T10:00:00", "end": "2026-03-12T11:30:00"},
      {"title": "All Hands", "start": "2026-03-15T16:00:00", "end": "2026-03-15T17:00:00"},
      {"title": "1:1 with Manager", "start": "2026-03-17T11:00:00", "end": "2026-03-17T11:30:00"},
      {"title": "Release Retro", "start": "2026-03-20T15:00:00", "end": "2026-03-20T16:00:00"}
    ]}' />
</App>
```

## Before and after

Without native event capture, clicking a calendar event or navigating between months produces no trace at all. These aren't standard XMLUI events like `didChange` or `gotFocus` -- they're react-big-calendar's own callbacks (`onSelectEvent`, `onNavigate`, `onView`). The wrapper doesn't know they exist, so XMLUI's trace system sees nothing.

With `captureNativeEvents: true` and structured `onNativeEvent` calls, each interaction appears in the inspector with a meaningful label:

```text
native:viewChange "week"
native:navigate "April 2026"
```

Those are real labels from the latest trace export. The important point is that the calendar is no longer opaque to the trace system: instead of silence, the Inspector gets domain-level events that describe what the user actually did.

## The pattern

The wrapper provides the plumbing (`captureNativeEvents: true` injects `onNativeEvent`). The render component provides the semantics (structured `displayLabel` fields). This division of labor means:

- The wrapper config is minimal -- one boolean flag
- The render component is pure React -- any React developer can write it
- New event types don't require changes to the core wrapper engine
- The trace output is meaningful to humans and AIs without reading source code

This is the pattern for any third-party library with domain-specific events: ECharts (bar clicks with data values), Mapbox (feature clicks with coordinates), ag-Grid (cell edits with row data). The render component knows what the events mean. The wrapper knows how to trace them.
