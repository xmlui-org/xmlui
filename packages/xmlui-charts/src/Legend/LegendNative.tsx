import * as RechartsPrimitive from "recharts";
import { useLegend } from "../utils/ChartProvider";
import { useEffect, useMemo } from "react";
import type {
  HorizontalAlignmentType,
  VerticalAlignmentType,
} from "recharts/types/component/DefaultLegendContent";

const RLegend = RechartsPrimitive.Legend;

type Props = {
  verticalAlign?: VerticalAlignmentType;
  align?: HorizontalAlignmentType;
};

export const verticalAlignmentValues: VerticalAlignmentType[] = [
  "top",
  "bottom",
  "middle",
] as const;
export const horizontalAlignmentValues: HorizontalAlignmentType[] = [
  "left",
  "right",
  "center",
] as const;

export const defaultProps: Pick<Props, "verticalAlign" | "align"> = {
  verticalAlign: "bottom",
  align: "center",
};

export const Legend = ({
  verticalAlign = defaultProps.verticalAlign,
  align = defaultProps.align,
}: Props) => {
  const { setLegend } = useLegend();

  const content = useMemo(
    () => <RLegend align={align} verticalAlign={verticalAlign} />,
    [align, verticalAlign],
  );

  useEffect(() => {
    setLegend(content);
  }, [content, setLegend]);

  return null;
};
