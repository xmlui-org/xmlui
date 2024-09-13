import type { IconBaseProps } from "./IconNative";

export const SortDescendingIcon = (props: IconBaseProps) => {
  return (
    <svg 
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      {...props}
    >
      <rect id="sortasc" x="0" y="0" width="24" height="24" fill="none" />
      <path d="M12,2l7,8l-14,-0l7,-8Z" fill="currentColor" fillOpacity={0.5} />
      <path d="M12,22l-7,-8l14,-0l-7,8Z" fill="currentColor" />
    </svg>
  )
}
