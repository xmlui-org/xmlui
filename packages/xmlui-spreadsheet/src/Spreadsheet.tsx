import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import JSpreadsheet from "./SpreadsheetNative";

const COMP = "Spreadsheet";

export const SpreadsheetMd = createMetadata({
  description: "XMLUI Spreadsheet",
  status: "experimental",
  props: {
    worksheets: {
      description: "This property sets the initial value of the spreadsheet's worksheets.",
    },
  },
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const spreadsheetComponentRenderer = createComponentRenderer(
  COMP,
  SpreadsheetMd,
  ({ extractValue, node, renderChild }: any) => {
    return <JSpreadsheet worksheets={extractValue(node.props.worksheets)} />;
  },
);
