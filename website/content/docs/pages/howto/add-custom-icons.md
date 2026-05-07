# Add custom icons

Register SVG icons via `config.json` and reference them by name in any component's `icon` property.

XMLUI ships with 100+ built-in icons, but your app may need brand-specific or domain-specific graphics. Register a custom SVG file in `config.json` under `resources` with the `icon.` prefix, then use the name (without the prefix) anywhere an `icon` prop is accepted — `Button`, `MenuItem`, `NavLink`, `Icon`, and more.

## 1. Specify the icon location

In `config.json`, set the location of the icon file and specify the name you'll use to reference it in markup.

> **NOTE:** You can override built-in icons with custom ones using the same names.

```json {5-7} copy
{
  "name": "Tutorial",
  "version": "0.0.1",
  "defaultTheme": "brand-theme",
  "resources": {
    "icon.test": "resources/bell.svg",
  }
}
```

## 2. Use the icon

In markup, use the name you set in the config without the `icon.` prefix:

```xmlui copy 
<App>
  <Icon name="test" />
</App>
```

## Where to find SVG icons

XMLUI ships with 100+ built-in icons, but you'll often want something specific. Several free libraries publish individual SVG files you can drop straight into a `resources/` folder:

- [Lucide](https://lucide.dev) — clean line icons, ~1500, MIT
- [Heroicons](https://heroicons.com) — Tailwind Labs, MIT, solid + outline variants
- [Phosphor](https://phosphoricons.com) — six weights from thin to duotone, MIT
- [Tabler Icons](https://tabler.io/icons) — very large set (~5500), MIT
- [Simple Icons](https://simpleicons.org) — brand and company logos, CC0
- [Iconify](https://iconify.design) — searchable aggregator across many sets

Download the SVG, save it under your `resources/` folder, register it under `resources` in `config.json` with the `icon.` prefix (as shown above), and reference it by name in any component's `icon` prop.

## Key points

**`icon.` prefix registers the icon**: In `config.json`, add `"icon.myName": "path/to/file.svg"` under `resources`. The part after `icon.` becomes the name you use in markup — `<Icon name="myName" />`.

**Any component with an `icon` prop can use it**: `Button icon="myName"`, `MenuItem icon="myName"`, `NavLink icon="myName"` — once registered, the icon is available everywhere, not just in `<Icon>`.

**Override built-in icons by reusing the name**: Register `"icon.trash": "resources/custom-trash.svg"` and every component that uses the `trash` icon will render your custom SVG instead of the built-in one.

**SVG files must be standalone**: The file should be a complete `<svg>` element with a `viewBox`. Avoid embedded raster images or external references — they may not render in all contexts. When pulling icons from third-party libraries, strip hardcoded `width`/`height` so the icon scales with the consuming component's `size` prop, ensure a `viewBox` is present, and use `fill="currentColor"` (or `stroke="currentColor"`) on shape elements so the icon picks up the surrounding text color.

**`size` and `fallback` on `<Icon>`**: Set `size="sm"`, `"md"`, `"lg"`, or an explicit pixel value. Use `fallback="question"` to show a fallback icon when the requested name is not found.

---

## See also

- [Create a custom color theme](/docs/howto/create-a-custom-color-theme) — customise the visual identity alongside icons
- [Add a dropdown menu to a button](/docs/howto/add-a-dropdown-menu-to-a-button) — use custom icons on menu items
- [Build a toolbar with overflow menu](/docs/howto/build-a-toolbar-with-overflow-menu) — toolbar buttons with custom icons
