# Standalone Apps

When we use an xmlui app as the full content of a particular website page, we call this app a *standalone app* in contrast to websites where the xmlui app is just a part of the page. This article describes how the xmlui engine loads and starts a a standalone app.

A standalone app can be started in two modes:
- Static file serving: no build before start
- Dev/Build mode: the app's source files are prepared for quick startup (some build steps before the start)

## The `StandaloneApp` component

The `StandaloneApp` component is the root React component and implements the logic of loading, processing, and starting a standalone app.

`StandaloneApp` has the following properties:

- `appDef`: Optional application definition. This property contains a value only when the app has been built with INLINE_ALL mode (for example, during end-to-end tests).
- `decorateComponentsWithTestId`: Setting this property to `true` allows components to be decorated with IDs the end-to-end test engine uses. By default, it's undefined (meaning `false`)
- `debugEnabled`: Some components display debug messages to the console log when this property is `true`. 
- `runtime`: If the app went through a build phase, this object contains the pre-compiled versions of application source files. When using static file serving mode, this property has no value.
- `components`: Additional (third-party) component definitions to use with the app. By default, this property has no value.
- `componentManager`: An optional manager object used within an app with static file serving mode to manage third-party components. With built apps, this property has no value.

## Loading a Standalone App

When the app goes through the build phase, the `StandaloneApp` receives the pre-compiled app definition in its `runtime` property and prepares the runnable representation (`StandaloneAppDescription`) from this definition.

In static file serving mode, `StandaloneApp` comprises several files from the website's static files' `src` folder. As an app running in the browser does not have a list of application source files, it uses a discovery strategy that involves these steps:

1. It prepares to fetch the fundamental application files (fetches them simultaneously):
  - Reads the `Main.xmlui` file to create the app's entry point. That file must exist; otherwise, the app won't start.
  - Reads the `Main.xmlui.xs` file. If it exists, the code-behind file is parsed and merged with the app's definition.
  - The engine reads the `config.json` file (app configuration).
  - If the configuration file exists, the engine checks the `themes` property of the configuration and prepares to fetch the theme files according to the configuration entries. It also checks the `components` property and prepares to fetch the component markup files.
2. The engine completes the fetching of the prepared files. When a file is successfully fetched, the engine parses and processes it according to its contents (markup, code-behind, theme)
3. The engine reports any errors found while processing the fetched files.
4. It checks if the default theme is defined.
  - If it is not, the engine uses the default xmlui theme.
  - When defined, the engine searches the existing theme definitions for the default theme. If it cannot find the theme, it tries to fetch it from the `themes` folder.
5. The engine scans the `Main.xmlui` file and the component markup files loaded in step 2 to check if any refer to an unloaded component.
6. The engine tries to load the missing component files and also fetches the optional code-behind files for these components (searches for them beside the corresponding markup files). It looks up the yet-unloaded component files from the `components` folder.
7. The engine reports any errors while processing the component markup and code-behind files.

The engine prepares the runnable representation (`StandaloneAppDescription`) from the files loaded and processed in the previous steps.

## Using Emulated APIs

The xmlui engine allows using emulated API endpoints. The engine loads the definition of these API endpoints in one of the following ways depending on the app's hosting model:
1. If the app has a build phase, its configuration file contains the potential API emulation object (created during the build).
2. With the static file hosting mode, the `index.html` file should load the API emulation object before it loads the xmlui engine file. When the engine file loads, it observes the emulated API endpoints and uses them while running the app.

## Starting the Standalone App

When the app is successfully loaded, `StandaloneApp` delegates the responsibility of running the app to the `ApiInterceptorProvider` and `RootComponent` components that work together:

```xml
<ApiInterceptorProvider>
  <RootComponent />
</ApiInterceptorProvider>
```

As their name suggests, they have these responsibilities:
`ApiInterceptorProvider`: When an emulated API endpoint is invoked, this component redirects the call to the emulated code running in the browser.
`RootComponent`: Implements the engine's rendering (and application execution) logic.

## Implementation Details

Start checking the details of the `src/components-core/StandaloneApp.tsx` file. The main points that help you grasp the details are these:
- `type StandaloneAppProps`
- `function StandaloneApp`
- `function useStandalone`
- `function startApp`
