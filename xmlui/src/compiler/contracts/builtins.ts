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
    name: "Stack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: layoutProps(),
    events: {},
  },
  {
    name: "HStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: layoutProps(),
    events: {},
  },
  {
    name: "VStack",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: layoutProps(),
    events: {},
  },
  {
    name: "Button",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      label: { name: "label" },
      enabled: { name: "enabled" },
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
      variant: { name: "variant" },
    },
    events: {},
  },
  {
    name: "Items",
    kind: "builtin",
    allowsChildren: true,
    declarations: { local: true },
    props: {
      items: { name: "items" },
      data: { name: "data" },
      reverse: { name: "reverse" },
    },
    events: {},
    templates: {
      itemTemplate: { name: "itemTemplate" },
    },
    contextVariables: {
      $item: { name: "$item" },
      $itemIndex: { name: "$itemIndex" },
      $isFirst: { name: "$isFirst" },
      $isLast: { name: "$isLast" },
    },
  },
  {
    name: "TextBox",
    kind: "builtin",
    allowsChildren: false,
    declarations: {},
    props: {
      initialValue: { name: "initialValue" },
      placeholder: { name: "placeholder" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      label: { name: "label" },
    },
    events: {
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Checkbox",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      initialValue: { name: "initialValue" },
      label: { name: "label" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      indeterminate: { name: "indeterminate" },
    },
    events: {
      click: { name: "click", attributeName: "onClick" },
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Select",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      initialValue: { name: "initialValue" },
      value: { name: "value" },
      enabled: { name: "enabled" },
      readOnly: { name: "readOnly" },
      placeholder: { name: "placeholder" },
      label: { name: "label" },
      data: { name: "data" },
      valueField: { name: "valueField" },
      labelField: { name: "labelField" },
      multiSelect: { name: "multiSelect" },
      clearable: { name: "clearable" },
      searchable: { name: "searchable" },
    },
    events: {
      didChange: { name: "didChange", attributeName: "onDidChange" },
      gotFocus: { name: "gotFocus", attributeName: "onGotFocus" },
      lostFocus: { name: "lostFocus", attributeName: "onLostFocus" },
    },
  },
  {
    name: "Option",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      value: { name: "value" },
      label: { name: "label" },
      enabled: { name: "enabled" },
      keywords: { name: "keywords" },
    },
    events: {},
  },
  {
    name: "Slot",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    acceptsArbitraryProps: true,
    props: {
      name: { name: "name" },
    },
    events: {},
  },
  {
    name: "property",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      name: { name: "name" },
    },
    events: {},
  },
  {
    name: "method",
    kind: "builtin",
    allowsChildren: true,
    declarations: {},
    props: {
      name: { name: "name" },
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

function layoutProps(): XmluiComponentContract["props"] {
  return {
    gap: { name: "gap" },
    orientation: { name: "orientation" },
    reverse: { name: "reverse" },
    wrapContent: { name: "wrapContent" },
    width: { name: "width" },
    height: { name: "height" },
    padding: { name: "padding" },
    horizontalAlignment: { name: "horizontalAlignment" },
    verticalAlignment: { name: "verticalAlignment" },
  };
}

export function normalizeEventName(attributeOrEventName: string): string {
  if (/^on[A-Z]/.test(attributeOrEventName)) {
    const eventName = attributeOrEventName.slice(2);
    return eventName.charAt(0).toLowerCase() + eventName.slice(1);
  }
  return attributeOrEventName;
}
