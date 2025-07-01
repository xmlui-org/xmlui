import React from "react";
export default function TableDeleteRowIcon(props) {
  return (
    <svg
      viewBox="0 0 24 16"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="1.5" y="1.5" width="13" height="11" rx="1" />
      <line x1="1.5" y1="5.5" x2="14.5" y2="5.5" />
      <line x1="1.5" y1="9.5" x2="14.5" y2="9.5" />
      {/* Minus sign for delete */}
      <line x1="17" y1="8" x2="21" y2="8" />
    </svg>
  );
}