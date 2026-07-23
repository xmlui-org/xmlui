# xmlui-echart

XMLUI component wrapper for [Apache ECharts](https://echarts.apache.org/).

## GeoJSON maps

A `map`-type series requires its map to be registered with ECharts first.
The `maps` prop takes an object of `name → GeoJSON` and calls
`echarts.registerMap(name, geojson)` for each entry before the option is
applied:

```xmlui
<DataSource id="regionGeo" url="/resources/my-region.geojson" />
<EChart
  maps="{{ 'my-region': regionGeo.value }}"
  option="{{
    series: [{ type: 'map', map: 'my-region', data: [
      { name: 'Springfield', value: 41 },
      { name: 'Shelbyville', value: 27 },
    ]}],
    visualMap: { min: 0, max: 100, calculable: true },
  }}" />
```

Series `data` names join against each GeoJSON feature's `properties.name`.
Binding a not-yet-loaded DataSource value is safe: empty entries are
skipped, and the chart re-renders when the data arrives.

## License

The source code of this package is MIT licensed.

This package depends on [Apache ECharts](https://echarts.apache.org/) (`echarts`) and
[echarts-for-react](https://github.com/hustcc/echarts-for-react), both of which are licensed under the
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

If you bundle this package in a distributed application, the Apache 2.0 attribution and notice
requirements apply to the ECharts portions of the bundle.
