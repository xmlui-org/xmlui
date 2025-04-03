import React, { useEffect, useRef } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";

interface JSpreadsheetProps {
}

const JSpreadsheet: React.FC<JSpreadsheetProps> = ({ }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current) {
      jspreadsheet(tableRef.current, {
        worksheets: [
          {
            data: [
              ["Hello", 13123, "", "Yes", true, "#AA4411"],
              ["World!", 8, "", "No", false, "#99BE23"],
            ],
            columns: [
              { type: "text", title: "Text" },
              { type: "numeric", title: "Numeric", mask: "$ #.##,00", decimal: "," },
              { type: "calendar", title: "Calendar" },
              { type: "dropdown", source: ["Yes", "No", "Maybe"] },
              { type: "checkbox", title: "Checkbox" },
              { type: "color", title: "Color", width: 50, render: "square" },
            ],
          },
        ],
      });
    }
  }, []);

  return <div ref={tableRef} />;
};

export default JSpreadsheet;
