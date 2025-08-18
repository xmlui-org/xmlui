import type { ReactNode } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";

type ChartContextType = {
  dataKey: string;
  xKeys: string[];
  yKey: string;
  labelList: any;
  setLabelList: any;
  legend: any;
  setLegend: any;
};

const ChartContext = createContext<ChartContextType | undefined>({
  dataKey: "",
  xKeys: [],
  yKey: "",
  labelList: null,
  setLabelList: () => {},
  legend: null,
  setLegend: () => {},
});

export function useChartContextValue({
  dataKey = "",
  xKeys = [],
  yKey = "",
}: {
  dataKey?: string;
  xKeys?: string[];
  yKey?: string;
}) {
  const [dKey] = useState(dataKey);
  const [dKeys] = useState(xKeys);
  const [nKey] = useState(yKey);
  const [labelList, setLabelList] = useState(null);
  const [legend, setLegend] = useState(null);

  return {
    dataKey: dKey,
    xKeys: dKeys,
    yKey: nKey,
    labelList,
    setLabelList,
    legend,
    setLegend,
  };
}

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

  const { setLabelList } = context;
  return {
    setLabelList,
  };
}

export function useLegend() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error("Legend must be used within a chart");
  }

  const { setLegend } = context;
  return {
    setLegend,
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
