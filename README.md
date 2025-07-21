![NPM Version](https://img.shields.io/npm/v/xmlui?color=blue)
![Components](https://img.shields.io/badge/Components-92-brightgreen)
![Extension packages](https://img.shields.io/badge/Extension%20packages-7-brightgreen)
![Theme variables](https://img.shields.io/badge/theme%20variables-3639-brightgreen)

# XMLUI


**XMLUI** is a framework for building user interfaces declaratively, with XML markup and flexible theming.

**Easy to create**. Build on the web platform with little or no knowledge of React or CSS.

**Clean and modern**. Enjoy themes that look great out of the box and are easy to modify. Create experiences that meet expectations for modern web apps.

**Connected**. Read and write APIs with little or no scripting.

**Modular**. Use a comprehensive suite of [components](https://docs.xmlui.org/components/_overview) that you can extend with — again! — little or no scripting.

**Easy to deploy**. Just drop a handful of files onto a static webserver.

## See it in action

```xml
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
        <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>
  <DataSource
    id="tubeStations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations"/>
  <Table data="{tubeStations}" height="280px">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
```

![xmlui](https://github.com/user-attachments/assets/93523e15-be19-47d1-913d-d8016c1e44e4)


## Getting started

The fastest way to get started with XMLUI is to [download our starter kit](https://github.com/xmlui-org/xmlui-invoice/releases), which includes the XMLUI engine and `XMLUI Invoice` - a complete business application that demonstrates key features and common patterns.

### What's included

XMLUI Invoice: A complete business application with client and product management, invoice creation and tracking, search, and charts.

XMLUI engine: The core framework file.

XMLUI test server: A simple server to run the app.

### Quick start

Extract the files to a working folder and run the start script.

### See also

Visit [demo.xmlui.org](https://demo.xmlui.org) to explore a gallery of components.

Visit [docs.xmlui.org](https://docs.xmlui.org) for an introduction, a tutorial, and full documentation. The documentation site is itself an XMLUI app!

<a href="https://docs.xmlui.org"><img width="1285" alt="image" src="https://github.com/user-attachments/assets/9a54ae74-4f45-4079-a5d4-142e23fb4134" /></a>


## Contributing

We welcome contributions! If you have ideas for new features, suggestions, or find a bug, please open an issue. Pull requests are also encouraged. (Please read our [Contribution Guidelines](./CONTRIBUTING.md) before contributing.)

## Feature Requests

Have a feature request? Here's how to submit it:

If your feature request is not already listed in the [Issues](https://github.com/xmlui-org/xmlui/issues) section, please follow these steps:

1. Click on the link below to open the feature request template.
2. Fill out the template with as much detail as possible.
3. Submit the issue.

[New feature request](https://github.com/xmlui-org/xmlui/issues/new?template=feature_request.md)

## Bug Reports

Have you found a bug? Here's how to report it:

1. Click on the link below to open the bug report template.
2. Fill out the template with as much detail as possible.
3. Submit the issue.

[New bug report](https://github.com/xmlui-org/xmlui/issues/new?template=bug_report.md)

## License

XMLUI is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Attribution

XMLUI was stared as an internal project at [/n software](https://nsoftware.com) which is the primary sponsor and source of funding for this open source project.

Our virtualized components and data management mechanisms would not be as simple, performant, and powerful without the help of a few [TanStack](https://github.com/TanStack) projects, such as [query](https://github.com/TanStack/query), [table](https://github.com/TanStack/table), and others. We appreciate their outstanding work!

We based some of our essential components on [Radix UI](https://www.radix-ui.com/) components and involved some of the architectural approaches they used in their project. Thanks to all project contributors for their excellent work.

We loved the simple and beautiful UI style used by the [Tabler.io](https://tabler.io/) project; it illuminated our component design and theming. Thanks to [Paweł Kuna](https://github.com/codecalm) for this inspiration.

