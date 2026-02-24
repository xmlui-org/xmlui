# Add custom icons

Add custom icons to your XMLUI project by defining them in the config file.

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
