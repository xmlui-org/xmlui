import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import classnames from "classnames";
import { useTheme } from "xmlui";
import styles from "./Calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

function resolveCssValue(value: string | undefined, el: HTMLElement | undefined): string {
  if (!value || !el) return "";
  const varMatch = value.match(/var\((--[^)]+)\)/);
  if (varMatch) {
    return getComputedStyle(el).getPropertyValue(varMatch[1]).trim();
  }
  return value;
}

function parseEvents(events: any): any[] {
  if (!events) return [];
  const arr = typeof events === "string" ? JSON.parse(events) : events;
  if (!Array.isArray(arr)) return [];
  return arr.map((e: any) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));
}

let styleIdCounter = 0;

export function CalendarRender({
  events,
  view: viewProp = "month",
  date: dateProp,
  height = "600px",
  width = "100%",
  className,
  registerComponentApi,
  onNativeEvent,
}: any) {
  const [currentView, setCurrentView] = useState(viewProp);
  const [currentDate, setCurrentDate] = useState(dateProp ? new Date(dateProp) : new Date());
  const { getThemeVar, root } = useTheme();
  const [scopeId] = useState(() => `rbc-theme-${++styleIdCounter}`);

  const resolve = useCallback(
    (varName: string, fallback: string = "") => {
      const raw = getThemeVar(varName);
      return resolveCssValue(raw, root) || fallback;
    },
    [getThemeVar, root],
  );

  const themeStyles = useMemo(() => {
    const eventBg = resolve("color-primary-500", "#3174ad");
    const eventSelected = resolve("color-primary-700", "#265985");
    const todayBg = resolve("color-primary-50", "#eaf6ff");
    const activeButtonBg = resolve("color-primary-100", "#d0e8f7");
    const textColor = resolve("textColor-primary", "#333");
    const borderColor = resolve("color-surface-200", "#ddd");
    const surfaceBg = resolve("color-surface-50", "#fff");
    const primary500 = resolve("color-primary-500", "#3174ad");

    return `
      .${scopeId} .rbc-event,
      .${scopeId} .rbc-day-slot .rbc-background-event {
        background-color: ${eventBg};
        border: 1px solid ${eventSelected};
      }
      .${scopeId} .rbc-event.rbc-selected {
        background-color: ${eventSelected};
      }
      .${scopeId} .rbc-today {
        background-color: ${todayBg};
      }
      .${scopeId} .rbc-toolbar button.rbc-active {
        background-color: ${activeButtonBg};
        border-color: ${primary500};
        color: ${textColor};
      }
      .${scopeId} .rbc-toolbar button:hover,
      .${scopeId} .rbc-toolbar button:focus {
        background-color: ${activeButtonBg};
        border-color: ${primary500};
      }
      .${scopeId} .rbc-toolbar button {
        color: ${textColor};
        border-color: ${borderColor};
      }
      .${scopeId} .rbc-header,
      .${scopeId} .rbc-month-view,
      .${scopeId} .rbc-day-bg + .rbc-day-bg,
      .${scopeId} .rbc-month-row + .rbc-month-row,
      .${scopeId} .rbc-header + .rbc-header,
      .${scopeId} .rbc-time-content,
      .${scopeId} .rbc-time-header-content,
      .${scopeId} .rbc-timeslot-group {
        border-color: ${borderColor};
      }
      .${scopeId} .rbc-toolbar {
        color: ${textColor};
      }
      .${scopeId} .rbc-off-range-bg {
        background-color: ${surfaceBg};
      }
      .${scopeId} .rbc-show-more {
        color: ${primary500};
      }
      .${scopeId} .rbc-agenda-event-cell a {
        color: ${primary500};
        text-decoration: underline;
      }
      .${scopeId} .rbc-agenda-event-cell a:hover {
        color: ${eventSelected};
      }
    `;
  }, [resolve, scopeId]);

  useEffect(() => {
    if (viewProp) setCurrentView(viewProp);
  }, [viewProp]);

  useEffect(() => {
    if (dateProp) setCurrentDate(new Date(dateProp));
  }, [dateProp]);

  const eventsKey = useMemo(() => JSON.stringify(events), [events]);
  const parsedEvents = useMemo(() => parseEvents(events), [eventsKey]);

  const handleSelectEvent = useCallback(
    (event: any) => {
      if (event.resource?.url) {
        window.open(event.resource.url, "_blank");
      }
      onNativeEvent?.({
        type: "selectEvent",
        displayLabel: event.title || "event selected",
        title: event.title,
        start: event.start,
        end: event.end,
        resource: event.resource,
      });
    },
    [onNativeEvent],
  );

  const handleNavigate = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      onNativeEvent?.({
        type: "navigate",
        displayLabel: dayjs(date).format("MMMM YYYY"),
        date: date.toISOString(),
      });
    },
    [onNativeEvent],
  );

  const handleViewChange = useCallback(
    (view: string) => {
      setCurrentView(view);
      onNativeEvent?.({
        type: "viewChange",
        displayLabel: view,
        view,
      });
    },
    [onNativeEvent],
  );

  const calendarComponents = useMemo(
    () => ({
      agenda: {
        event: ({ event }: any) => {
          const url = event.resource?.url;
          if (url) {
            return (
              <a href={url} target="_blank" rel="noopener noreferrer">
                {event.title}
              </a>
            );
          }
          return <span>{event.title}</span>;
        },
      },
    }),
    [],
  );

  useEffect(() => {
    registerComponentApi?.({
      getView: () => currentView,
      getDate: () => currentDate,
    });
  }, [registerComponentApi, currentView, currentDate]);

  return (
    <div
      className={classnames(styles.calendarContainer, scopeId, className)}
      style={{ width, height }}
    >
      <style>{themeStyles}</style>
      <Calendar
        localizer={localizer}
        events={parsedEvents}
        view={currentView as any}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        components={calendarComponents}
        style={{ height: "100%" }}
      />
    </div>
  );
}
