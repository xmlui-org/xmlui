export default function invariant(
  condition: unknown,
  format?: string,
  ...args: unknown[]
): asserts condition {
  if (condition) {
    return;
  }
  if (format === undefined) {
    throw new Error(
      "Minified exception occurred; use the non-minified dev environment for the full message.",
    );
  }
  let index = 0;
  const message = format.replace(/%s/g, () => String(args[index++]));
  const error = new Error(message);
  error.name = "Invariant Violation";
  throw error;
}
