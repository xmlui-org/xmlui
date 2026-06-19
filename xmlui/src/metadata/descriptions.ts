export const componentDescriptions: Record<string, string> = {
  App: "Root XMLUI application component.",
  Button: "Interactive button that can run XMLUI event handlers.",
  H1: "Top-level heading.",
  Text: "Inline text output.",
  HStack: "Horizontal stack layout.",
  VStack: "Vertical stack layout.",
  Stack: "Stack layout.",
  Items: "Repeats children or an item template for a collection.",
  DataSource: "Managed data loader with refetch and status APIs.",
  APICall: "Imperative managed API call component.",
  Pages: "Route switch container.",
  Page: "Route-specific page content.",
  NavPanel: "Navigation container.",
  NavLink: "Navigation link integrated with XMLUI routing.",
  Theme: "Scoped theme variable provider.",
};

export const propDescriptions: Record<string, string> = {
  label: "Visible label text.",
  enabled: "Controls whether the component is interactive.",
  initialValue: "Initial local value.",
  value: "Controlled value.",
  items: "Collection to render.",
  data: "Collection or option data.",
  url: "Route or request URL.",
  method: "HTTP method.",
  fallbackPath: "Route to navigate to when no page matches.",
  to: "Navigation target.",
  exact: "Requires exact route matching for active state.",
  mockData: "Mock data used by examples and tests.",
};

export const eventDescriptions: Record<string, string> = {
  click: "Runs when the component is clicked.",
  didChange: "Runs when the component value changes.",
  loaded: "Runs when data loading succeeds.",
  error: "Runs when an operation fails.",
  fetch: "Runs during a managed fetch.",
  success: "Runs when an API call succeeds.",
  beforeRequest: "Runs before an API call request is sent.",
};

export function componentDescription(name: string): string {
  return componentDescriptions[name] ?? `${name} component.`;
}

export function propDescription(name: string): string {
  return propDescriptions[name] ?? `${name} property.`;
}

export function eventDescription(name: string): string {
  return eventDescriptions[name] ?? `${name} event.`;
}

