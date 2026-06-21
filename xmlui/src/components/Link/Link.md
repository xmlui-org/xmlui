%-DESC-START

## Using Link

### `Link` Appearance

You can use the `label` and `icon` properties of a `Link` to set its text and icon to display. If you want a custom appearance, you can nest your visual representation into `Link`:

```xmlui-pg copy {3-6} display name="Example: custom Link content"
<App>
  <Link to="https://docs.xmlui.org/" target="_blank">
    <HStack verticalAlignment="center">
      <Stack width="16px" height="16px" backgroundColor="purple" />
      XMLUI introduction
    </HStack>
  </Link>
</App>
```

%-DESC-END

%-PROP-START active

```xmlui-pg copy display name="Example: active" /active/
<App>
  <Link>I'm an inactive link (by default)</Link>
  <Link active="true">I'm an active link</Link>
  <Link active="false">I'm an inactive link (explicit setting)</Link>
</App>
```

%-PROP-END

%-PROP-START enabled

```xmlui-pg copy display name="Example: enabled" /enabled/
<App>
  <Link>I'm an enabled link (by default)</Link>
  <Link enabled="false">I'm a disabled link</Link>
  <Link enabled="true">I'm an enabled link (explicit setting)</Link>
</App>
```

%-PROP-END

%-PROP-START icon

```xmlui-pg copy display name="Example: icon"
<App>
  <Link icon="home" label="Home" />
  <Link icon="drive">Drives</Link>
</App>
```

>[!INFO]
> If you want to specify paddings and gaps or put the icon to the right of the link text, use your custom link template (nest it into `Link`).

%-PROP-END

%-PROP-START target

The following sample opens its link in a new tab:

```xmlui-pg copy display name="Example: target"
<App>
  <Link to="https://docs.xmlui.org/" target="_blank">
    Open XMLUI overview in a new tab
  </Link>
</App>
```

%-PROP-END
