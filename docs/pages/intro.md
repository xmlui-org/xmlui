# Introduction

XMLUI is a framework for building user interfaces declaratively, with XML markup and flexible theming. XMLUI apps are:

- **Easy to create**. Build on the web platform with little or no knowledge of React or CSS.
- **Clean and modern**. Enjoy themes that look great out of the box and are easy to modify. Create experiences that meet expectations for modern web apps.
- **Connected**. Read and write APIs with little or no scripting.
- **Modular**. Use a comprehensive suite of [components](/components/_overview) that you can extend with — again! — little or no scripting.
- **Easy to deploy**. Just drop a handful of files onto a static webserver.

This paragraph is static text displayed by XMLUI's [Markdown](/components/Markdown) component.

This list is a live report on the status of London's tube stations.

```xmlui-pg name="London Tube Status"
<App>
  <List data="https://api.tfl.gov.uk/line/mode/tube/status">
     <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
  </List>
</App>
```

When you reload the page you'll see fresh data.

> [!INFO]
> You can use the ![](/resources/pg-popout.svg) icon to open live elements, like the London Tube Status report, in a playground where you read and edit the XMLUI markup.

This is the XMLUI markup you'll see in the playground.

```xmlui
<List data="https://api.tfl.gov.uk/line/mode/tube/status">
  <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
</List>
```

The [List](/components/List) component fetches JSON from a <a href="https://api.tfl.gov.uk/line/mode/tube/status" target="_blank">REST endpoint</a>, iterates through the array of objects returned from the API, and updates the [context variable](context-variables) called `$item` for each object. The [Text](/components/Text) component uses JavaScript dot notation and array indexing to extract station names and statuses from each `$item`.

In this case the URL is static. In the next chapter you'll see how a data URL can vary to deliver changing data in response to UI interaction.
