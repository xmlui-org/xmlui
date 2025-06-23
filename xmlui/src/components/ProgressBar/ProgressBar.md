%-DESC-START

**Key features:**
- **Percentage visualization**: Displays progress as a filled portion of a horizontal bar
- **Flexible value handling**: Accepts values from 0 to 1, with automatic bounds handling for out-of-range values
- **Extensive theming**: Customizable background color, indicator color, thickness, and border radius
- **Responsive design**: Adapts to container width while maintaining consistent height

%-DESC-END

%-PROP-START value

The following example demonstrates using it:

```xmlui-pg copy {2-6} display name="Example: value" height="200px"
<App>
  <ProgressBar />
  <ProgressBar value="0.2"/>
  <ProgressBar value="0.6"/>
  <ProgressBar value="1"/>
  <ProgressBar value="1.2"/>
</App>
```

%-PROP-END
