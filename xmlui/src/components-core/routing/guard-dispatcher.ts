export type GuardResult =
  | { allow: true }
  | { allow: false; redirect?: string; reason?: string };

export type NavigationTrigger = "navigate" | "popstate" | "initial" | "external";

export type GuardFn = (
  to: {
    pathname: string;
    routeParams: Record<string, unknown>;
    search: string;
    trigger: NavigationTrigger;
  },
  from: { pathname: string } | null,
) => GuardResult | Promise<GuardResult>;

export async function runGuard(
  guard: GuardFn | undefined,
  to: Parameters<GuardFn>[0],
  from: Parameters<GuardFn>[1],
): Promise<GuardResult> {
  if (!guard) return { allow: true };
  const result = await guard(to, from);
  return result ?? { allow: true };
}
