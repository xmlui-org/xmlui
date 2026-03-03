# Settings

The `Settings` component demonstrates how to manage application state that persists between sessions using [AppState](/docs/reference/components/AppState), [DataSource](/docs/reference/components/DataSource), and [APICall](/docs/reference/components/APICall) working together.

## State management pattern

XMLUI Invoice uses a three-component pattern for persistent settings:

1. **AppState** - Holds current settings in memory for immediate UI updates
2. **DataSource** - Loads initial settings from the database on app startup
3. **APICall** - Saves settings changes back to the database when triggered

```xmlui /AppState/ /DataSource/ /APICall/
<Component name="Settings">
  <DataSource url="/api/users" id="users" />
  <AppState id="settings" bucket="settingsState" />

  <APICall
    id="updateSettings"
    method="put"
    url="/api/settings"
    body="{settings.value}"
    completedNotificationMessage="Settings saved successfully"
    errorNotificationMessage="Failed to save settings"
  />
</Component>
```

## Loading settings on startup

In `Main.xmlui`, a `DataSource` loads settings from the database and populates the `AppState` when the app starts:

```xmlui /settingsLoader/ /settings.update/
<DataSource id="settingsLoader" url="/api/settings">
  <event name="loaded">
    settings.update({
      avatar_border_radius: settingsLoader.value[0].avatar_border_radius
    });
    delay(500);
  </event>
</DataSource>
```

The `loaded` event fires when the database fetch completes, then calls `settings.update()` to populate the AppState with the retrieved values.

## Reactive UI updates

Components throughout the app can bind directly to AppState values for immediate updates:

```xmlui /settings.value.avatar_border_radius/
<InvoiceAvatar
  url="{loggedInUser.avatar_url}"
  name="{loggedInUser.display_name}"
  borderRadius="{settings.value.avatar_border_radius}"
/>
```

When settings change, any bound UI elements automatically re-render with the new values.

## User input and gated saves

The Settings form uses a [TextBox](/docs/reference/components/TextBox) that updates AppState immediately, but database saves are gated behind a [Button](/docs/reference/components/Button):

```xmlui /onDidChange/ /onClick/
<TextBox
  value="{settings.value.avatar_border_radius}"
  onDidChange="{(value) => {
    if (value && settings.value) {
      settings.update({
        avatar_border_radius: value
      });
    }
  }}"
/>

<Button onClick="{() => updateSettings.execute()}">
  Save
</Button>
```

This pattern provides:

- **Immediate feedback** - UI updates as the user types
- **Controlled persistence** - Database only updates on explicit save
- **Error handling** - Save failures don't lose the user's input
