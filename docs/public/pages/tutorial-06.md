# Slider

test

```xmlui-pg display
---app
<App>
  Test:
  <SliderDemo />
</App>
---comp
<Component name="SliderDemo">
<script>
function test() {
  return 'Hello from test()'
}
var testMessage = 'Hello from script!';
</script>
<Text>var: {testMessage} fn: { test() } </Text>
</Component>
```