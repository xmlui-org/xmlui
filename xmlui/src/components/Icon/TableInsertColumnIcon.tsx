import React from "react";
export default function TableInsertColumnIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="1.5" y="5.5" width="13" height="11" rx="1" />
      <line x1="5.5" y1="7.5" x2="5.5" y2="15.5" />
      <line x1="9" y1="7.5" x2="9" y2="15.5" />
      <line x1="19" y1="10.5" x2="19" y2="13.5" />
      <line x1="17.5" y1="12" x2="20.5" y2="12" />
    </svg>
  );
}
