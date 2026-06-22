%-DESC-START

`FileInput` enables users to select files from their device's file system for
upload or processing. The foundation slice preserves native browsing,
drag/drop, multiple-file display, accepted file filtering, button placement,
focus/change events, and the documented component APIs.

Full Form/FormItem binding, submit serialization, advanced CSV/JSON parsing
parity, and browser-specific directory picker verification are tracked by the
rebuild plan as follow-up compatibility work.

%-DESC-END

%-PROP-START acceptsFileType

```xmlui-pg copy display name="Example: acceptsFileType"
<App>
  <FileInput acceptsFileType="{['.txt', '.jpg']}" />
</App>
```

%-PROP-END

%-PROP-START multiple

```xmlui-pg copy display name="Example: multiple"
<App>
  <FileInput multiple="true" />
</App>
```

%-PROP-END

%-EVENT-START didChange

```xmlui-pg copy display name="Example: didChange"
<App var.field="">
  <FileInput onDidChange="(files) => field = files[0]?.name" />
  <Text value="{field}" />
</App>
```

%-EVENT-END

%-API-START focus

```xmlui-pg copy display name="Example: focus"
<App>
  <Button label="Focus FileInput" onClick="fileInputComponent.focus()" />
  <FileInput id="fileInputComponent" />
</App>
```

%-API-END
