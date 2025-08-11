import React from "react";
export default function TableInsertColumnIcon(props) {
  return (
    <svg
      viewBox="0 0 24 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="24"
      height="16"
      {...props}
    >
      <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
      <line x1="5.5" y1="3.5" x2="5.5" y2="11.5" />
      <line x1="9" y1="3.5" x2="9" y2="11.5" />
      <line x1="19" y1="6.5" x2="19" y2="9.5" />
      <line x1="17.5" y1="8" x2="20.5" y2="8" />
    </svg>
  );
}