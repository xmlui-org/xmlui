import type { ReactNode } from "react";
import { useState } from "react";
import { createContext, useContext } from "react";

type ChartContextType = {
  dataKey: string;
  dataKeys: string[];
  nameKey: string;
  labelList: any;
  setLabelList: any;
  legend: any;
  setLegend: any;
};

const ChartContext = createContext<ChartContextType | undefined>({
  dataKey: "",
  nameKey: "",
  dataKeys: [],
  labelList: null,
  setLabelList: () => {},
  legend: null,
  setLegend: () => {},
});

export function useChartContextValue({
  dataKey = "",
  dataKeys = [],
  nameKey = "",
}: {
  dataKey?: string;
  dataKeys?: string[];
  nameKey: string;
}) {
  const [dKey] = useState(dataKey);
  const [dKeys] = useState(dataKeys);
  const [nKey] = useState(nameKey);
  const [labelList, setLabelList] = useState(null);
  const [legend, setLegend] = useState(null);

  return {
    dataKey: dKey,
    nameKey: nKey,
    dataKeys: dKeys,
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
