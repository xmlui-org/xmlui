import type { XmluiComponentContract } from "./types";

export const builtInComponentContracts: XmluiComponentContract[] = [
  {
    name: "App",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true, global: true },
    props: {},
    events: {},
  },
  {
    name: "H1",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {},
    events: {},
  },
  {
    name: "Button",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      label: { name: "label" },
    },
    events: {
      click: { name: "click", attributeName: "onClick" },
    },
  },
  {
    name: "Text",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      value: { name: "value" },
    },
    events: {},
  },
  {
    name: "Component",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      name: { name: "name" },
    },
    events: {},
  },
];

export function normalizeEventName(attributeOrEventName: string): string {
  if (/^on[A-Z]/.test(attributeOrEventName)) {
    const eventName = attributeOrEventName.slice(2);
    return eventName.charAt(0).toLowerCase() + eventName.slice(1);
  }
  return attributeOrEventName;
}
