## Reactive

Your apps are reactive out of the box. It's easy. No React expertise required.

```xmlui-pg display name="Watch the table reactively update when lines.value changes" /id="lines"/ /lines.value/
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
        <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>

  <DataSource
    id="stations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations"/>

  <Table data="{stations}" height="200px">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
```

## The Backstory

XMLUI started as an internal project at /n software, a well-known provider of secure networking components and backend middleware. When we tried to build web-based admin interfaces, the core engineering team — experienced backend developers whose interactions with UI technology were limited to old-school battleship-gray Visual Basic, Delphi, or .Net/Winform — were surprised by the complexity of modern web development.

So we recruited a team of JavaScript/React wizards to build the new semantic layer that is XMLUI. We are shipping the framework in our products, and will continue to fund and support this free and open source project. We hope you'll help take it farther than we can on our own.

Why XML? It was a natural choice for us, but its simplicity, expressiveness, and simple extensibility have proven its worth.
