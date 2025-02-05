# `AppRoot`

The `AppRoot` component is responsible for running a pre-compiled xmlui app. It receives the internal representation of the app markup and code (coming from either code-behind files or inlined markup expressions) and executes the app accordingly.

`AppRoot` delegates its responsibilities to these helper components:
- `AppWrapper`: This component wraps the application into other layers of (nested) components that provide app functionality and services requiring unique interaction with the browser or the React environment. Here are a few of them:
  - Handling client-side routing (with react-router-dom)
  - Managing data queries and caching (with @tanstack/react-query)
  - Managing modal and popups
  - Providing an inspection layer for (future) tools (such as debuggers, markup, code, and state inspectors)
  - Application theme management
  - Providing a React error boundary
  - Managing React strict mode
  - Providing icons for the app
  - Allow setting browser tab text (application title)
- `AppContent`: This component wraps the entire app into a container with these particular responsibilities:
  - Managing the application state
  - Helping the app with viewport-related functionality (e.g., information of viewport size, supporting responsive apps)
  - Providing xmlui-defined methods and properties for apps, such as `activeThemeId`, `navigate`, `toast`, and many others.

These components work together this way:

```xml
<AppRoot>
  <!-- Other layers -->
  <AppWapper>
    <!-- Other layers -->
    <AppContent>
  </AppWrapper>
</AppRoot>
```

> **Note:** `AppWrapper` and `AppContent` are private components used solely within `AppRoot`. We may split their responsibilities in another way in the future.

`AppRoot` has the follwing properties:

- `node`: The root node of the application definition; the internal representation of the entire app to run
- `previewMode`: Optional. If set to `true`, the app is displayed in preview mode (uses different routing and changes some aspects of browser integration).
- `routerBaseName`: Optional. The name is used as the base name in the router definition.
- `contributes`: Apps can provide their custom (third-party) components, themes (and, in the future, other artifacts) used in the application code, and markup. This property contains these artifacts.
- `globalProps`: Optional. Apps can define global configuration values (connection strings, titles, names, etc.) used within the app through the `appGlobals` property. This property contains the values to pass to `appGlobals`.
- `resources`: Optional. Apps may use external resources (images, text files, icons, etc.). This property contains the dictionary of these resources.
- `standalone`: Optional. This property indicates that the xmlui app runs as a standalone app. Its value can be queried in the app code via the `standalone` global property.
- `trackContainerHeight`: Optional. This property indicates whether the app should track the height of the app container. We created this property for the preview component used in the documentation platform. It has no other use.
- `decorateComponentsWithTestId`: Optional. This property signs that we use the app in the end-to-end test environment. Components should use their IDs as test IDs added to the rendered DOM so that test cases can refer to the particular DOM elements.
- `debugEnabled`: Optional. This property signs that app rendering runs in debug mode. When this property is set, components may display additional information in the browser's console.
- `apiInterceptor`: If the app has an emulated API, this property contains the corresponding API endpoint descriptions.
- `defaultTheme`: The ID of the default theme to use when the app starts.
- `defaultTone`: The default tone to use when the app starts ("light" or "dark").
- `resourceMap`: The app can map resource names to URIs used to access a particular resource. This dictionary contains these mappings.
- `sources`: An app can display the source code for learning (and debugging) purposes. This property is a dictionary of filename and file content pairs.
- `componentManager`: The component manager object that a standalone app passes to `AppRoot`.

## Component Co-operation

The `AppRoot` component uses a `ComponentProvider` instance around `AppWrapper`. `ComponentProvider` is a context around `AppWrapper`; it holds the component registry the rendering engine uses to run an xmlui app:

```xml
<ComponentProvider>
  <AppWrapper>
</ComponentProvider>
```

`AppRoot` passes its `contributes` and `componentManager` properties to `ComponentProvider`. `AppWrapper` receives all properties except `componentManager`.

Before passing the application definition (received in its `node` property), `AppRoot` transforms it in these steps:
1. If the root component is not a `Theme` component, `AppRoot` wraps the entire app into a `Theme` node marked as the root theme.
2. It wraps the resulting app definition (after Step 1) into an intrinsic `Container` component, the root container for managing the rendering engine's state.

With these steps, `AppRoot` ensures that the app uses the theme infrastructure and has a root container.

`AppWrapper` wraps the `AppContent` object into several layers, passing down some of the `AppContent` properties with the container (and theme) wrapped application definition.

`AppContent` wraps the running app with several React components to provide these services for the app:
- It has an infrastructure for the `AppState` component that allows app state information to be stored in "buckets". Using AppState, the app can avoid transferring information through component hierarchies.
- It observes application viewport changes and can help with responsive UI rendering.
- It injects a layer of global functions and properties the app code can access to implement its functionality.

```xml
<AppContext.Provider>
  <AppStateContext.Provider>
    {renderRoot(rootContainer, memoedVars)}
  </AppStateContext.Provider>
 </AppContext.Provider>
```

To display the application and implement its behavior, `AppContent` invokes the `renderRoot` function. `renderRoot` receives two parameters:
- The first parameter is the app definition wrapped into the root `Container` component (as the `AppRoot` component already prepared it).
- Second, a reference to an empty map of memoized reactive variables (the root object does not define any reactive variables for the app)

The function returns a `ReactNode` object representing the running app as a React component.

## Implementation Details

Start checking the details of the `src/components-core/AppRoot.tsx` file. The main points that help you grasp the details are these:
- `function AppRoot`
- `function AppWrapper`
- `function AppContent`
- `type AppWrapperProps`
