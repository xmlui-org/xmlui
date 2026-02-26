## Simple

Here's all the code you need to fetch data from an API and display it in table.

```xmlui-pg display height="200px" name="live status of London tube lines"
<App>
  <Table data="https://api.tfl.gov.uk/line/mode/tube/status">
     <Column bindTo="name" />
     <Column header="status" >
      {$item.lineStatuses[0].statusSeverityDescription}
     </Column>
  </Table>
</App>
```

## Professional

Your apps look good and behave gracefully out of the box. Want a different look? It's easy. No CSS expertise required.

```xmlui-pg height="400px" name="Pick a theme"
<App var.theme="default">
  <VStack gap="$space-4" padding="$space-4">
    <HStack verticalAlignment="center">
      <Text variant="strong">Theme</Text>
      <Select initialValue="default" width="160px"
        onDidChange="(v) => theme = v">
        <Option value="default" label="Default" />
        <Option value="earthtone" label="Earthtone" />
      </Select>
    </HStack>
    <Theme
      color-primary="{theme === 'earthtone' ? 'hsl(25, 60%, 25%)' : ''}"
      color-secondary="{theme === 'earthtone' ? 'hsl(95, 45%, 20%)' : ''}"
      color-surface="{theme === 'earthtone' ? 'hsl(85, 25%, 92%)' : ''}">
      <VStack gap="$space-4">
        <HStack gap="$space-2">
          <Button label="Primary" />
          <Button label="Secondary" themeColor="secondary" />
          <Button label="Outlined" variant="outlined" />
        </HStack>
        <HStack gap="$space-4" verticalAlignment="center">
          <Badge value="Active" />
          <Badge value="Pending" variant="pill" />
          <Checkbox label="Enable notifications" initialValue="{true}" />
        </HStack>
        <ProgressBar value="0.6" />
        <TextBox placeholder="Enter your name" label="Name" />
      </VStack>
    </Theme>
  </VStack>
</App>
```
