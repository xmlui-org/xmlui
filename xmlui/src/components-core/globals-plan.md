# New Feature: Global variables in XMLUI

Resources:
- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- Containers and state management: xmlui/dev-docs/containers.md
- Component conventions: xmlui/dev-docs/conv-create-components.md
- E2E conventions: xmlui/dev-docs/conv-e2e-testing.md

## Test prototype app

Main.xmlui:

```xmlui
<App>
  <Text>Count: {count}</Text>
  <IncButton label="First Button" />
  <IncButton label="Second Button" />
  <Button
    label="3rd button: {count}"
    onClick="count++" />
  <Button
    var.count="{0}"
    label="4th button (local): {count}"
    onClick="count++" />
</App>
```

Globals.xs:

```js
var count = 6*7;
```

IncButton.xmlui:

```xmlui
<Component name="IncButton">
  <Button
    label="{($props.label ?? 'Click me to increment') + ': ' + count}"
    onClick="count++" />
</Component>
```

When I run the app, the Text and the first three button should display "42" as their initial value. The "count" variable in 4th button shadows the global "count" variable and should display 0. As I click any of the first four buttons, they should increment the global count variable and these buttons plus the Text should show the incremented value.

