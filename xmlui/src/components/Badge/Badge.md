%-PROP-START value

```xmlui-pg copy display name="Example: value" 
<App>
  <Badge value="Example badge" />
</App>  
```

%-PROP-END

%-PROP-START variant

```xmlui-pg copy display name="Example: variant"
<App>
  <Badge value="Example badge" variant="badge" />
  <Badge value="Example pill" variant="pill" />
</App>
```

%-PROP-END

%-PROP-START colorMap

1. Only change the background color

```xmlui-pg copy display {2} name="Example: only background color"
<App var.simpleColorMap="{{ important: 'red', regular: 'blue', unimportant: 'black' }}">
  <Badge value="important" colorMap="{simpleColorMap}" />
</App>
```

2. Change the background and label color

```xmlui-pg copy display {2-5} name="Example: background and label color"
<App 
  var.simpleColorMap="{{ 
    important: { label: 'red', background: 'pink' }, 
    unimportant: { label: 'black', background: 'gray' }
  }}">
  <Badge value="important" colorMap="{simpleColorMap}" />
  <Badge value="unimportant" colorMap="{simpleColorMap}" />
  <Badge value="other" colorMap="{simpleColorMap}" />
</App>
```

%-PROP-END

%-PROP-START indicatorPosition

The value of this optional property sets the string to provide a color scheme for the Alert.

| Value          | Description                                                          |
| :------------- | :------------------------------------------------------------------- |
| `start`        | The indicator is displayed within the badge before its text          |
| `end`          | The indicator is displayed within the badge after its text           |
| `top-start`    | The indicator is displayed over the badge in the top-start corner    |
| `top-end`      | The indicator is displayed over the badge in the top-end corner      |
| `bottom-start` | The indicator is displayed over the badge in the bottom-start corner |
| `bottom-end`   | The indicator is displayed over the badge in the bottom-end corner   |

%-PROP-END
