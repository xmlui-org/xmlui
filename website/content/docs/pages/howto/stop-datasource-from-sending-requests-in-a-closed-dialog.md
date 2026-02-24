# Stop DataSource from sending requests in a closed ModalDialog

When you control the visibility of a `ModalDialog` using its `open` and `close` exposed methods, you may encounter issues with a nested `DataSource` that has reactive dependencies outside the dialog.

> [!INFO] Note that this issue does not occur when you control the `ModalDialog`'s visibility with the when property.

The `DataSource` in the following app sends network requests even if the `ModalDialog` is closed. You can check it by typing something into the textbox and looking at the Network tab in your browser’s devtools.

```xmlui-pg copy display name="Example: DataSource within a ModalDialog" height="400px"
---app display copy
<App>
	<TextBox id="msg" label="Type something to echo:" />
	<ModalDialog id="dialog" title="Example Dialog">
		<DataSource id="echo" url="/api/echo/{msg.value || 'none'}" />
		<H2>
			Echoed Message: {echo.value}
		</H2>
		<Button testId="closeBtn" label="Close Dialog" onClick="dialog.close()" />
	</ModalDialog>
	<Button testId="openBtn" label="Open Dialog" onClick="dialog.open()" />
</App>
---api
{
	"operations": {
		"echo": {
      "url": "/api/echo/:msg",
      "method": "get",
      "handler": "return $pathParams.msg;"
    }
	}
}
```

You expect a `DataSource` in a hidden `ModalDialog` to be inactive. However, due to architectural decisions, the `DataSource` remains active. The URL depends on the `TextBox` outside the `ModalDialog`, so changes to the text value trigger a refresh of the DataSource.

You can prevent the `ModalDialog` from this behavior by wrapping the contents of the `ModalDialog` in a Fragment:

```xmlui-pg copy display name="Example: DataSource within a ModalDialog" height="400px"
---app display copy {4,10}
<App>
	<TextBox id="msg" label="Type something to echo:" />
	<ModalDialog id="dialog" title="Example Dialog">
	  <Fragment>
			<DataSource id="echo" url="/api/echo/{msg.value || 'none'}" />
			<H2>
				Echoed Message: {echo.value}
			</H2>
			<Button testId="closeBtn" label="Close Dialog" onClick="dialog.close()" />
		</Fragment>
	</ModalDialog>
	<Button testId="openBtn" label="Open Dialog" onClick="dialog.open()" />
</App>
---api
{
	"operations": {
		"echo": {
      "url": "/api/echo/:msg",
      "method": "get",
      "handler": "return $pathParams.msg;"
    }
	}
}
---desc
Try the modified app: it will send the network refresh only when the dialog is open.
```
