import { wrapComponent } from "xmlui";
import { CalendarRender } from "./CalendarRender";

export const BigCalendarMd = {
  description: "A calendar view powered by react-big-calendar",
  props: {
    events: { description: "Array of { title, start, end, allDay?, resource? }" },
    view: { description: "month | week | day | agenda", availableValues: ["month", "week", "day", "agenda"] },
    date: { description: "Controlled navigation date (ISO string)" },
    height: { description: "Container height (default 600px)" },
    width: { description: "Container width (default 100%)" },
  },
};

export const bigCalendarComponentRenderer = wrapComponent(
  "BigCalendar",
  CalendarRender,
  BigCalendarMd,
  {
    captureNativeEvents: true,
  },
);
