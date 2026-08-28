export const defaultProps = {
  canSort: true,
  canResize: undefined,
  // undefined means "inherit": the Table's defaultSortDirection, then the app
  // config default, then "ascending".
  defaultSortDirection: undefined as "ascending" | "descending" | undefined,
};
