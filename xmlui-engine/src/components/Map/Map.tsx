import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import { parseScssVar } from "@components-core/theming/themeVars";
import style from "@components/PieChart/PieChart.module.scss";
import { createComponentRenderer } from "@components-core/renderers";
import React, { CSSProperties, Suspense } from "react";
import worldData from "./world_countries.json";

const ResponsiveChoropleth = React.lazy(() =>
  import("@nivo/geo").then((module) => ({ default: module.ResponsiveChoropleth }))
);

type MapProps = {
  data: any[];
  style?: CSSProperties;
};

const Map = ({ data = [], style }: MapProps) => {
  return (
    <div style={style}>
      <Suspense>
        <ResponsiveChoropleth
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors="nivo"
          domain={[0, 1000000]}
          unknownColor="#666666"
          label="properties.name"
          valueFormat=".2s"
          projectionTranslation={[0.5, 0.5]}
          projectionRotation={[0, 0, 0]}
          enableGraticule={true}
          graticuleLineColor="#dddddd"
          borderWidth={0.5}
          borderColor="#152538"
          features={worldData.features}
        />
      </Suspense>
    </div>
  );
};

interface MapDef extends ComponentDef<"Map"> {
  props: {
    data: object[];
  };
}

const metadata: ComponentDescriptor<MapDef> = {
  displayName: "Map",
  description: "A pie chart component",
  props: {
    data: desc("The data to be displayed in the pie chart"),
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
};

export const mapComponentRenderer = createComponentRenderer<MapDef>(
  "Map",
  ({ extractValue, node, layoutCss }) => {
    return <Map data={extractValue(node.props?.data)} style={layoutCss} />;
  },
  metadata
);
