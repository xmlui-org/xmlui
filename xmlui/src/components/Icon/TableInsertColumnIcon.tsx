import React from "react";
export default function TableInsertColumnIcon(props) {
  return (
    <svg
      viewBox="0 0 24 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2.5" y="3" width="11" height="9" rx="1" />
      <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
      <line x1="9" y1="3.5" x2="9" y2="11.5" />
      <line x1="19" y1="6.5" x2="19" y2="9.5" />
      <line x1="17.5" y1="8" x2="20.5" y2="8" />
    </svg>
  );
}