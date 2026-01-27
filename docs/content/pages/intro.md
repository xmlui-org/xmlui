# Introduction

XMLUI is a framework for building user interfaces declaratively, with XML markup and flexible theming. XMLUI apps are:

> [!FEAT] **Easy to create**. Build on the web platform with little or no knowledge of React or CSS.

> [!FEAT] **Clean and modern**. Enjoy themes that look great out of the box and are easy to modify. Create experiences that meet expectations for modern web apps.

> [!FEAT] **Connected**. Read and write APIs with little or no scripting.

> [!FEAT] **Modular**. Use a comprehensive suite of [components](/components/_overview) that you can extend with — again! — little or no scripting.

> [!FEAT] **Easy to deploy**. Just drop a handful of files onto a static webserver.

This paragraph is static text displayed by XMLUI's [Markdown](/components/Markdown) component.

Here is a tiny app that reports the status of London's tube stations.

```xmlui-pg name="London Tube Status"
---app display
<App>
  <List data="https://api.tfl.gov.uk/line/mode/tube/status">
     <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
  </List>
</App>
```

Let's unpack the concepts behind this example.

> [!DEF] **Markup**. You write XMLUI apps in a declarative style using XML tags and attributes.

> [!DEF] **Components**. [App](https://docs.xmlui.org/components/App), [List](https://docs.xmlui.org/components/List), and [Text](https://docs.xmlui.org/components/Text) are some of the [components](/components/_overview) you can invoke in XMLUI markup.

> [!DEF] **Properties**. You configure components using properties like the `data` property on the `List`.

> [!DEF] **Data**. The `data` property fetches from a URL and provides a JSON object to components that use it.

> [!DEF] **Context**. A variety of [context variables](http://localhost:5173/context-variables) are available to certain components. Here `$item` implicitly receives each of the tube stations represented in the top-level array returned from the API.

> [!DEF] **Expressions**. Inside the `Text` component there are two expressions delimited by curly braces, one extracts the name of the station and another drills deeper into the `$item` to retrieve status, using JavaScript dot notation and array indexing.

The app runs directly in this page, and you can open it for editing in a [playground](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE1VRO2%2FCMBD%2BK9aJMcQsXawUqVJHOoG6AIPBB5yanC37wqNR%2FntlA626%2Bbv7XtYNkMSys61nBDOADQEMNG8hzDesVLOgJMpZsa8bOImEZLS2gWo5tPXRn%2Bv%2BS7fEqDvvUEu%2FQ53ESp82UPRKqWaFV5kPExLsarYdjkY9UFYuCx3Terat79IlnjGS3N4x7SMFIc9jo4tLqaRzp%2FmGG31vCRXsfRc8I0sCs95mzAc65v%2FkQDCw8Ow8q1W%2FQ3VPhArkhB1mxQDkwMC1a3uaOr%2FPS7wKskvPcQlpfQQDk%2FKYhkidjbfpy2z29Pq0MYEZxnE7jhX4Uj0P4EBXdKtMAXOwbcIK0sWGgO4Xh4hnwsuHd38cHwlZbLYBAycf6duz2BYqsHuhMz4s%2Fzd%2FrMpBoaXjSUp5FmQBUy48jj9OtjA1%2BAEAAA%3D%3D).

How to deploy it as a standalone web application?

1. Create an `index.html` that loads the XMLUI engine which is a single JavaScript file.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://xmlui.org/xmlui.js"></script>
</head>
<body>
</body>
</html>
```

2. In the same directory create `Main.xmlui` like so.

```xmlui
<App>
  <List data="https://api.tfl.gov.uk/line/mode/tube/status">
     <Text>{$item.name}: {$item.lineStatuses[0].statusSeverityDescription}</Text>
  </List>
</App>
```

3. Use any static webserver to load the app. In the folder with `index.html` and `Main.xmlui` you can use Node (`npx -y http-server -o`) or Python (python -m http.server 8000) or any other server that runs static web apps. You can also use static cloud hosting, for example by dropping the folder onto Netlify or pushing it to an AWS bucket.

If you are familiar with the React framework a key insight is that no build is required: the XMLUI engine loads and renders XMLUI files. If you are unfamiliar with React and don't know what a "build" means then XMLUI enables you to remain blissfully unaware of that complex process!

In example the URL is static. In the next chapter you'll see how a data URL can vary to deliver changing data in response to UI interaction. That's called reactivity, another concept from the React world that becomes much simpler in XMLUI.

