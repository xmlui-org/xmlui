import React, { useEffect, useRef } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";

interface JSpreadsheetProps {
  worksheets: jspreadsheet.WorksheetOptions[];
}

const JSpreadsheet: React.FC<JSpreadsheetProps> = ({ worksheets }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      jspreadsheet(tableRef.current, {
        worksheets,
      });
    }
  }, []);

  return <div ref={tableRef} />;
};

export default JSpreadsheet;
