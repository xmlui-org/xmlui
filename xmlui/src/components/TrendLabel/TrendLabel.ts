import { createMetadata, d } from "../../abstractions/ComponentDefs";
import type { CompoundComponentRendererInfo } from "../../abstractions/RendererDefs";
import { compoundComponentDefFromSource } from "../../components-core/utils/compound-utils";
// --- We cannot use this with nextra
//import componentSource from "./TrendLabel.xmlui?raw";

const COMP = "TrendLabel";

export const TrendLabelMd = createMetadata({
  status: "experimental",
  description: "This component displays a trend label.",
  props: {
    change: d("The change percentage."),
  },
});

const componentSource = `
<Component name="TrendLabel">
  <Fragment>
    <Text when="{$props.change > 0}" marginLeft="$space-tight" color="$color-valid">
      {Math.floor($props.change * 100)}% 
      <Icon name="trending-up" />
    </Text>
    <Text when="{$props.change === 0}" marginLeft="$space-tight" color="$color-warning">
      {Math.floor($props.change * 100)}% 
      <Icon name="trending-level" />
    </Text>
    <Text when="{$props.change < 0}" marginLeft="$space-tight" color="$color-error">
      {Math.floor($props.change * 100)}% 
      <Icon name="trending-down" />
    </Text>
  </Fragment>
</Component>
`;

export const trendLabelRenderer: CompoundComponentRendererInfo = {
  compoundComponentDef: compoundComponentDefFromSource(COMP, componentSource),
  metadata: TrendLabelMd,
};
