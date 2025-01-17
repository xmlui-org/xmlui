/**
 * This function calculates the average of the specified values and returns it.
 * @param values Values to calculate the average
 * @param decimals Number of decimal places to round the result
 */
function avg(values: number[], decimals?: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sumValues = sum(values);
  const result = sumValues / values.length;
  return decimals ? Number(result.toFixed(decimals)) : result;
}

/**
 * This function calculates the sum of the specified values and returns it.
 * @param values Values to calculate the sum
 */
function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

export const mathFunctions = {
  avg,
  sum
};