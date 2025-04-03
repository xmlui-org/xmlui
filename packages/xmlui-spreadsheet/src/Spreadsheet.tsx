import { createComponentRenderer, createMetadata, parseScssVar } from "xmlui";
import JSpreadsheet from "./SpreadsheetNative";

const COMP = "Spreadsheet";

export const SpreadsheetMd = createMetadata({
  description: "XMLUI Spreadsheet",
  status: "experimental",
  props: {
  },
  themeVars: parseScssVar({}),
  defaultThemeVars: {},
});

export const spreadsheetComponentRenderer = createComponentRenderer(
  COMP,
  SpreadsheetMd,
  ({ extractValue, node, layoutCss, renderChild }: any) => {
    return (
      <JSpreadsheet />
    );
  },
);
