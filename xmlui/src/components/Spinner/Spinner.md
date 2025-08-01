%-DESC-START

While it is visible, the action is yet to be completed; on completion, the UI logic may opt to remove the component.

## Using the `Spinner`

```xmlui-pg copy display name="Example: using Spinner"
<App>
  <Spinner />
</App>
```

>[!INFO]
> `Spinner` ignores the `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, and `maxHeight` properties. If you want to change its size, use the `size-Spinner` theme variable (see details is the [Styling](#styling) section).

%-DESC-END

%-PROP-START delay

Use the buttons to toggle between the two `Spinners`.

```xmlui-pg copy {8-9} display name="Example: delay"
<App>
  <variable name="noDelay" value="{true}" />
  <variable name="yesDelay" value="{false}" />
  <HStack gap="$space-0_5">
    <Button label="No delay" onClick="noDelay = true; yesDelay = false;" />
    <Button label="1000 ms delay" onClick="noDelay = false; yesDelay = true;" />
  </HStack>
  <Spinner when="{noDelay}" delay="0" />
  <Spinner when="{yesDelay}" delay="1000" />
</App>
```

%-PROP-END

%-PROP-START fullScreen

```xmlui-pg copy display name="Example: fullScreen" height="200px"
<App>
  <Spinner fullScreen="true" />
</App>
```

%-PROP-END
