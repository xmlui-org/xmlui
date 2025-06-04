# Resources

An XMLUI app can use static resources such as images, icons, and font. You can keep them in any folder, we illustrate using the `/resources` convention. to load and manage these resources. Here's a simple tree of resources.

```
resources/
├── image.png
├── favicon.ico
├── favicon.png
├── logo-dark.svg
├── logo.svg
```

Given this structure you can refer to resources like so.

```xmlui
<App
  name="Tutorial"
  logo="resources/logo.svg">
  logoDark="resources/logo-dark.svg">
  <AppHeader>
    <H2>Using Resources Tutorial</H2>
  </AppHeader>
  <Image src="/resources/image.png" />
</App>
```

Alternative you can enumerate resources in `config.json`.


```json copy filename="config.json"
{
  "name": "Tutorial",
  "version": "1.0.0",
  "resources": {
    "favicon": "resources/favicon.ico",
    "custom-logo": "resources/custom-logo.svg",
    "icon.empty-folder": "resources/empty-folder.svg",
    "breakfastImg": "resources/breakfast.jpg"
  }
}
```


### Using Resources

Finally, you can access newly added resources by their handles defined in the configuration object.

```xmlui copy filename="Main.xmlui"
<App
  name="Tutorial"
  logo="custom-logo">
  <AppHeader>
    <H2>Using Resources Tutorial</H2>
  </AppHeader>
  <Image src="resource:breakfastImg" />
</App>
```

<Playground
  previewOnly
  name="Example: Using Resources via Config"
  resources={{ logo: xmluiLogo }}
  app={`
  <App
    name="Tutorial"
    logo="custom-logo">
    <AppHeader>
      <H2>Using Resources Tutorial</H2>
    </AppHeader>
    <Image src="/resources/images/components/image/breakfast.jpg" fit="contain" width="240px" />
  </App>
  `}
/>

A number of things to note here:

- Icons need to be prefixed with `icon.` in order for the framework to correctly identify them (as in the case of "icon.empty-folder").
- When setting a source for an `Image` component and the source is a resource with a handle, the handle name needs to be prefixed with `resource:` in order to resolve the file location
- The `App` component automatically loads resources identified by the `logo` and `logo-dark` handles, thus setting its `logo` property is optional.

## Themes and Resources

Resources can be defined in different scopes: either they are global or are scoped to a specific theme.
Themes can have their own resources in their respective `theme files`.

See the article discussing <SmartLink href={THEMES_WHAT_A_THEME_CONTAINS}>Theme object structuring</SmartLink> to find out more.

## Overriding Existing Icons

The XMLUI framework has a built-in icon library that can be accessed via the `Icon` component.
These icons ship with the framwork but it is possible to replace predefined icons as you see fit.

In the example below, an icon with the name `home` already exists in the icon library but is overridden by the new `home.svg` file.

```json copy filename="config.json"
{
  "name": "Tutorial",
  "version": "1.0.0",
  "resources": {
    "icon.home": "resources/home.svg"
  }
}
```

```xmlui copy filename="Main.xmlui"
<App>
  <Icon name="home" />
</App>
```

<Playground
  previewOnly
  name="Example: Using Resources via Config"
  resources={{ "icon.home": home }}
  app={`
  <App>
    <Icon name="home" />
  </App>
  `}
/>

## Loading Fonts

It is also possible to load different kinds of font families in the configuration file and theme files.
There are two ways to go about loading and using fonts.

If you need more information on working with themes before continuing, see <SmartLink href={THEMES}>this article</SmartLink>.

### Loading from Folder

The first method is placing font files into the `resources` folder and referencing those fonts.
Fonts contained in font files are automatically added to the project, so you only need to reference them in the config file or theme file.

You may have a font file called "my-font.woff2" in the `resources` folder like so:

<FileTree>
  <FileTree.Folder name="resources" defaultOpen>
    <FileTree.File name="my-font.woff2" />
  </FileTree.Folder>
</FileTree>

This file contains the "My Font Family" font family, which can be referenced in a theme file:

```ts filename="my-theme.ts" {5-9, 14}
export const myTheme: ThemeDefinition = {
  name: "My Theme",
  id: "myTheme",
  resources: {
    "font.myFont": {
      fontFamily: "My Font Family",
      fontWeight: "400",
      src: "resources/my-font.woff2",
    },
  },
  themeVars: {
    // ...
    "fontFamily": '"My Font Family", "Helvetica Neue", Arial, Verdana, sans-serif',
    // ...
  }
}
```

### Loading from a CDN

The second method of working with font resources is to load them from a CDN.
In this case, you have to specify the CDN URL from where to fetch the fonts in the configuration file:

```ts filename="my-theme.ts" {5, 9}
export const myTheme: ThemeDefinition = {
  name: "My Theme",
  id: "myTheme",
  resources: {
    "font.roboto": "https://fonts.googleapis.com/css2?family=Roboto&display=swap"
  },
  themeVars: {
    // ...
    "fontFamily": 'Roboto, Helvetica, Arial, sans-serif',
    // ...
  }
}
```
