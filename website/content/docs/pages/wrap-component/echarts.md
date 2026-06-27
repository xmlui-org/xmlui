# ECharts

ECharts is one of the most powerful charting libraries available -- heatmaps, treemaps, graph visualizations, geographic maps, 3D charts. It renders on canvas, which means CSS has no effect at all. Theming requires a third strategy beyond the [SCSS bridge](/docs/guides/wrap-component/gauge-theme) and [runtime style injection](/docs/guides/wrap-component/calendar-theme): injecting XMLUI design tokens directly into the ECharts option object at runtime.

## Option-level theming

The render component resolves the XMLUI color palette (`color-primary-500`, `color-success-500`, etc.) to actual color values via `useTheme()`, then merges them into the option as defaults. User-provided colors in the option override the defaults. Axis labels, tooltip backgrounds, legend text -- everything inherits from XMLUI tokens unless explicitly overridden.

This is the `useTheme()` pattern from the [Calendar](/docs/guides/wrap-component/calendar-theme) page, taken further. The calendar injects scoped CSS; ECharts injects a JavaScript object. Same hook, different target.

## Native event capture

Native event capture is comprehensive: clicks on data points, legend toggles, zoom/pan, brush selections, timeline changes. The render component maps each to a structured `onNativeEvent` call with a meaningful `displayLabel` -- for example, `"Commits → Wed = 150"` for a bar click, or `"TypeScript: hide"` for a legend toggle.

## Multi-series time series with zoom

Drag the slider handles below the chart to zoom into a date range.

```xmlui-pg
---app display
<App>
  <EChart
    aria-label="Demo time series chart"
    height="450px"
    option="{
      (() => {
        const days = [];
        const commits = [];
        const reviews = [];
        const deploys = [];
        const incidents = [];
        const d = new Date('2025-09-01');
        for (let i = 0; i < 180; i++) {
          days.push(new Date(d).toISOString().slice(0, 10));
          const dow = d.getDay();
          const weekend = dow === 0 || dow === 6;
          commits.push(weekend ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 40 + 10));
          reviews.push(weekend ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 25 + 5));
          deploys.push(weekend ? 0 : Math.floor(Math.random() * 4));
          incidents.push(Math.random() < 0.08 ? Math.floor(Math.random() * 3 + 1) : 0);
          d.setDate(d.getDate() + 1);
        }
        return {
          grid: { bottom: 100 },
          xAxis: { type: 'time' },
          yAxis: { type: 'value' },
          series: [
            { type: 'line', name: 'Commits', smooth: true, showSymbol: false, data: days.map((d, i) => [d, commits[i]]) },
            { type: 'line', name: 'Reviews', smooth: true, showSymbol: false, data: days.map((d, i) => [d, reviews[i]]) },
            { type: 'line', name: 'Deploys', smooth: true, showSymbol: false, data: days.map((d, i) => [d, deploys[i]]) },
            { type: 'line', name: 'Incidents', smooth: true, showSymbol: false, data: days.map((d, i) => [d, incidents[i]]) }
          ],
          tooltip: { trigger: 'axis' },
          legend: { bottom: 50 },
          dataZoom: [{ type: 'slider', bottom: 10 }]
        };
      })()
    }" />
</App>
```

## Line chart with toolbox

Click legend items to toggle series on and off.

```xmlui-pg id="line-chart-with-toolbox-b7d5"
---app display
<App>
  <EChart
    aria-label="Demo line chart with toolbox"
    height="400px"
    option="{
      {
        xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
        yAxis: { type: 'value' },
        series: [
          { type: 'line', name: 'Users', data: [820, 932, 901, 934, 1290, 1330, 1520, 1480, 1610, 1750, 1830, 1920], smooth: true },
          { type: 'line', name: 'Sessions', data: [1200, 1400, 1350, 1500, 1800, 2100, 2300, 2150, 2400, 2600, 2750, 2900], smooth: true }
        ],
        tooltip: { trigger: 'axis' },
        legend: {},
        toolbox: {
          feature: {
            magicType: { type: ['line', 'bar', 'stack'] },
            dataZoom: {},
            restore: {},
            saveAsImage: {}
          }
        }
      }
    }" />
</App>
```

## Donut chart

```xmlui-pg id="donut-chart-b851"
---app display
<App>
  <EChart
    aria-label="Demo donut chart"
    height="400px"
    option="{
      {
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { name: 'TypeScript', value: 45 },
            { name: 'Python', value: 25 },
            { name: 'Go', value: 15 },
            { name: 'Rust', value: 10 },
            { name: 'Other', value: 5 }
          ],
          label: { show: true, formatter: '{b}: {d}%' }
        }],
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, left: 'center' }
      }
    }" />
</App>
```

## Treemap -- filesystem storage

```xmlui-pg
---app display
<App>
  <EChart
    aria-label="Filesystem storage treemap"
    height="500px"
    option="{
      {
        series: [{
          type: 'treemap',
          roam: false,
          leafDepth: 2,
          levels: [
            { itemStyle: { borderWidth: 2, borderColor: '#666', gapWidth: 2 } },
            { itemStyle: { borderWidth: 1, borderColor: '#aaa', gapWidth: 1 }, upperLabel: { show: true, height: 20 } },
            { itemStyle: { borderWidth: 1, borderColor: '#ccc' } }
          ],
          data: [
            { name: 'src', value: 4200, children: [
              { name: 'components', value: 1800, children: [
                { name: 'Button.tsx', value: 120 },
                { name: 'Dialog.tsx', value: 280 },
                { name: 'Table.tsx', value: 450 },
                { name: 'Form.tsx', value: 380 },
                { name: 'Layout.tsx', value: 320 },
                { name: 'Chart.tsx', value: 250 }
              ]},
              { name: 'utils', value: 600, children: [
                { name: 'parser.ts', value: 220 },
                { name: 'format.ts', value: 180 },
                { name: 'validate.ts', value: 200 }
              ]},
              { name: 'core', value: 1200, children: [
                { name: 'engine.ts', value: 480 },
                { name: 'renderer.ts', value: 350 },
                { name: 'state.ts', value: 370 }
              ]},
              { name: 'styles', value: 600, children: [
                { name: 'theme.scss', value: 180 },
                { name: 'tokens.scss', value: 150 },
                { name: 'components.scss', value: 270 }
              ]}
            ]},
            { name: 'node_modules', value: 12000, children: [
              { name: 'react', value: 2800 },
              { name: 'echarts', value: 3200 },
              { name: 'typescript', value: 2100 },
              { name: '@tiptap', value: 1800 },
              { name: 'radix-ui', value: 1200 },
              { name: 'other', value: 900 }
            ]},
            { name: 'dist', value: 3500, children: [
              { name: 'bundle.js', value: 2200 },
              { name: 'vendor.js', value: 800 },
              { name: 'styles.css', value: 300 },
              { name: 'assets', value: 200 }
            ]},
            { name: 'tests', value: 1500, children: [
              { name: 'unit', value: 600 },
              { name: 'integration', value: 500 },
              { name: 'e2e', value: 400 }
            ]}
          ]
        }],
        tooltip: { formatter: function(p) { return p.name + ': ' + (p.value / 1000).toFixed(1) + ' MB'; } }
      }
    }" />
</App>
```

Click data points, toggle legend items, use the toolbox, drag the zoom slider to see native event traces. The charts rebuild with new colors on every theme or tone change.
