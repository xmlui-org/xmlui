import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { createContext, useContext } from "react";

type ChartContextType = {
  dataKey: string;
  nameKey: string;
  chartConfig: any;
  chartRegistry: any;
};

const ChartContext = createContext<ChartContextType | undefined>({
  dataKey: "",
  nameKey: "",
  chartConfig: {},
  chartRegistry: {},
});

export function useChart() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("useChart must be used within a ChartProvider");
  }
  return context;
}

export function useLabelList() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("LabelList must be used within a chart");
  }

  const { chartRegistry } = context;
  return {
    setLabelList: chartRegistry?.setLabelList,
  };
}

export function useLegend() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("Legend must be used within a chart");
  }

  const { chartRegistry } = context;
  return {
    setLegend: chartRegistry?.setLegend,
  };
}

type ChartProviderProps = {
  value: ChartContextType;
  children: ReactNode;
};

function ChartProvider({ value, children }: ChartProviderProps) {
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}

export default ChartProvider;
