import themeGallery from "./samples/theme-gallery.xmlui";

# Themes [#themes-definitions]

XMLUI ships with several built-in themes; you can discover them in this document.

## xmlui

This is the framework's default theme. We loved the simple and beautiful UI style used in the [Tabler.io](https://tabler.io/) project by [Paweł Kuna](https://github.com/codecalm), so we used it in this theme.

This theme is available in several color variants through these theme IDs:
- `xmlui` (default theme with blueish colors)
- `xmlui-green`
- `xmlui-gray`
- `xmlui-orange`
- `xmlui-purple`
- `xmlui-cyan`
- `xmlui-red`

```xmlui-pg name="Theme: xmlui (light)"
---app
    <Theme tone="light" themeId="xmlui">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui (dark)"
---app
    <Theme tone="dark" themeId="xmlui">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-green`

```xmlui-pg name="Theme: xmlui-green (light)"
---app
    <Theme tone="light" themeId="xmlui-green">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-green (dark)"
---app
    <Theme tone="dark" themeId="xmlui-green">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-gray`

```xmlui-pg name="Theme: xmlui-gray (light)"
---app
    <Theme tone="light" themeId="xmlui-gray">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-gray (dark)"
---app
    <Theme tone="dark" themeId="xmlui-gray">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-orange`

```xmlui-pg name="Theme: xmlui-orange (light)"
---app
    <Theme tone="light" themeId="xmlui-orange">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-orange (dark)"
---app
    <Theme tone="dark" themeId="xmlui-orange">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-purple`

```xmlui-pg name="Theme: xmlui-purple (light)"
---app
    <Theme tone="light" themeId="xmlui-purple">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-purple (dark)"
---app
    <Theme tone="dark" themeId="xmlui-purple">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-cyan`

```xmlui-pg name="Theme: xmlui-cyan (light)"
---app
    <Theme tone="light" themeId="xmlui-cyan">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-cyan (dark)"
---app
    <Theme tone="dark" themeId="xmlui-cyan">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

### `xmlui-red`

```xmlui-pg name="Theme: xmlui-red (light)"
---app
    <Theme tone="light" themeId="xmlui-red">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 

```xmlui-pg name="Theme: xmlui-red (dark)"
---app
    <Theme tone="dark" themeId="xmlui-red">
      <App>
        <ThemeGallery />
      </App>
    </Theme>
---comp
<Component name="ThemeGallery">
  <VStack>
    <HStack>
        <Button label="solid/primary" variant="solid" themeColor="primary"/>
        <Button label="outlined/primary" variant="outlined" themeColor="primary"/>
        <Button label="ghost/primary" variant="ghost" themeColor="primary"/>
    </HStack>
    <HStack>
        <Button label="solid/secondary" variant="solid" themeColor="secondary"/>
        <Button label="outlined/secondary" variant="outlined" themeColor="secondary"/>
        <Button label="ghost/secondary" variant="ghost" themeColor="secondary"/>
    </HStack>
    <HStack>
        <Button label="solid/attention" variant="solid" themeColor="attention"/>
        <Button label="outlined/attention" variant="outlined" themeColor="attention"/>
        <Button label="ghost/attention" variant="ghost" themeColor="attention"/>
    </HStack>
    <HStack>
        <Button label="disabled/solid" variant="solid" enabled="{false}"/>
        <Button label="disabled/outlined" variant="outlined" enabled="{false}"/>
        <Button label="disabled/ghost" variant="ghost" enabled="{false}"/>
    </HStack>
    <HStack>
       <Badge value="Badge"/>
       <Badge value="Long Pill" variant="pill"/>
    </HStack>
    <HStack>
       <Text value="Warning" color="$color-warn"/>
       <Text value="Danger" color="$color-danger"/>
       <Text value="Success" color="$color-success"/>
       <Text value="Info" color="$color-info"/>
    </HStack>
    <HStack>
      <Checkbox initialValue="false" label="Set or clear me!"/>
      <Checkbox initialValue="false" enabled="false" label="I'm not enabled"/>
      <Switch initialValue="false" label="Toggle me!"/>
      <Switch initialValue="true" enabled="false" label="I'm not enabled"/>
    </HStack>
    <FlowLayout>
      <TextBox width="50%" placeholder="John Smith"/>
      <NumberBox width="50%" initialValue="{12345}"/>
    </FlowLayout>
    <FlowLayout>
      <Text width="33%" variant="abbr">This is (abbr)</Text>
      <Text width="33%" variant="cite">This is (cite)</Text>
      <Text width="33%" variant="code">This is (code)</Text>
      <Text width="33%" variant="deleted">This is (deleted)</Text>
      <Text width="33%" variant="inserted">This is (inserted)</Text>
      <Text width="33%" variant="keyboard">This is (keyboard)</Text>
    </FlowLayout>
    <ProgressBar value="0.4"/>
    <HStack>
      <Avatar url="https://i.pravatar.cc/200" size="sm"/>
      <Avatar url="https://i.pravatar.cc/300" size="sm"/>
      <Spinner width="100px" />
    </HStack>
  </VStack>
</Component>
``` 
