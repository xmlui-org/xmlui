type EvalBindingOptions = {
  localContext?: Record<string, unknown>;
  [key: string]: unknown;
};

export function evalBinding(expression: unknown, options: EvalBindingOptions = {}): unknown {
  if (typeof expression === "function") {
    return expression(options.localContext ?? {});
  }
  if (typeof expression !== "string") {
    return expression;
  }
  const context = options.localContext ?? {};
  const names = Object.keys(context);
  const values = names.map((name) => context[name]);
  return Function(...names, `"use strict"; return (${expression});`)(...values);
}
