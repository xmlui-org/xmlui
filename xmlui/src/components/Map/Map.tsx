import { createMetadata, d } from "@abstractions/ComponentDefs";
import { parseScssVar } from "@components-core/theming/themeVars";
import style from "@components/PieChart/PieChart.module.scss";
import { createComponentRendererNew } from "@components-core/renderers";
import type { CSSProperties } from "react";
import React, { Suspense } from "react";
import worldData from "./world_countries.json";
import { noop } from "lodash-es";

const ResponsiveChoropleth = React.lazy(() =>
  import("@nivo/geo").then((module) => ({ default: module.ResponsiveChoropleth })),
);

type MapProps = {
  data: any[];
  style?: CSSProperties;
};

const Map = ({ data = [], style }: MapProps) => {
  // lot of extra props, the issue is here: https://github.com/plouc/nivo/issues/2634
  return (
    <div style={style}>
      <Suspense>
        <ResponsiveChoropleth
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors="blues"
          domain={[0, 1000000]}
          unknownColor="transparent"
          label="properties.name"
          valueFormat=".2s"
          projectionTranslation={[0.5, 0.6]}
          projectionRotation={[0, 0, 0]}
          enableGraticule={true}
          graticuleLineColor="#dddddd"
          borderWidth={0.1}
          borderColor="#152538"
          features={worldData.features}
          // projectionType={"mercator"}
          projectionType={"equirectangular"}
          projectionScale={100}
          fillColor={"transparent"}
          graticuleLineWidth={0}
          isInteractive={true}
          onMouseEnter={noop}
          onMouseMove={noop}
          onMouseLeave={noop}
          onClick={noop}
          role={""}
          match={"id"}
          value={"value"}
          // @ts-ignore
          layers={["graticule", "features"]}
        />
      </Suspense>
    </div>
  );
};

const MapMd = createMetadata({
  description: "(*** OBSOLETE ***) A simple map component",
  props: {
    data: d("The data to be displayed in the map"),
  },
  themeVars: parseScssVar(style.themeVars),
  defaultThemeVars: {
    light: {
      ///
    },
    dark: {
      ///
    },
  },
});

export const mapComponentRenderer = createComponentRendererNew(
  "Map",
  MapMd,
  ({ extractValue, node, layoutCss }) => {
    return <Map data={extractValue(node.props?.data)} style={layoutCss} />;
  },
);
