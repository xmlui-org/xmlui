import React from "react";
export default function TableInsertRowIcon(props) {
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
      <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
      <line x1="1.5" y1="13.5" x2="14.5" y2="13.5" />
      <line x1="19" y1="10" x2="19" y2="14" />
      <line x1="17" y1="12" x2="21" y2="12" />
    </svg>
  );
}
