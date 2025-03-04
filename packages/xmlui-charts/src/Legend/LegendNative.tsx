import * as RechartsPrimitive from "recharts";
import * as React from "react";
import { useLegend } from "../utils/ChartProvider";
import { useEffect, useMemo } from "react";

const RLegend = RechartsPrimitive.Legend;

type Props = {
  verticalAlign?: RechartsPrimitive.LegendProps["verticalAlign"];
  align?: RechartsPrimitive.LegendProps["align"];
};

export const Legend = ({ verticalAlign, align }: Props) => {
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
